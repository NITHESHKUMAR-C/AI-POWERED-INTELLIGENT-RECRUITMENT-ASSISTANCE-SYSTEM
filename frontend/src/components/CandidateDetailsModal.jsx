import React, { useState } from "react";
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  BookOpen, 
  Award,
  Trash2
} from "lucide-react";
import { formatJobRole, formatSkill } from "../utils/formatters";
import { deleteCandidate } from "../services/api";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function CandidateDetailsModal({ candidate, onClose, onDeleteCandidate }) {
  if (!candidate) return null;

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const {
    name = "",
    initial = (candidate?.name ? candidate.name[0].toUpperCase() : "C"),
    avatarClass = "avatar-r",
    role = "",
    score = 0,
    status = "REVIEW",
    statusClass = "status-review",
    email = "",
    phone = "",
    location = "",
    experience = "",
    education = "",
    matchingSkills = [],
    missingSkills = [],
    summary = "",
    evaluationReason = ""
  } = candidate;

  const formattedRole = formatJobRole(role);
  const formattedMatching = (matchingSkills || []).map(formatSkill);
  const formattedMissing = (missingSkills || []).map(formatSkill);

  const recommendations = formattedMissing.map((skill) => ({
    skill,
    priority: "HIGH",
    action: `Bridge role prerequisites through targeted hands-on development in ${skill}.`,
    course: `${skill} Professional Certification & Best Practices`,
    provider: "Official Curriculum / Coursera"
  }));

  const handleConfirmDeleteCandidate = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCandidate(candidate.id);
      if (onDeleteCandidate) {
        onDeleteCandidate(candidate.id);
      }
      setShowConfirmDelete(false);
      onClose();
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      setDeleteError(err.message || "Unable to delete candidate. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1.5px solid var(--border-subtle)",
          paddingBottom: "16px",
          marginBottom: "20px"
        }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-orange)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Evidence-Based Candidate Analysis
            </span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "2px" }}>
              {name || "Candidate Details"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button 
              onClick={() => {
                setDeleteError(null);
                setShowConfirmDelete(true);
              }}
              className="btn-delete"
              style={{ padding: "6px 14px" }}
              title="Delete candidate"
            >
              <Trash2 size={15} />
              Delete
            </button>

            <button 
              onClick={onClose}
              className="btn-view"
              style={{ padding: "6px 12px" }}
            >
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        {/* Two-Column Professional Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px", marginBottom: "24px" }}>
          {/* LEFT COLUMN: Candidate Profile, Education, Experience, Skills */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Candidate Profile Card */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid var(--border-card)",
              borderRadius: "var(--radius-md)",
              padding: "18px"
            }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div className={`avatar-circle ${avatarClass}`} style={{ width: "28px", height: "28px", fontSize: "0.8rem" }}>
                  {initial}
                </div>
                Candidate Profile
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Target Role: </span>
                  <strong style={{ color: "var(--text-dark)" }}>{formattedRole || "-"}</strong>
                </div>
                {email && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-body)" }}>
                    <Mail size={14} color="#C65A0A" />
                    <span>{email}</span>
                  </div>
                )}
                {phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-body)" }}>
                    <Phone size={14} color="#C65A0A" />
                    <span>{phone}</span>
                  </div>
                )}
                {location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-body)" }}>
                    <MapPin size={14} color="#C65A0A" />
                    <span>{location}</span>
                  </div>
                )}
              </div>

              {/* Candidate Summary */}
              {summary && (
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Summary:
                  </span>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-body)", lineHeight: 1.5 }}>
                    {summary}
                  </p>
                </div>
              )}
            </div>

            {/* Experience Card */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid var(--border-card)",
              borderRadius: "var(--radius-md)",
              padding: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-orange)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
                <Briefcase size={15} />
                Experience
              </div>
              <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "4px" }}>
                {experience || "Not specified"}
              </p>
            </div>

            {/* Education Card */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid var(--border-card)",
              borderRadius: "var(--radius-md)",
              padding: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-orange)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
                <GraduationCap size={15} />
                Education
              </div>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "4px" }}>
                {education || "Not specified"}
              </p>
            </div>

            {/* Candidate Skills List */}
            {([...formattedMatching, ...formattedMissing].length > 0) && (
              <div style={{
                background: "#ffffff",
                border: "1.5px solid var(--border-card)",
                borderRadius: "var(--radius-md)",
                padding: "16px"
              }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" }}>
                  Skills Reported
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {[...formattedMatching, ...formattedMissing].map((sk) => (
                    <span key={sk} className="skill-badge">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Match Score, Matching Skills, Missing Skills, AI Evaluation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Match Score Card */}
            <div style={{
              background: "var(--accent-orange-light)",
              border: "1.5px solid var(--accent-orange-border)",
              borderRadius: "var(--radius-md)",
              padding: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-orange)", textTransform: "uppercase" }}>
                  Match Score
                </span>
                <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--text-dark)", lineHeight: 1.1 }}>
                  {score}%
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: score >= 75 ? "#059669" : (score >= 50 ? "#d97706" : "#dc2626") }}>
                  {score >= 75 ? "Recommended for Interview" : (score >= 50 ? "Recommended for Review" : "Requires Evaluation")}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                <span className={`status-pill ${statusClass}`}>
                  {status}
                </span>
              </div>
            </div>

            {/* Matching Skills Card */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid #a7f3d0",
              borderRadius: "var(--radius-md)",
              padding: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <CheckCircle2 size={16} color="#059669" />
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#065f46" }}>
                  Matching Skills ({formattedMatching.length})
                </h4>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {formattedMatching.length > 0 ? (
                  formattedMatching.map((sk) => (
                    <span key={sk} className="skill-badge skill-badge-match">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No matching skills detected</span>
                )}
              </div>
            </div>

            {/* Missing Skills Card */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid #fecaca",
              borderRadius: "var(--radius-md)",
              padding: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <AlertTriangle size={16} color="#dc2626" />
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#991b1b" }}>
                  Missing Skills ({formattedMissing.length})
                </h4>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {formattedMissing.length > 0 ? (
                  formattedMissing.map((sk) => (
                    <span key={sk} className="skill-badge skill-badge-missing">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#059669" }}>No missing skills</span>
                )}
              </div>
            </div>

            {/* AI Evaluation Card */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid var(--border-card)",
              borderRadius: "var(--radius-md)",
              padding: "16px"
            }}>
              <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Award size={15} color="#C65A0A" />
                AI Evaluation
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-body)", lineHeight: 1.5 }}>
                {evaluationReason || "Evidence-based match score derived from NLP semantic similarity and required skill overlap."}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Skill Gap Analysis & Learning Recommendations */}
        <div style={{
          background: "#ffffff",
          border: "1.5px solid var(--border-card)",
          borderRadius: "var(--radius-md)",
          padding: "18px",
          marginBottom: "20px"
        }}>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={16} color="#C65A0A" />
            Skill Gap Analysis & Learning Recommendations
          </h3>

          {recommendations.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  background: "#faf8f5",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--text-dark)" }}>
                      Target: {rec.skill}
                    </strong>
                    <span className="status-pill status-review" style={{ fontSize: "0.68rem" }}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-body)", marginTop: "4px" }}>
                    {rec.action}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--orange-dark)", marginTop: "2px", fontWeight: 600 }}>
                    Recommended: {rec.course} &bull; {rec.provider}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.82rem", color: "#059669" }}>
              Candidate fulfills all technical and contextual skill specifications.
            </p>
          )}
        </div>

        {/* Decision-Support Language Notice */}
        <div className="disclaimer-card" style={{ marginBottom: "20px" }}>
          <ShieldCheck size={20} color="#C65A0A" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>Recruiter Decision Support:</strong> Evidence-Based Candidate Analysis generated to assist hiring teams. Final hiring decision remains with the recruiter.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button className="btn-secondary" onClick={onClose}>
            Back
          </button>
          <button 
            className="btn-primary" 
            onClick={() => {
              alert(`Candidate ${name} shortlisted for recruiter interview!`);
              onClose();
            }}
          >
            Shortlist for Interview
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={showConfirmDelete}
          title="Are you sure you want to delete this candidate?"
          message="This will permanently remove the candidate and related evaluation data."
          itemName={name}
          itemType="candidate"
          confirmText="Delete Candidate"
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={handleConfirmDeleteCandidate}
          onCancel={() => {
            if (!isDeleting) {
              setShowConfirmDelete(false);
              setDeleteError(null);
            }
          }}
        />
      </div>
    </div>
  );
}
