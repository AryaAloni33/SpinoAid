import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  shortcut?: string;
}

const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
  ({ icon: Icon, label, isActive = false, shortcut, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all duration-200",
          "hover:bg-accent focus-ring min-w-[72px]",
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-card text-foreground hover:text-accent-foreground",
          "disabled:opacity-50 disabled:pointer-events-none",
          className
        )}
        title={shortcut ? `${label} (${shortcut})` : label}
        {...props}
      >
        <Icon className="h-5 w-5" />
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  }
);

ToolButton.displayName = "ToolButton";

export { ToolButton };
