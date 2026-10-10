import React from "react";
import { 
  Bot, 
  LayoutDashboard, 
  Briefcase, 
  FileUp, 
  Users, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "jobs", label: "Create Job", icon: Briefcase },
    { id: "upload", label: "Resume Upload", icon: FileUp },
    { id: "candidates", label: "Candidate Results", icon: Users },
    { id: "recommendations", label: "Skill Gap & Explainability", icon: Sparkles },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="logo-area" onClick={() => setActiveTab("dashboard")}>
          <div className="logo-icon">
            <Bot size={24} />
          </div>
          <div className="logo-text">
            <h1>TalentAI Assistant</h1>
            <p>Intelligent Recruitment Decision Support</p>
          </div>
        </div>

        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="badge-assistant">
          <ShieldCheck size={15} />
          <span>Decision Support Mode</span>
        </div>
      </div>
    </header>
  );
}
