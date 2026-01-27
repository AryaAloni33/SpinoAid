import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { MedicalCard, MedicalCardHeader, MedicalCardTitle, MedicalCardContent } from "@/components/medical/MedicalCard";
import { MedicalDropdownButton } from "@/components/medical/MedicalDropdown";
import { MedicalBadge } from "@/components/medical/MedicalBadge";
import { MedicalButton } from "@/components/medical/MedicalButton";
import {
  Users,
  Upload,
  Eye,
  Calendar,
  Activity,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";

const stats = [
  {
    title: "Total Patients",
    value: "1,284",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Appointments Today",
    value: "24",
    change: "+3",
    changeType: "positive" as const,
    icon: Calendar,
  },
  {
    title: "Pending Reports",
    value: "8",
    change: "-2",
    changeType: "negative" as const,
    icon: FileText,
  },
  {
    title: "Active Cases",
    value: "156",
    change: "+5%",
    changeType: "positive" as const,
    icon: Activity,
  },
];

const recentPatients = [
  { id: "P-1001", name: "Sarah Johnson", age: 45, lastVisit: "Today", status: "Active" },
  { id: "P-1002", name: "Michael Chen", age: 62, lastVisit: "Yesterday", status: "Follow-up" },
  { id: "P-1003", name: "Emily Davis", age: 34, lastVisit: "2 days ago", status: "Pending" },
  { id: "P-1004", name: "Robert Wilson", age: 58, lastVisit: "3 days ago", status: "Active" },
];

const upcomingAppointments = [
  { time: "09:00 AM", patient: "John Smith", type: "Consultation" },
  { time: "10:30 AM", patient: "Lisa Anderson", type: "Follow-up" },
  { time: "02:00 PM", patient: "David Brown", type: "X-Ray Review" },
  { time: "03:30 PM", patient: "Maria Garcia", type: "New Patient" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const actionsMenuItems = [
    {
      label: "Patient",
      icon: <Users className="h-4 w-4" />,
      onClick: () => navigate("/patient/P-1001"),
    },
    {
      label: "Upload Image",
      icon: <Upload className="h-4 w-4" />,
      onClick: () => console.log("Upload image"),
    },
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => console.log("View"),
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Follow-up":
        return "info";
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-6 md:px-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Welcome back, Doctor
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your patients today.
            </p>
          </div>
          <MedicalDropdownButton items={actionsMenuItems} variant="primary">
            Quick Actions
          </MedicalDropdownButton>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <MedicalCard key={stat.title} variant="default" padding="md" className="hover-lift">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp
                      className={`h-3 w-3 ${
                        stat.changeType === "positive"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        stat.changeType === "positive"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      from last week
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </MedicalCard>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Patients */}
          <MedicalCard variant="default" padding="none">
            <MedicalCardHeader className="px-5 pt-5">
              <div className="flex items-center justify-between">
                <MedicalCardTitle>Recent Patients</MedicalCardTitle>
                <MedicalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/patient/P-1001")}
                >
                  View All
                </MedicalButton>
              </div>
            </MedicalCardHeader>
            <MedicalCardContent>
              <div className="divide-y divide-border">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => navigate(`/patient/${patient.id}`)}
                    className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                        {patient.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {patient.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.id} • Age {patient.age}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MedicalBadge variant={getStatusVariant(patient.status)}>
                        {patient.status}
                      </MedicalBadge>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {patient.lastVisit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </MedicalCardContent>
          </MedicalCard>

          {/* Upcoming Appointments */}
          <MedicalCard variant="default" padding="none">
            <MedicalCardHeader className="px-5 pt-5">
              <div className="flex items-center justify-between">
                <MedicalCardTitle>Today's Appointments</MedicalCardTitle>
                <MedicalButton variant="ghost" size="sm">
                  Schedule
                </MedicalButton>
              </div>
            </MedicalCardHeader>
            <MedicalCardContent>
              <div className="divide-y divide-border">
                {upcomingAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Clock className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {appointment.patient}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.type}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      {appointment.time}
                    </div>
                  </div>
                ))}
              </div>
            </MedicalCardContent>
          </MedicalCard>
        </div>
      </main>
    </div>
  );
}
