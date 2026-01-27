import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import {
  MedicalCard,
  MedicalCardHeader,
  MedicalCardTitle,
  MedicalCardContent,
} from "@/components/medical/MedicalCard";
import { MedicalButton } from "@/components/medical/MedicalButton";
import { MedicalBadge } from "@/components/medical/MedicalBadge";
import { MedicalTable } from "@/components/medical/MedicalTable";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Download,
  Eye,
  Maximize2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock patient data
const patientData = {
  id: "P-1001",
  name: "Sarah Johnson",
  age: 45,
  gender: "Female",
  dateOfBirth: "March 15, 1979",
  bloodType: "O+",
  phone: "+1 (555) 123-4567",
  email: "sarah.johnson@email.com",
  address: "1234 Oak Street, Springfield, IL 62701",
  emergencyContact: "Michael Johnson (Husband) - +1 (555) 987-6543",
  allergies: ["Penicillin", "Latex"],
  conditions: ["Hypertension", "Type 2 Diabetes"],
  primaryPhysician: "Dr. Emily Carter",
  lastVisit: "January 25, 2026",
  status: "Active",
};

const reports = [
  {
    id: "R-001",
    date: "Jan 25, 2026",
    type: "Blood Work",
    doctor: "Dr. Carter",
    status: "Complete",
  },
  {
    id: "R-002",
    date: "Jan 20, 2026",
    type: "Chest X-Ray",
    doctor: "Dr. Adams",
    status: "Complete",
  },
  {
    id: "R-003",
    date: "Jan 15, 2026",
    type: "MRI Scan",
    doctor: "Dr. Wilson",
    status: "Pending",
  },
  {
    id: "R-004",
    date: "Jan 10, 2026",
    type: "ECG",
    doctor: "Dr. Carter",
    status: "Complete",
  },
  {
    id: "R-005",
    date: "Jan 05, 2026",
    type: "Urinalysis",
    doctor: "Dr. Brown",
    status: "Complete",
  },
];

// Placeholder medical image URLs (using neutral placeholder images)
const radiographs = [
  {
    id: 1,
    title: "Chest X-Ray (PA)",
    date: "Jan 20, 2026",
    url: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Chest X-Ray (Lateral)",
    date: "Jan 20, 2026",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Hand X-Ray",
    date: "Dec 15, 2025",
    url: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    title: "Spine MRI",
    date: "Nov 28, 2025",
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
  },
];

type Tab = "info" | "reports" | "images";

export default function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [selectedImage, setSelectedImage] = useState<typeof radiographs[0] | null>(null);

  const reportColumns = [
    { key: "id", header: "Report ID" },
    { key: "date", header: "Date" },
    { key: "type", header: "Type" },
    { key: "doctor", header: "Doctor" },
    {
      key: "status",
      header: "Status",
      render: (item: typeof reports[0]) => (
        <MedicalBadge
          variant={item.status === "Complete" ? "success" : "warning"}
        >
          {item.status}
        </MedicalBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <div className="flex gap-2">
          <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: "info" as Tab, label: "Patient Info", icon: User },
    { id: "reports" as Tab, label: "Reports", icon: FileText },
    { id: "images" as Tab, label: "Radiographs", icon: Maximize2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-6 md:px-6 lg:py-8">
        {/* Back button and header */}
        <div className="mb-6">
          <MedicalButton
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="mb-4"
          >
            Back to Dashboard
          </MedicalButton>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xl">
                {patientData.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {patientData.name}
                  </h1>
                  <MedicalBadge variant="success">{patientData.status}</MedicalBadge>
                </div>
                <p className="text-muted-foreground mt-0.5">
                  Patient ID: {patientId || patientData.id} • {patientData.age} years old •{" "}
                  {patientData.gender}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MedicalButton variant="outline">Edit Patient</MedicalButton>
              <MedicalButton variant="primary">New Appointment</MedicalButton>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === "info" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Personal Information */}
              <MedicalCard variant="default" padding="md">
                <MedicalCardHeader>
                  <MedicalCardTitle>Personal Information</MedicalCardTitle>
                </MedicalCardHeader>
                <MedicalCardContent className="space-y-4">
                  <InfoRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Date of Birth"
                    value={patientData.dateOfBirth}
                  />
                  <InfoRow
                    icon={<User className="h-4 w-4" />}
                    label="Blood Type"
                    value={patientData.bloodType}
                  />
                  <InfoRow
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone"
                    value={patientData.phone}
                  />
                  <InfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={patientData.email}
                  />
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Address"
                    value={patientData.address}
                  />
                </MedicalCardContent>
              </MedicalCard>

              {/* Medical Information */}
              <MedicalCard variant="default" padding="md">
                <MedicalCardHeader>
                  <MedicalCardTitle>Medical Information</MedicalCardTitle>
                </MedicalCardHeader>
                <MedicalCardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Primary Physician
                    </p>
                    <p className="text-foreground font-medium">
                      {patientData.primaryPhysician}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Allergies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {patientData.allergies.map((allergy) => (
                        <MedicalBadge key={allergy} variant="error">
                          {allergy}
                        </MedicalBadge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Active Conditions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {patientData.conditions.map((condition) => (
                        <MedicalBadge key={condition} variant="warning">
                          {condition}
                        </MedicalBadge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Emergency Contact
                    </p>
                    <p className="text-foreground">
                      {patientData.emergencyContact}
                    </p>
                  </div>
                </MedicalCardContent>
              </MedicalCard>
            </div>
          )}

          {activeTab === "reports" && (
            <MedicalCard variant="default" padding="none">
              <MedicalCardHeader className="px-5 pt-5">
                <div className="flex items-center justify-between">
                  <MedicalCardTitle>Medical Reports</MedicalCardTitle>
                  <MedicalButton variant="primary" size="sm">
                    Add Report
                  </MedicalButton>
                </div>
              </MedicalCardHeader>
              <MedicalCardContent>
                <MedicalTable columns={reportColumns} data={reports} />
              </MedicalCardContent>
            </MedicalCard>
          )}

          {activeTab === "images" && (
            <>
              <MedicalCard variant="default" padding="md">
                <MedicalCardHeader>
                  <div className="flex items-center justify-between">
                    <MedicalCardTitle>Radiographs & Medical Images</MedicalCardTitle>
                    <MedicalButton variant="primary" size="sm">
                      Upload Image
                    </MedicalButton>
                  </div>
                </MedicalCardHeader>
                <MedicalCardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {radiographs.map((image) => (
                      <div
                        key={image.id}
                        onClick={() => setSelectedImage(image)}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover-lift"
                      >
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-sm font-medium truncate">
                            {image.title}
                          </p>
                          <p className="text-xs opacity-80">{image.date}</p>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm">
                            <Maximize2 className="h-4 w-4 text-foreground" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </MedicalCardContent>
              </MedicalCard>

              {/* Image Preview Modal */}
              {selectedImage && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm animate-fade-in"
                  onClick={() => setSelectedImage(null)}
                >
                  <div className="relative max-w-4xl max-h-[90vh] mx-4">
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-12 right-0 p-2 rounded-lg bg-background/20 hover:bg-background/30 transition-colors"
                    >
                      <X className="h-5 w-5 text-primary-foreground" />
                    </button>
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.title}
                      className="max-w-full max-h-[80vh] rounded-lg shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="mt-4 text-center text-primary-foreground">
                      <p className="font-medium">{selectedImage.title}</p>
                      <p className="text-sm opacity-80">{selectedImage.date}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-foreground">{value}</p>
      </div>
    </div>
  );
}
