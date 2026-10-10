import React from "react";
import { 
  Home, 
  Briefcase, 
  FileText, 
  Users, 
  Activity, 
  PieChart, 
  Target, 
  X 
} from "lucide-react";
import logoImg from "../assets/logo.png";

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "jobs", label: "Create Job", icon: Briefcase },
    { id: "upload", label: "Upload Resumes", icon: FileText },
    { id: "candidates", label: "Candidates", icon: Users },
    { id: "analysis", label: "AI Analysis", icon: Activity },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "skills", label: "Skill Insights", icon: Target },
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Top Logo & Branding (Section 2) */}
      <div className="sidebar-logo" onClick={() => handleSelectTab("dashboard")}>
        <img src={logoImg} alt="RecruitAI Logo" />
        <div className="sidebar-logo-text">
          <h1>RecruitAI</h1>
          <span>AI-Powered Intelligent Recruitment Assistance System</span>
        </div>
      </div>

      {/* Navigation (Section 3) - Outlined button/cards with thin orange border */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-button ${isActive ? "active" : ""}`}
              onClick={() => handleSelectTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
