import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnnotationToolbar, type AnnotationTool } from "@/components/xray/AnnotationToolbar";
import { ImageCanvas, type Annotation } from "@/components/xray/ImageCanvas";
import { MedicalButton } from "@/components/medical/MedicalButton";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const XRayAnnotation = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");

  // Tool state
  const [activeTool, setActiveTool] = useState<AnnotationTool>("select");
  const [isPanning, setIsPanning] = useState(false);

  // View state
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "v":
          setActiveTool("select");
          break;
        case "p":
          setActiveTool("marker");
          break;
        case "b":
          setActiveTool("box");
          break;
        case "c":
          setActiveTool("circle");
          break;
        case "l":
          setActiveTool("line");
          break;
        case "d":
          setActiveTool("freehand");
          break;
        case "m":
          setActiveTool("ruler");
          break;
        case "a":
          setActiveTool("angle");
          break;
        case "t":
          setActiveTool("text");
          break;
        case "e":
          setActiveTool("eraser");
          break;
        case "r":
          handleReset();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case " ":
          e.preventDefault();
          setIsPanning(true);
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setIsPanning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [historyIndex, history]);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, DICOM, etc.)",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgData = event.target?.result as string;
        
        // Create an image to get natural dimensions and center it
        const img = new Image();
        img.onload = () => {
          // Calculate zoom to fit image in viewport (zoomed out to see full image)
          const containerWidth = window.innerWidth - 320; // Subtract sidebar width
          const containerHeight = window.innerHeight - 150; // Subtract header/toolbar height
          
          const scaleX = containerWidth / img.naturalWidth;
          const scaleY = containerHeight / img.naturalHeight;
          const fitZoom = Math.min(scaleX, scaleY, 1) * 0.85; // 85% of fit size for padding
          
          setImageSrc(imgData);
          setImageName(file.name);
          setZoom(fitZoom); // Zoomed out to fit
          // Center the image in the viewport
          const centeredX = (containerWidth - img.naturalWidth * fitZoom) / 2;
          const centeredY = (containerHeight - img.naturalHeight * fitZoom) / 2;
          setPosition({ x: Math.max(20, centeredX), y: Math.max(20, centeredY) });
          setAnnotations([]);
          setHistory([[]]);
          setHistoryIndex(0);
          toast({
            title: "Image loaded",
            description: `${file.name} loaded at ${Math.round(fitZoom * 100)}% zoom.`,
          });
        };
        img.src = imgData;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.2));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleAnnotationsChange = useCallback((newAnnotations: Annotation[]) => {
    setAnnotations(newAnnotations);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAnnotations(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAnnotations(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleSave = useCallback(() => {
    if (!imageSrc) return;

    // Mock save functionality
    toast({
      title: "Annotations saved",
      description: `${annotations.length} annotation(s) saved successfully.`,
    });

    console.log("Saved annotations:", annotations);
  }, [imageSrc, annotations]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <MedicalButton
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </MedicalButton>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-lg font-semibold text-foreground">X-Ray Annotation</h1>
          {imageName && (
            <>
              <div className="h-6 w-px bg-border" />
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {imageName}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus-ring"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Toolbar */}
        <AnnotationToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onUpload={handleUpload}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onPan={() => setIsPanning(!isPanning)}
          onReset={handleReset}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          isPanning={isPanning}
          hasImage={!!imageSrc}
        />

        {/* Canvas */}
        <ImageCanvas
          imageSrc={imageSrc}
          activeTool={activeTool}
          zoom={zoom}
          position={position}
          isPanning={isPanning}
          annotations={annotations}
          onAnnotationsChange={handleAnnotationsChange}
          onPositionChange={setPosition}
        />
      </div>

      {/* Status Bar */}
      <footer className="h-8 border-t border-border bg-card flex items-center justify-between px-4 text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-4">
          <span>Tool: <strong className="text-foreground">{activeTool}</strong></span>
          {isPanning && <span className="text-primary">Panning mode</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>Shortcuts: V=Select, P=Marker, B=Box, C=Circle, A=Angle, Space=Pan</span>
        </div>
      </footer>
    </div>
  );
};

export default XRayAnnotation;
