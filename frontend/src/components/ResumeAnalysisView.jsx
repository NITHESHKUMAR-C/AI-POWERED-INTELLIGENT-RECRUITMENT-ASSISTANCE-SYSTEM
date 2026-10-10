import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  Trash2
} from "lucide-react";
import { fetchCandidates, deleteCandidate } from "../services/api";
import { formatJobRole, formatSkill } from "../utils/formatters";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function ResumeAnalysisView({ onSelectCandidate, onNavigate, onCandidateDeleted, dataVersion }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCandidates();
      // Keep candidates that have an evaluation
      const evaluated = (data || []).filter(c => c.latest_evaluation);
      setCandidates(evaluated);
      if (selectedIndex >= evaluated.length) {
        setSelectedIndex(Math.max(0, evaluated.length - 1));
      }
    } catch (err) {
      console.error("Error loading candidate analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dataVersion]);

  const handleConfirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCandidate(candidateToDelete.id);
      const remaining = candidates.filter(c => c.id !== candidateToDelete.id);
      setCandidates(remaining);
      setSelectedIndex(0);
      if (onCandidateDeleted) {
        onCandidateDeleted(candidateToDelete.id);
      }
      setCandidateToDelete(null);
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      setDeleteError(err.message || "Unable to delete candidate. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const currentCand = candidates[selectedIndex];
  const currentEval = currentCand?.latest_evaluation;

  const current = currentCand && currentEval ? {
    id: currentCand.id,
    resumeFile: currentCand.name ? `${currentCand.name.replace(/\s+/g, "_")}_Resume.pdf` : "Candidate_Resume.pdf",
    candidateName: currentCand.name,
    jobRole: currentEval.job_title ? formatJobRole(currentEval.job_title) : "-",
    matchScore: Math.round(currentEval.match_percentage || 0),
    matchingSkills: (currentEval.matching_skills || []).map(formatSkill),
    missingSkills: (currentEval.missing_skills || []).map(formatSkill),
    candidateSummary: currentEval.ai_summary || "Candidate profile processed by AI evaluation engine.",
    aiEvaluation: currentEval.evaluation_reason || "Automated match evaluation based on semantic embeddings and required skill coverage.",
    evidenceExplanation: currentEval.shap_explanation?.summary || "Match score formulated through NLP semantic similarity and required skill overlap analysis.",
    skillGap: currentEval.missing_skills && currentEval.missing_skills.length > 0 
      ? `Skill gaps detected in: ${currentEval.missing_skills.map(formatSkill).join(", ")}.`
      : "No critical skill gaps identified for role criteria.",
    learningRecommendations: (currentEval.recommendations || []).map((r) => ({
      skill: formatSkill(r.skill_name),
      priority: r.priority,
      course: r.course_title,
      provider: r.platform,
      action: r.description
    }))
  } : null;

  return (
    <div className="dashboard-content" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      {/* Top Selector Card */}
      <div className="content-card">
        <div className="card-header-row" style={{ marginBottom: "14px" }}>
          <div>
            <h2 className="card-header-title">AI Resume Analysis</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Evidence-based resume evaluation and recruiter decision support
            </p>
          </div>

          {current && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button 
                className="card-header-btn" 
                onClick={() => alert(`Downloading resume: ${current.resumeFile}`)}
              >
                <Download size={14} />
                Download Resume
              </button>
              <button
                className="btn-delete"
                onClick={() => {
                  setDeleteError(null);
                  setCandidateToDelete(currentCand);
                }}
                title={`Delete candidate ${current.candidateName}`}
              >
                <Trash2 size={14} />
                Delete Candidate
              </button>
            </div>
          )}
        </div>

        {/* Candidate Selector Tabs */}
        {candidates.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "14px" }}>
            {candidates.map((c, idx) => (
              <button
                key={c.id}
                className={`filter-btn ${selectedIndex === idx ? "active" : ""}`}
                style={{
                  background: selectedIndex === idx ? "var(--accent-orange-light)" : "#ffffff",
                  borderColor: selectedIndex === idx ? "var(--accent-orange)" : "var(--border-button)",
                  color: selectedIndex === idx ? "var(--accent-orange)" : "var(--text-body)",
                  fontWeight: selectedIndex === idx ? 700 : 500
                }}
                onClick={() => setSelectedIndex(idx)}
              >
                {c.name} &bull; {c.latest_evaluation?.job_title ? formatJobRole(c.latest_evaluation.job_title) : "-"} ({Math.round(c.latest_evaluation?.match_percentage || 0)}%)
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <p>Loading candidate analysis...</p>
        </div>
      ) : !current ? (
        <div className="content-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <FileText size={40} color="var(--accent-orange)" style={{ opacity: 0.6, marginBottom: "12px" }} />
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
        /* Main Candidate Card */
        <div className="content-card">
          {/* Header Profile Bar */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1.5px solid var(--border-subtle)",
            paddingBottom: "18px",
            marginBottom: "20px"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "4px" }}>
                <FileText size={15} color="#C65A0A" />
                <span>Resume File:</span>
                <strong style={{ color: "var(--text-dark)" }}>{current.resumeFile}</strong>
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.02em" }}>
                {current.candidateName}
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Target Job Role: <strong style={{ color: "var(--orange-dark)" }}>{current.jobRole}</strong>
              </p>
            </div>

            {/* Match Score Display */}
            <div style={{
              background: "var(--orange-hover-bg)",
              border: "1.5px solid var(--orange-dark)",
              borderRadius: "var(--radius-lg)",
              padding: "16px 24px",
              textAlign: "center",
              minWidth: "160px"
            }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--orange-dark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Match Score
              </span>
              <div style={{ fontSize: "2.3rem", fontWeight: 800, color: "var(--text-dark)", lineHeight: 1.1 }}>
                {current.matchScore}%
              </div>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: current.matchScore >= 75 ? "#059669" : (current.matchScore >= 55 ? "#d97706" : "#dc2626")
              }}>
                {current.matchScore >= 75 ? "Strong Candidate" : (current.matchScore >= 55 ? "Review Candidate" : "Low Match")}
              </span>
            </div>
          </div>

          {/* Matching Skills & Missing Skills (Two Cards) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
            {/* Matching Skills */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid #a7f3d0",
              borderRadius: "var(--radius-md)",
              padding: "18px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <CheckCircle2 size={18} color="#059669" />
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#065f46" }}>
                  Matching Skills
                </h3>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {current.matchingSkills.length > 0 ? (
                  current.matchingSkills.map((sk) => (
                    <span key={sk} className="skill-badge skill-badge-match">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>None detected</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid #fecaca",
              borderRadius: "var(--radius-md)",
              padding: "18px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <AlertTriangle size={18} color="#dc2626" />
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#991b1b" }}>
                  Missing Skills
                </h3>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {current.missingSkills.length > 0 ? (
                  current.missingSkills.map((sk) => (
                    <span key={sk} className="skill-badge skill-badge-missing">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.82rem", color: "#059669" }}>No missing mandatory skills!</span>
                )}
              </div>
            </div>
          </div>

          {/* Candidate Summary */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={16} color="#C65A0A" />
              Candidate Summary
            </h3>
            <p style={{
              fontSize: "0.88rem",
              color: "var(--text-body)",
              lineHeight: 1.6,
              background: "#faf8f5",
              padding: "14px 18px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid #fed7aa"
            }}>
              {current.candidateSummary}
            </p>
          </div>

          {/* AI Evaluation */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Award size={16} color="#C65A0A" />
              AI Evaluation
            </h3>
            <p style={{
              fontSize: "0.88rem",
              color: "var(--text-body)",
              lineHeight: 1.6,
              background: "#faf8f5",
              padding: "14px 18px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid #fed7aa"
            }}>
              {current.aiEvaluation}
            </p>
          </div>

          {/* Evidence / Explanation */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={16} color="#C65A0A" />
              Evidence & Detailed Justification
            </h3>
            <div style={{
              background: "#ffffff",
              padding: "14px 18px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border-card)",
              fontSize: "0.86rem",
              color: "var(--text-body)",
              lineHeight: 1.55
            }}>
              {current.evidenceExplanation}
            </div>
          </div>

          {/* Upskilling Recommendations */}
          {current.learningRecommendations && current.learningRecommendations.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <BookOpen size={16} color="#C65A0A" />
                Targeted Upskilling & Course Recommendations
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {current.learningRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#faf8f5",
                      border: "1.5px solid #fed7aa",
                      borderRadius: "var(--radius-md)",
                      padding: "14px 18px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "0.9rem" }}>
                        Skill to Develop: <span style={{ color: "var(--orange-dark)" }}>{rec.skill}</span>
                      </span>
                      <span className={`status-pill ${rec.priority === "HIGH" ? "status-reject" : "status-review"}`} style={{ fontSize: "0.7rem" }}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-body)", marginBottom: "8px" }}>
                      {rec.action}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>Recommended Resource:</span>
                      <span>{rec.course} ({rec.provider})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recruiter Decision Support Disclaimer */}
          <div className="disclaimer-card" style={{ marginBottom: "22px" }}>
            <ShieldCheck size={20} color="#C65A0A" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Recruiter Decision Support:</strong> Evidence-Based Candidate Analysis generated to assist hiring teams. Final hiring decision remains with the recruiter.
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              className="btn-secondary"
              onClick={() => onSelectCandidate && onSelectCandidate(currentCand)}
            >
              View Full Profile
            </button>
            <button
              className="btn-primary"
              onClick={() => alert(`Candidate ${current.candidateName} shortlisted for recruiter interview!`)}
            >
              Shortlist Candidate
            </button>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!candidateToDelete}
        title="Are you sure you want to delete this candidate?"
        message="This will permanently remove the candidate and related evaluation data."
        itemName={candidateToDelete?.name}
        itemType="candidate"
        confirmText="Delete Candidate"
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDeleteCandidate}
        onCancel={() => {
          if (!isDeleting) {
            setCandidateToDelete(null);
            setDeleteError(null);
          }
        }}
      />
    </div>
  );
}
