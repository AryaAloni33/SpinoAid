import { 
  Upload, 
  Square, 
  Pencil, 
  Circle, 
  Type, 
  Eraser, 
  Undo2, 
  Redo2, 
  Save,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Ruler,
  Slash
} from "lucide-react";
import { ToolButton } from "./ToolButton";
import { cn } from "@/lib/utils";

export type AnnotationTool = 
  | "select" 
  | "box" 
  | "freehand" 
  | "circle" 
  | "line"
  | "ruler"
  | "text" 
  | "eraser";

interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  onUpload: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPan: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPanning: boolean;
  hasImage: boolean;
}

const AnnotationToolbar = ({
  activeTool,
  onToolChange,
  onUpload,
  onZoomIn,
  onZoomOut,
  onPan,
  onReset,
  onUndo,
  onRedo,
  onSave,
  canUndo,
  canRedo,
  isPanning,
  hasImage,
}: AnnotationToolbarProps) => {
  const annotationTools = [
    { id: "select" as const, icon: MousePointer2, label: "Select", shortcut: "V" },
    { id: "box" as const, icon: Square, label: "Box", shortcut: "B" },
    { id: "circle" as const, icon: Circle, label: "Circle", shortcut: "C" },
    { id: "line" as const, icon: Slash, label: "Line", shortcut: "L" },
    { id: "freehand" as const, icon: Pencil, label: "Draw", shortcut: "D" },
    { id: "ruler" as const, icon: Ruler, label: "Measure", shortcut: "M" },
    { id: "text" as const, icon: Type, label: "Text", shortcut: "T" },
    { id: "eraser" as const, icon: Eraser, label: "Eraser", shortcut: "E" },
  ];

  return (
    <aside className="w-24 bg-card border-r border-border flex flex-col h-full">
      {/* Upload Section */}
      <div className="p-2 border-b border-border">
        <button
          onClick={onUpload}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-1 p-3 rounded-lg",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "transition-all duration-200 focus-ring"
          )}
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs font-medium">Upload</span>
        </button>
      </div>

      {/* View Controls */}
      <div className="p-2 border-b border-border space-y-1">
        <p className="text-xs font-semibold text-muted-foreground px-1 mb-2">View</p>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={onZoomIn}
            disabled={!hasImage}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 p-2 rounded-md",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              "transition-all duration-200 focus-ring disabled:opacity-50"
            )}
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
            <span className="text-[10px]">Zoom+</span>
          </button>
          <button
            onClick={onZoomOut}
            disabled={!hasImage}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 p-2 rounded-md",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              "transition-all duration-200 focus-ring disabled:opacity-50"
            )}
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
            <span className="text-[10px]">Zoom-</span>
          </button>
          <button
            onClick={onPan}
            disabled={!hasImage}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 p-2 rounded-md",
              "transition-all duration-200 focus-ring disabled:opacity-50",
              isPanning
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            title="Pan (Space + Drag)"
          >
            <Move className="h-4 w-4" />
            <span className="text-[10px]">Pan</span>
          </button>
          <button
            onClick={onReset}
            disabled={!hasImage}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 p-2 rounded-md",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              "transition-all duration-200 focus-ring disabled:opacity-50"
            )}
            title="Reset View (R)"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="text-[10px]">Reset</span>
          </button>
        </div>
      </div>

      {/* Annotation Tools */}
      <div className="flex-1 p-2 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground px-1 mb-2">Tools</p>
        <div className="space-y-1">
          {annotationTools.map((tool) => (
            <ToolButton
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              shortcut={tool.shortcut}
              isActive={activeTool === tool.id}
              onClick={() => onToolChange(tool.id)}
              disabled={!hasImage && tool.id !== "select"}
              className="w-full"
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-2 border-t border-border space-y-1">
        <p className="text-xs font-semibold text-muted-foreground px-1 mb-2">Actions</p>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 p-2 rounded-md",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              "transition-all duration-200 focus-ring disabled:opacity-50"
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
            <span className="text-[10px]">Undo</span>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 p-2 rounded-md",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              "transition-all duration-200 focus-ring disabled:opacity-50"
            )}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
            <span className="text-[10px]">Redo</span>
          </button>
        </div>
        <button
          onClick={onSave}
          disabled={!hasImage}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-1 p-3 rounded-lg mt-2",
            "bg-success text-success-foreground hover:bg-success/90",
            "transition-all duration-200 focus-ring disabled:opacity-50"
          )}
        >
          <Save className="h-5 w-5" />
          <span className="text-xs font-medium">Save</span>
        </button>
      </div>
    </aside>
  );
};

export { AnnotationToolbar };
