import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { MedicalCard } from "@/components/medical/MedicalCard";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Users, Upload, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const actionCards = [
  {
    id: "patient",
    title: "Patient",
    description: "View and manage patient records",
    icon: Users,
    href: "/patient/P-1001",
  },
  {
    id: "upload",
    title: "Upload",
    description: "Upload medical images and documents",
    icon: Upload,
    href: "/xray-annotation",
  },
  {
    id: "view",
    title: "View",
    description: "View reports and radiographs",
    icon: Eye,
    href: "#",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="container px-4 py-12 md:px-6 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {actionCards.map((card) => (
            <MedicalCard
              key={card.id}
              variant="elevated"
              padding="lg"
              className={cn(
                "cursor-pointer hover-lift group",
                "hover:border-primary/50 transition-all duration-300"
              )}
              onClick={() => navigate(card.href)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <card.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </MedicalCard>
          ))}
        </div>
      </main>
    </div>
  );
}
