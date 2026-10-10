import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight,
  Target
} from "lucide-react";
import { fetchCandidates } from "../services/api";
import { formatJobRole, formatSkill } from "../utils/formatters";

export default function SkillGapRecommendationsView({ onSelectCandidate, onNavigate, dataVersion }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const candsData = await fetchCandidates();
        const evaluatedOnly = (candsData || []).filter(c => c.latest_evaluation);
        setCandidates(evaluatedOnly);
        if (evaluatedOnly.length > 0) {
          // If current selection is still in list, keep it; otherwise select first
          const stillExists = evaluatedOnly.some(c => c.id === parseInt(selectedCandidateId));
          if (!stillExists) {
            setSelectedCandidateId(evaluatedOnly[0].id);
          }
        } else {
          setSelectedCandidateId("");
        }
      } catch (err) {
        console.error("Error loading skill gap data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [dataVersion]);

  const currentCandidate = candidates.find(c => c.id === parseInt(selectedCandidateId));
  const currentEval = currentCandidate?.latest_evaluation;
  const shapData = currentEval?.shap_explanation || {};

  return (
    <div className="dashboard-content" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      {/* Selection Card */}
      <div className="content-card">
        <div className="card-header-row">
          <div>
            <h2 className="card-header-title">Skill Insights & Explainability</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Algorithmic feature attribution, driver factors, and upskilling roadmaps
            </p>
          </div>

          {candidates.length > 0 && (
            <div style={{ minWidth: "260px" }}>
              <select
                className="form-select"
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.latest_evaluation ? `(${formatJobRole(c.latest_evaluation.job_title)} - ${Math.round(c.latest_evaluation.match_percentage)}%)` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {currentCandidate && currentEval && (
          <div style={{
            background: "var(--accent-orange-light)",
            border: "1.5px solid var(--accent-orange-border)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "14px"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)" }}>
                  {currentCandidate.name}
                </h3>
                <span className={`status-pill ${currentEval.status === "ACCEPT" ? "status-accept" : (currentEval.status === "REVIEW" ? "status-review" : "status-reject")}`}>
                  {currentEval.status}
                </span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Role: <strong style={{ color: "var(--text-dark)" }}>{formatJobRole(currentEval.job_title)}</strong> &bull; {currentCandidate.experience_years || 0} Years Experience
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-dark)", lineHeight: 1 }}>
                {Math.round(currentEval.match_percentage)}%
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-orange)", fontWeight: 600, display: "block" }}>
                Match Score
              </span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <p>Loading explainability parameters...</p>
        </div>
      ) : candidates.length === 0 || !currentCandidate || !currentEval ? (
        <div className="content-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Target size={40} color="var(--accent-orange)" style={{ opacity: 0.6, marginBottom: "12px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "6px" }}>
            No candidates available
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "450px", margin: "0 auto 16px auto" }}>
            Upload resumes to start evaluating candidates.
          </p>
          <button className="btn-primary" onClick={() => onNavigate && onNavigate("upload")}>
            Upload Resumes
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Feature Attribution Card */}
          <div className="content-card">
            <div className="card-header-row">
              <div>
                <h3 className="card-header-title">Feature Attribution Breakdown</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Quantified contributions to the final composite score
                </p>
              </div>
              <span className="card-header-btn">
                Linear SHAP Ensemble
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
              {shapData.feature_attributions && shapData.feature_attributions.map((item, idx) => {
                const percent = item.max_possible_points > 0 ? (item.contribution_points / item.max_possible_points) * 100 : 0;
                const isPositive = item.status === "positive";

                return (
                  <div key={idx} style={{ background: "#ffffff", border: "1.5px solid var(--border-card)", borderRadius: "var(--radius-md)", padding: "14px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-dark)" }}>
                        {item.feature} ({item.weight})
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: isPositive ? "#059669" : "#d97706" }}>
                        +{item.contribution_points} pts / max {item.max_possible_points}
                      </span>
                    </div>

                    <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "var(--radius-full)", overflow: "hidden", marginBottom: "6px" }}>
                      <div 
                        style={{
                          width: `${Math.min(100, Math.max(0, percent))}%`,
                          height: "100%",
                          background: isPositive ? "#059669" : "#d97706",
                          borderRadius: "var(--radius-full)"
                        }}
                      />
                    </div>

                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {item.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upskilling Recommendations Card */}
          <div className="content-card">
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={16} color="#C65A0A" />
              Tailored Upskilling Pathways
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {currentEval.skill_gap_analysis?.recommendations?.map((rec, i) => (
                <div key={i} style={{
                  background: "#ffffff",
                  border: "1.5px solid var(--border-card)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "0.9rem", color: "var(--text-dark)" }}>
                        {formatSkill(rec.missing_skill)}
                      </strong>
                      <span className="status-pill status-review" style={{ fontSize: "0.68rem" }}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-body)", marginTop: "4px" }}>
                      {rec.learning_pathway}
                    </p>
                  </div>
                  <button 
                    className="card-header-btn"
                    onClick={() => alert(`Opening curriculum resources for ${formatSkill(rec.missing_skill)}`)}
                  >
                    View Course
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ethical Decision-Support Notice */}
          <div className="disclaimer-card">
            <ShieldCheck size={20} color="#C65A0A" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Recruiter Decision Support:</strong> Explainability parameters quantify semantic alignment and algorithmic feature contributions. Final hiring decision remains with the recruiter.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
