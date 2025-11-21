import {
  ArrowRight,
  PieChart,
  Database,
  FlaskConical,
  FileText,
  AlertTriangle,
  Monitor,
  User,
  Network,
  ClipboardList,
  TrendingUp,
  Search,
  Command,
  BookOpen,
  Globe,
  Lock,
  Zap,
  Workflow,
  Layers,
  Shield,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { AISearchDialog } from "./AISearchDialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Footer } from "./Footer";
import { Binoculars } from "./icons/Binoculars";
import aiIcon from "figma:asset/d98ba8c1a392c8e922d637a419de7c9d29bf791a.png";

interface HomePageProps {
  onModuleSelect: (module: string) => void;
}

const modules = [
  {
    id: "admin",
    name: "Admin",
    icon: Settings,
    description:
      "Administrative functions for organizational setup, user management, discovery configuration, and system integrations.",
    iconBg: "bg-blue-600",
    iconColor: "text-white",
  },
  {
    id: "my-dashboard",
    name: "My Dashboard",
    icon: PieChart,
    description:
      "Centralized view of your IT environment with customizable widgets and real-time monitoring.",
    iconBg: "bg-orange-500",
    iconColor: "text-white",
  },
  {
    id: "cmdb",
    name: "CMDB",
    icon: Database,
    description:
      "Configuration Management Database for tracking and managing all IT assets and their relationships.",
    iconBg: "bg-green-500",
    iconColor: "text-white",
  },
  {
    id: "discovery-scan",
    name: "Discovery Scan",
    icon: Binoculars,
    description:
      "Automated discovery and scanning of IT infrastructure, applications, and cloud resources.",
    iconBg: "bg-blue-500",
    iconColor: "text-white",
  },
  {
    id: "itsm",
    name: "ITSM",
    icon: FileText,
    description:
      "IT Service Management for incident, problem, change, and service request management.",
    iconBg: "bg-purple-500",
    iconColor: "text-white",
  },
  {
    id: "vulnerability-management",
    name: "Vulnerability Management",
    icon: AlertTriangle,
    description:
      "Identify, assess, and remediate security vulnerabilities across your IT infrastructure.",
    iconBg: "bg-indigo-600",
    iconColor: "text-white",
  },
  {
    id: "itam",
    name: "ITAM",
    icon: Monitor,
    description:
      "IT Asset Management for complete lifecycle management of hardware and software assets.",
    iconBg: "bg-cyan-500",
    iconColor: "text-white",
  },
  {
    id: "self-service",
    name: "Self Service",
    icon: User,
    description:
      "Empower users with self-service portal for requests, catalog items, and knowledge base.",
    iconBg: "bg-pink-500",
    iconColor: "text-white",
  },
  {
    id: "program-project-management",
    name: "Program and Project Management",
    icon: Network,
    description:
      "Manage IT programs and projects with planning, tracking, and resource allocation.",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
  },
  {
    id: "risk-register",
    name: "Risk Register",
    icon: ClipboardList,
    description:
      "Track and manage IT risks with assessment, mitigation planning, and compliance monitoring.",
    iconBg: "bg-rose-500",
    iconColor: "text-white",
  },
  {
    id: "reports",
    name: "Reports",
    icon: TrendingUp,
    description:
      "Comprehensive reporting and analytics with customizable dashboards and scheduled reports.",
    iconBg: "bg-violet-500",
    iconColor: "text-white",
  },
];

export function HomePage({ onModuleSelect }: HomePageProps) {
  const [searchDialogOpen, setSearchDialogOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium Geometric Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/30">
        {/* Modern Geometric Pattern Background */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          {/* Large circles */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full border-[40px] border-green-200/20"></div>
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full border-[50px] border-green-100/25"></div>
          <div className="absolute -bottom-48 left-1/4 w-[600px] h-[600px] rounded-full border-[60px] border-green-100/20"></div>
          
          {/* Medium overlapping circles */}
          <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-green-100/15"></div>
          <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-green-50/30"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-green-100/20"></div>
          
          {/* Subtle geometric lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(16, 185, 129)" strokeWidth="0.5" opacity="0.08"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Diagonal accent shapes */}
          <div className="absolute top-0 right-0 w-full h-full">
            <div className="absolute top-[20%] right-[10%] w-32 h-32 rotate-45 bg-green-200/15"></div>
            <div className="absolute top-[60%] left-[8%] w-24 h-24 rotate-12 bg-green-100/20"></div>
            <div className="absolute bottom-[15%] right-[25%] w-28 h-28 -rotate-12 border-4 border-green-200/20"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32 overflow-hidden">

          {/* Content */}
          <div className="relative z-10 text-center max-w-5xl mx-auto py-12 px-8 rounded-3xl overflow-hidden shadow-2xl">
            {/* Layered Background Design */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/40 to-emerald-50/30"></div>
            
            {/* Decorative mesh gradient overlay */}
            <div className="absolute inset-0 opacity-60">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
              <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-green-400/8 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-tr from-emerald-400/8 to-transparent rounded-full blur-3xl"></div>
            </div>
            
            {/* Subtle geometric pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.05) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
            
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30"></div>
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-br-full"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-500/8 to-transparent rounded-tr-full"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-emerald-500/8 to-transparent rounded-tl-full"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10">
            {/* Virima Brand */}
            <div className="mb-8">
              <h1 className="text-7xl lg:text-8xl text-black-premium mb-6 tracking-tight">
                Virima
              </h1>
              <div className="h-1.5 w-32 bg-gradient-to-r from-green-500 to-green-600 mx-auto rounded-full shadow-lg"></div>
            </div>

            {/* Tagline */}
            <div className="mb-6">
              <p className="text-2xl lg:text-3xl text-black-premium mb-4 leading-relaxed">
                Welcome to the Documentation Platform
              </p>
            </div>

            <p className="text-lg lg:text-xl text-slate-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Explore comprehensive feature documentation,
              release notes, and more across all Virima modules
              and versions.
            </p>

            {/* Search CTA */}
            <div className="max-w-2xl mx-auto mb-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSearchDialogOpen(true)}
                className="w-full flex items-center gap-3 justify-start text-slate-700 bg-white hover:bg-slate-50 border-slate-200 hover:border-green-300 h-16 px-6 text-base transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <img
                  src={aiIcon}
                  alt="AI"
                  className="h-7.5 w-7.5"
                  style={{ imageRendering: "crisp-edges" }}
                />
                <span className="text-slate-400">
                  Ask AI anything about Virima
                </span>
                <div className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                  <Command className="h-3 w-3.5" />
                  <span>K</span>
                </div>
              </Button>
            </div>

            {/* Get Started Button */}
            <div className="flex justify-center mb-12">
              <Button
                size="lg"
                onClick={() => onModuleSelect('my-dashboard')}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Search Dialog */}
      <AISearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
      />

      {/* Value Proposition Section */}
      <div className="bg-white pt-24 pb-0 lg:pt-36 lg:pb-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl text-black-premium mb-8 tracking-tight">
              Enterprise IT Operations, Simplified
            </h2>
            <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Virima delivers a comprehensive suite of IT
              management solutions designed for enterprise-scale
              operations with the agility modern businesses
              demand.
            </p>
            <div className="bg-gradient-to-b from-white via-white to-white pt-16 pb-8 lg:pt-20 lg:pb-12">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <div
                        key={module.id}
                        className="group relative bg-white border border-slate-200/60 rounded-3xl p-10 hover:shadow-2xl hover:shadow-slate-900/5 hover:border-green-500/20 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                        onClick={() =>
                          onModuleSelect(module.id)
                        }
                      >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative flex flex-col flex-grow">
                          <div className="mb-8">
                            <div
                              className={`inline-flex p-5 rounded-2xl ${module.iconBg} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                            >
                              <Icon
                                className={`h-7 w-7 ${module.iconColor}`}
                              />
                            </div>
                          </div>

                          <h3 className="text-2xl text-black-premium mb-4 group-hover:text-green-600 transition-colors duration-300">
                            {module.name}
                          </h3>

                          <p className="text-base text-slate-600 leading-relaxed mb-8 flex-grow">
                            {module.description}
                          </p>

                          <div className="flex items-center gap-2 text-green-600 group-hover:gap-4 transition-all duration-300">
                            <span>Explore</span>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Modules */}

      {/* Documentation Resources */}
      <div className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-5xl lg:text-6xl text-black-premium mb-8 tracking-tight">
              Quick Links
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white border border-slate-200/60 hover:border-blue-500/20 rounded-3xl p-10 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-shadow duration-500">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl text-black-premium mb-4">
                Getting Started
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Detailed guides, tutorials, and step-by-step
                instructions for daily operations and workflows.
              </p>
            </div>

            <div className="group bg-white border border-slate-200/60 hover:border-green-500/20 rounded-3xl p-10 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-500">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-green-500/20 group-hover:shadow-xl group-hover:shadow-green-500/30 transition-shadow duration-500">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl text-black-premium mb-4">
                Release Notes
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Latest updates, new features, improvements, and
                bug fixes for each version release.
              </p>
            </div>

            <div className="group bg-white border border-slate-200/60 hover:border-blue-500/20 rounded-3xl p-10 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-shadow duration-500">
                <Layers className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl text-black-premium mb-4">
                Online Help
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Quick start guides and tutorials to get up and
                running with each module in minutes.
              </p>
            </div>

            <div className="group bg-white border border-slate-200/60 hover:border-green-500/20 rounded-3xl p-10 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-500">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-green-500/20 group-hover:shadow-xl group-hover:shadow-green-500/30 transition-shadow duration-500">
                <Database className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl text-black-premium mb-4">
                Knowledge base (KB) Articles
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Complete reference documentation covering all
                features, capabilities, and configurations.
              </p>
            </div>

            <div className="group bg-white border border-slate-200/60 hover:border-blue-500/20 rounded-3xl p-10 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-shadow duration-500">
                <Workflow className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl text-black-premium mb-4">
                API Integration
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Developer guides, API references, and code
                examples for seamless integrations.
              </p>
            </div>

            <div className="group bg-white border border-slate-200/60 hover:border-green-500/20 rounded-3xl p-10 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-500">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-green-500/20 group-hover:shadow-xl group-hover:shadow-green-500/30 transition-shadow duration-500">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl text-black-premium mb-4">
                Compatibility Matrix
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                System requirements, browser support, database
                compatibility, and integrations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}