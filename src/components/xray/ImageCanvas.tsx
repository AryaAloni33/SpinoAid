import { useRef, useState, useEffect, MouseEvent } from "react";
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
  box: "#22c55e",      // Green
  circle: "#3b82f6",   // Blue
  line: "#f59e0b",     // Amber
  freehand: "#ef4444", // Red
  ruler: "#8b5cf6",    // Purple
  text: "#06b6d4",     // Cyan
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

  const getRelativePosition = (e: MouseEvent): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - position.x) / zoom,
      y: (e.clientY - rect.top - position.y) / zoom,
    };
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!imageSrc) return;

    const pos = getRelativePosition(e);

    if (isPanning) {
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      return;
    }

    if (activeTool === "select" || activeTool === "eraser") {
      // Handle selection/erasing
      if (activeTool === "eraser") {
        const clickedAnnotation = annotations.find((ann) => {
          // Simple hit detection for demo
          return ann.points.some(
            (p) => Math.abs(p.x - pos.x) < 20 && Math.abs(p.y - pos.y) < 20
          );
        });
        if (clickedAnnotation) {
          onAnnotationsChange(annotations.filter((a) => a.id !== clickedAnnotation.id));
        }
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
      onAnnotationsChange([...annotations, currentAnnotation]);
    }
    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  const renderAnnotation = (annotation: Annotation, isTemp = false) => {
    const { type, points, color, id } = annotation;
    const opacity = isTemp ? 0.7 : 1;

    if (points.length < 1) return null;

    switch (type) {
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
              <text
                x={(lineStart.x + lineEnd.x) / 2}
                y={(lineStart.y + lineEnd.y) / 2 - 10}
                fill={color}
                fontSize={14 / zoom}
                textAnchor="middle"
              >
                {distance}px
              </text>
            )}
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
        isPanning ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
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
          <p className="text-sm mt-1">Click "Upload" to load an image</p>
        </div>
      )}

      {/* Zoom indicator */}
      {imageSrc && (
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-sm font-medium">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
};

export { ImageCanvas, type Annotation };
