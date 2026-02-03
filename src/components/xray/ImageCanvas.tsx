import { useRef, useState, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import type { AnnotationTool } from "./AnnotationToolbar";

interface Annotation {
  id: string;
  type: AnnotationTool;
  points: { x: number; y: number }[];
  color: string;
  text?: string;
}

interface ImageCanvasProps {
  imageSrc: string | null;
  activeTool: AnnotationTool;
  zoom: number;
  position: { x: number; y: number };
  isPanning: boolean;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const ANNOTATION_COLORS = {
  marker: "#f43f5e",   // Rose - stands out for important points
  box: "#22c55e",      // Green
  circle: "#3b82f6",   // Blue
  line: "#f59e0b",     // Amber
  freehand: "#ef4444", // Red
  ruler: "#8b5cf6",    // Purple
  angle: "#06b6d4",    // Cyan
  text: "#a855f7",     // Purple
  select: "#ffffff",
  eraser: "#ffffff",
};

const ImageCanvas = ({
  imageSrc,
  activeTool,
  zoom,
  position,
  isPanning,
  annotations,
  onAnnotationsChange,
  onPositionChange,
}: ImageCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [angleStep, setAngleStep] = useState<number>(0); // 0: start, 1: vertex, 2: end

  const getRelativePosition = (e: MouseEvent): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - position.x) / zoom,
      y: (e.clientY - rect.top - position.y) / zoom,
    };
  };

  // Check if a point is near an annotation for eraser
  const isPointNearAnnotation = (pos: { x: number; y: number }, annotation: Annotation): boolean => {
    const threshold = 15 / zoom; // Adjust threshold based on zoom

    switch (annotation.type) {
      case "marker":
        if (annotation.points.length < 1) return false;
        const markerDist = Math.sqrt(
          Math.pow(annotation.points[0].x - pos.x, 2) +
          Math.pow(annotation.points[0].y - pos.y, 2)
        );
        return markerDist < threshold + 8; // Marker radius + threshold

      case "box":
        if (annotation.points.length < 2) return false;
        const [boxStart, boxEnd] = annotation.points;
        const minX = Math.min(boxStart.x, boxEnd.x);
        const maxX = Math.max(boxStart.x, boxEnd.x);
        const minY = Math.min(boxStart.y, boxEnd.y);
        const maxY = Math.max(boxStart.y, boxEnd.y);
        // Check if near any edge
        const nearLeftEdge = Math.abs(pos.x - minX) < threshold && pos.y >= minY - threshold && pos.y <= maxY + threshold;
        const nearRightEdge = Math.abs(pos.x - maxX) < threshold && pos.y >= minY - threshold && pos.y <= maxY + threshold;
        const nearTopEdge = Math.abs(pos.y - minY) < threshold && pos.x >= minX - threshold && pos.x <= maxX + threshold;
        const nearBottomEdge = Math.abs(pos.y - maxY) < threshold && pos.x >= minX - threshold && pos.x <= maxX + threshold;
        return nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge;

      case "circle":
        if (annotation.points.length < 2) return false;
        const [circleCenter, circleEdge] = annotation.points;
        const radius = Math.sqrt(
          Math.pow(circleEdge.x - circleCenter.x, 2) +
          Math.pow(circleEdge.y - circleCenter.y, 2)
        );
        const distFromCenter = Math.sqrt(
          Math.pow(pos.x - circleCenter.x, 2) +
          Math.pow(pos.y - circleCenter.y, 2)
        );
        return Math.abs(distFromCenter - radius) < threshold;

      case "line":
      case "ruler":
        if (annotation.points.length < 2) return false;
        const [lineStart, lineEnd] = annotation.points;
        // Distance from point to line segment
        const lineLen = Math.sqrt(
          Math.pow(lineEnd.x - lineStart.x, 2) +
          Math.pow(lineEnd.y - lineStart.y, 2)
        );
        if (lineLen === 0) return false;
        const t = Math.max(0, Math.min(1,
          ((pos.x - lineStart.x) * (lineEnd.x - lineStart.x) +
           (pos.y - lineStart.y) * (lineEnd.y - lineStart.y)) / (lineLen * lineLen)
        ));
        const projX = lineStart.x + t * (lineEnd.x - lineStart.x);
        const projY = lineStart.y + t * (lineEnd.y - lineStart.y);
        const distToLine = Math.sqrt(Math.pow(pos.x - projX, 2) + Math.pow(pos.y - projY, 2));
        return distToLine < threshold;

      case "angle":
        if (annotation.points.length < 3) return false;
        // Check proximity to the two lines forming the angle
        for (let i = 0; i < 2; i++) {
          const start = annotation.points[i];
          const end = annotation.points[i + 1];
          const len = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          if (len === 0) continue;
          const t = Math.max(0, Math.min(1,
            ((pos.x - start.x) * (end.x - start.x) + (pos.y - start.y) * (end.y - start.y)) / (len * len)
          ));
          const projX = start.x + t * (end.x - start.x);
          const projY = start.y + t * (end.y - start.y);
          const dist = Math.sqrt(Math.pow(pos.x - projX, 2) + Math.pow(pos.y - projY, 2));
          if (dist < threshold) return true;
        }
        return false;

      case "freehand":
        if (annotation.points.length < 1) return false;
        return annotation.points.some(
          (p) => Math.sqrt(Math.pow(p.x - pos.x, 2) + Math.pow(p.y - pos.y, 2)) < threshold
        );

      case "text":
        if (annotation.points.length < 1) return false;
        const textWidth = 80 / zoom;
        const textHeight = 20 / zoom;
        return (
          pos.x >= annotation.points[0].x - threshold &&
          pos.x <= annotation.points[0].x + textWidth + threshold &&
          pos.y >= annotation.points[0].y - textHeight - threshold &&
          pos.y <= annotation.points[0].y + threshold
        );

      default:
        return false;
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!imageSrc) return;

    const pos = getRelativePosition(e);

    if (isPanning) {
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      return;
    }

    if (activeTool === "select") {
      return;
    }

    if (activeTool === "eraser") {
      // Find and remove annotation under cursor
      const annotationToRemove = annotations.find((ann) => isPointNearAnnotation(pos, ann));
      if (annotationToRemove) {
        onAnnotationsChange(annotations.filter((a) => a.id !== annotationToRemove.id));
      }
      return;
    }

    // Handle marker - single click to place
    if (activeTool === "marker") {
      const markerAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "marker",
        points: [pos],
        color: ANNOTATION_COLORS.marker,
      };
      onAnnotationsChange([...annotations, markerAnnotation]);
      return;
    }

    // Handle angle tool - requires 3 clicks
    if (activeTool === "angle") {
      if (angleStep === 0) {
        // First click - start point
        setCurrentAnnotation({
          id: Date.now().toString(),
          type: "angle",
          points: [pos],
          color: ANNOTATION_COLORS.angle,
        });
        setAngleStep(1);
      } else if (angleStep === 1 && currentAnnotation) {
        // Second click - vertex point
        setCurrentAnnotation({
          ...currentAnnotation,
          points: [...currentAnnotation.points, pos],
        });
        setAngleStep(2);
      } else if (angleStep === 2 && currentAnnotation) {
        // Third click - end point, complete angle
        const completedAngle: Annotation = {
          ...currentAnnotation,
          points: [...currentAnnotation.points, pos],
        };
        onAnnotationsChange([...annotations, completedAngle]);
        setCurrentAnnotation(null);
        setAngleStep(0);
      }
      return;
    }

    setIsDrawing(true);
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: activeTool,
      points: [pos],
      color: ANNOTATION_COLORS[activeTool],
    };
    setCurrentAnnotation(newAnnotation);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning && dragStart) {
      onPositionChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    if (!isDrawing || !currentAnnotation) return;

    const pos = getRelativePosition(e);

    if (currentAnnotation.type === "freehand") {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...currentAnnotation.points, pos],
      });
    } else {
      // For shapes, keep start and end points
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [currentAnnotation.points[0], pos],
      });
    }
  };

  const handleMouseUp = () => {
    if (dragStart) {
      setDragStart(null);
      return;
    }

    if (isDrawing && currentAnnotation && currentAnnotation.points.length >= 1) {
      // Don't save angle annotations here - they're handled in mouseDown
      if (currentAnnotation.type !== "angle") {
        onAnnotationsChange([...annotations, currentAnnotation]);
      }
    }
    setIsDrawing(false);
    if (currentAnnotation?.type !== "angle") {
      setCurrentAnnotation(null);
    }
  };

  const calculateAngle = (points: { x: number; y: number }[]): number => {
    if (points.length < 3) return 0;
    const [start, vertex, end] = points;
    
    // Vector from vertex to start
    const v1 = { x: start.x - vertex.x, y: start.y - vertex.y };
    // Vector from vertex to end
    const v2 = { x: end.x - vertex.x, y: end.y - vertex.y };
    
    // Calculate angle using dot product
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    const angleRad = Math.acos(cosAngle);
    return (angleRad * 180) / Math.PI;
  };

  const renderAnnotation = (annotation: Annotation, isTemp = false) => {
    const { type, points, color, id } = annotation;
    const opacity = isTemp ? 0.7 : 1;

    if (points.length < 1) return null;

    switch (type) {
      case "marker":
        return (
          <g key={id} opacity={opacity}>
            {/* Outer ring */}
            <circle
              cx={points[0].x}
              cy={points[0].y}
              r={10 / zoom}
              stroke={color}
              strokeWidth={2 / zoom}
              fill="none"
            />
            {/* Inner dot */}
            <circle
              cx={points[0].x}
              cy={points[0].y}
              r={3 / zoom}
              fill={color}
            />
            {/* Crosshair lines */}
            <line
              x1={points[0].x - 15 / zoom}
              y1={points[0].y}
              x2={points[0].x - 12 / zoom}
              y2={points[0].y}
              stroke={color}
              strokeWidth={1.5 / zoom}
            />
            <line
              x1={points[0].x + 12 / zoom}
              y1={points[0].y}
              x2={points[0].x + 15 / zoom}
              y2={points[0].y}
              stroke={color}
              strokeWidth={1.5 / zoom}
            />
            <line
              x1={points[0].x}
              y1={points[0].y - 15 / zoom}
              x2={points[0].x}
              y2={points[0].y - 12 / zoom}
              stroke={color}
              strokeWidth={1.5 / zoom}
            />
            <line
              x1={points[0].x}
              y1={points[0].y + 12 / zoom}
              x2={points[0].x}
              y2={points[0].y + 15 / zoom}
              stroke={color}
              strokeWidth={1.5 / zoom}
            />
          </g>
        );

      case "box":
        if (points.length < 2) return null;
        const [boxStart, boxEnd] = points;
        const boxWidth = boxEnd.x - boxStart.x;
        const boxHeight = boxEnd.y - boxStart.y;
        return (
          <rect
            key={id}
            x={Math.min(boxStart.x, boxEnd.x)}
            y={Math.min(boxStart.y, boxEnd.y)}
            width={Math.abs(boxWidth)}
            height={Math.abs(boxHeight)}
            stroke={color}
            strokeWidth={2 / zoom}
            fill="none"
            opacity={opacity}
          />
        );

      case "circle":
        if (points.length < 2) return null;
        const [circleStart, circleEnd] = points;
        const radius = Math.sqrt(
          Math.pow(circleEnd.x - circleStart.x, 2) +
          Math.pow(circleEnd.y - circleStart.y, 2)
        );
        return (
          <circle
            key={id}
            cx={circleStart.x}
            cy={circleStart.y}
            r={radius}
            stroke={color}
            strokeWidth={2 / zoom}
            fill="none"
            opacity={opacity}
          />
        );

      case "line":
      case "ruler":
        if (points.length < 2) return null;
        const [lineStart, lineEnd] = points;
        const distance = Math.sqrt(
          Math.pow(lineEnd.x - lineStart.x, 2) +
          Math.pow(lineEnd.y - lineStart.y, 2)
        ).toFixed(1);
        return (
          <g key={id} opacity={opacity}>
            <line
              x1={lineStart.x}
              y1={lineStart.y}
              x2={lineEnd.x}
              y2={lineEnd.y}
              stroke={color}
              strokeWidth={2 / zoom}
            />
            {type === "ruler" && (
              <>
                {/* End caps */}
                <line
                  x1={lineStart.x}
                  y1={lineStart.y - 6 / zoom}
                  x2={lineStart.x}
                  y2={lineStart.y + 6 / zoom}
                  stroke={color}
                  strokeWidth={2 / zoom}
                />
                <line
                  x1={lineEnd.x}
                  y1={lineEnd.y - 6 / zoom}
                  x2={lineEnd.x}
                  y2={lineEnd.y + 6 / zoom}
                  stroke={color}
                  strokeWidth={2 / zoom}
                />
                {/* Measurement label */}
                <rect
                  x={(lineStart.x + lineEnd.x) / 2 - 25 / zoom}
                  y={(lineStart.y + lineEnd.y) / 2 - 20 / zoom}
                  width={50 / zoom}
                  height={16 / zoom}
                  fill="rgba(0,0,0,0.7)"
                  rx={3 / zoom}
                />
                <text
                  x={(lineStart.x + lineEnd.x) / 2}
                  y={(lineStart.y + lineEnd.y) / 2 - 8 / zoom}
                  fill="white"
                  fontSize={11 / zoom}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {distance}px
                </text>
              </>
            )}
          </g>
        );

      case "angle":
        if (points.length < 2) return null;
        const angle = points.length === 3 ? calculateAngle(points) : 0;
        return (
          <g key={id} opacity={opacity}>
            {/* First line (start to vertex) */}
            <line
              x1={points[0].x}
              y1={points[0].y}
              x2={points[1].x}
              y2={points[1].y}
              stroke={color}
              strokeWidth={2 / zoom}
            />
            {/* Second line (vertex to end) */}
            {points.length >= 3 && (
              <>
                <line
                  x1={points[1].x}
                  y1={points[1].y}
                  x2={points[2].x}
                  y2={points[2].y}
                  stroke={color}
                  strokeWidth={2 / zoom}
                />
                {/* Arc to show angle */}
                {(() => {
                  const arcRadius = 25 / zoom;
                  const startAngle = Math.atan2(points[0].y - points[1].y, points[0].x - points[1].x);
                  const endAngle = Math.atan2(points[2].y - points[1].y, points[2].x - points[1].x);
                  
                  const startX = points[1].x + arcRadius * Math.cos(startAngle);
                  const startY = points[1].y + arcRadius * Math.sin(startAngle);
                  const endX = points[1].x + arcRadius * Math.cos(endAngle);
                  const endY = points[1].y + arcRadius * Math.sin(endAngle);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  const sweep = (endAngle - startAngle + 2 * Math.PI) % (2 * Math.PI) > Math.PI ? 0 : 1;
                  
                  return (
                    <path
                      d={`M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweep} ${endX} ${endY}`}
                      stroke={color}
                      strokeWidth={1.5 / zoom}
                      fill="none"
                    />
                  );
                })()}
                {/* Angle label */}
                <rect
                  x={points[1].x + 20 / zoom}
                  y={points[1].y - 25 / zoom}
                  width={45 / zoom}
                  height={18 / zoom}
                  fill="rgba(0,0,0,0.8)"
                  rx={3 / zoom}
                />
                <text
                  x={points[1].x + 42 / zoom}
                  y={points[1].y - 12 / zoom}
                  fill="white"
                  fontSize={12 / zoom}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {angle.toFixed(1)}°
                </text>
              </>
            )}
            {/* Vertex marker */}
            <circle
              cx={points[1].x}
              cy={points[1].y}
              r={4 / zoom}
              fill={color}
            />
          </g>
        );

      case "freehand":
        if (points.length < 2) return null;
        const pathData = points.reduce((acc, point, index) => {
          return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
        }, "");
        return (
          <path
            key={id}
            d={pathData}
            stroke={color}
            strokeWidth={2 / zoom}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={opacity}
          />
        );

      case "text":
        return (
          <text
            key={id}
            x={points[0].x}
            y={points[0].y}
            fill={color}
            fontSize={16 / zoom}
            opacity={opacity}
            fontWeight="500"
          >
            Annotation
          </text>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 bg-muted/50 overflow-hidden relative",
        isPanning ? "cursor-grab active:cursor-grabbing" : 
        activeTool === "eraser" ? "cursor-crosshair" :
        activeTool === "marker" ? "cursor-crosshair" :
        "cursor-crosshair"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {imageSrc ? (
        <div
          className="absolute"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <img
            src={imageSrc}
            alt="X-ray"
            className="max-w-none select-none"
            draggable={false}
          />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            {annotations.map((ann) => renderAnnotation(ann))}
            {currentAnnotation && renderAnnotation(currentAnnotation, true)}
          </svg>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <ImageIcon className="h-24 w-24 mb-4 opacity-30" />
          <p className="text-lg font-medium">No X-ray image loaded</p>
          <p className="text-sm mt-1">Click "Upload Image" to load an image</p>
        </div>
      )}

      {/* Zoom indicator */}
      {imageSrc && (
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Tool indicator */}
      {imageSrc && activeTool === "angle" && angleStep > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-sm font-medium shadow-sm">
          Click {angleStep === 1 ? "vertex point" : "end point"} ({angleStep}/2)
        </div>
      )}
    </div>
  );
};

export { ImageCanvas, type Annotation };
