import React from "react";
import { Target, PieChart, Users, Award, TrendingUp } from "lucide-react";
import DonutChart from "./DonutChart";

export default function AnalyticsView({ stats, onNavigate }) {
  const resumesAnalyzed = stats?.candidates_analyzed ?? 0;
  const totalJobs = stats?.total_jobs ?? 0;
  const totalCandidates = stats?.total_candidates ?? 0;
  const avgMatchScore = stats?.average_match_score ? `${Math.round(stats.average_match_score)}%` : "0%";

  const distributionData = [
    { label: "80–100% (ACCEPT)", count: stats?.status_distribution?.ACCEPT || 0, color: "#059669" },
    { label: "60–80% (REVIEW)", count: stats?.status_distribution?.REVIEW || 0, color: "#d97706" },
    { label: "0–60% (REJECT)", count: stats?.status_distribution?.REJECT || 0, color: "#475569" }
  ];

  return (
    <div className="dashboard-content" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      {/* Header Card */}
      <div className="content-card" style={{ marginBottom: "20px" }}>
        <div className="card-header-row">
          <div>
            <h2 className="card-header-title">Recruitment Analytics</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Pipeline metrics, candidate match distribution, and hiring yield analytics
            </p>
          </div>
          <span className="card-header-btn">
            Dynamic Overview
          </span>
        </div>
      </div>

      {resumesAnalyzed === 0 ? (
        <div className="content-card" style={{ textAlign: "center", padding: "64px 20px" }}>
          <Target size={44} color="var(--accent-orange)" style={{ opacity: 0.6, marginBottom: "12px" }} />
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "6px" }}>
            No analytics available yet
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "450px", margin: "0 auto 16px auto" }}>
            Analytics will appear after candidates are analyzed.
          </p>
          <button className="btn-primary" onClick={() => onNavigate && onNavigate("upload")}>
            Upload Resumes
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Analytics KPI Row */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon-box">
                  <Users size={20} />
                </div>
                <div>
                  <span className="kpi-title">Analyzed Candidates</span>
                  <div className="kpi-value">{resumesAnalyzed}</div>
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon-box">
                  <Award size={20} />
                </div>
                <div>
                  <span className="kpi-title">Avg Composite Score</span>
                  <div className="kpi-value">{avgMatchScore}</div>
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon-box">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <span className="kpi-title">Interview Ready (≥75%)</span>
                  <div className="kpi-value">{stats?.status_distribution?.ACCEPT || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Chart Card */}
          <div className="content-card">
            <div className="card-header-row" style={{ marginBottom: "18px" }}>
              <h3 className="card-header-title">Candidate Match Score Distribution</h3>
              <span className="card-header-btn">All Active Requisitions</span>
            </div>

            <DonutChart 
              total={resumesAnalyzed}
              data={distributionData}
            />
          </div>
        </div>
      )}
    </div>
  );
}
