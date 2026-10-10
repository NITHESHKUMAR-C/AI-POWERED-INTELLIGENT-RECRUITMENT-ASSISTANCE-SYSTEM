import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  RefreshCw 
} from "lucide-react";
import { fetchCandidates, analyzeCandidates, deleteCandidate } from "../services/api";
import { formatJobRole, formatSkill } from "../utils/formatters";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function CandidateResultsView({ 
  jobs, 
  initialJobId, 
  onSelectCandidate,
  onNavigate,
  onCandidateDeleted,
  dataVersion
}) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const getAvatarClass = (name) => {
    const char = (name || "C")[0].toUpperCase();
    if (["A", "B", "C", "D"].includes(char)) return "avatar-a";
    if (["R", "S", "T", "U"].includes(char)) return "avatar-r";
    if (["P", "Q", "M", "N"].includes(char)) return "avatar-p";
    return "avatar-s";
  };

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await fetchCandidates({
        jobId: selectedJobId || undefined,
        status: statusFilter,
        search: searchQuery || undefined
      });
      setCandidates(data);
    } catch (err) {
      console.error("Failed to load candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [selectedJobId, statusFilter, dataVersion]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCandidates();
  };

  const handleConfirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCandidate(candidateToDelete.id);
      // Immediately remove from local state
      setCandidates(prev => prev.filter(c => c.id !== candidateToDelete.id));
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

  const handleRunAnalysis = async () => {
    if (!selectedJobId) {
      alert("Please select a job requisition to re-run AI evaluation.");
      return;
    }
    setAnalyzing(true);
    try {
      await analyzeCandidates(selectedJobId);
      await loadCandidates();
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="content-card">
        {/* Header & Re-analyze */}
        <div className="card-header-row">
          <div>
            <h2 className="card-header-title" style={{ fontSize: "1.25rem" }}>
              Candidates Directory
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Screen, rank, and review candidates evaluated with semantic embeddings and skill matching
            </p>
          </div>

          {selectedJobId && (
            <button
              className="btn-primary"
              style={{ fontSize: "0.82rem", padding: "8px 16px" }}
              onClick={handleRunAnalysis}
              disabled={analyzing}
            >
              <RefreshCw size={14} className={analyzing ? "animate-spin" : ""} />
              {analyzing ? "Evaluating..." : "Run AI Analysis"}
            </button>
          )}
        </div>

        {/* Filters Bar - Clean 3-Column Layout */}
        <div className="candidates-filter-container">
          {/* COLUMN 1: Filter by Job */}
          <div className="candidates-filter-group">
            <label className="candidates-filter-label">Filter by Job</label>
            <select
              className="candidates-filter-select"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">All Requisitions</option>
              {jobs && jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {formatJobRole(job.title)} ({job.department})
                </option>
              ))}
            </select>
          </div>

          {/* COLUMN 2: Evaluation Status */}
          <div className="candidates-filter-group">
            <label className="candidates-filter-label">Evaluation Status</label>
            <select
              className="candidates-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses (ACCEPT, REVIEW, REJECT)</option>
              <option value="ACCEPT">ACCEPT (≥ 75%)</option>
              <option value="REVIEW">REVIEW (50% - 74%)</option>
              <option value="REJECT">REJECT (&lt; 50%)</option>
            </select>
          </div>

          {/* COLUMN 3: Search Candidate */}
          <div className="candidates-filter-group">
            <label className="candidates-filter-label">Search Candidate</label>
            <form onSubmit={handleSearchSubmit} className="candidates-filter-form">
              <input
                type="text"
                className="candidates-filter-input"
                placeholder="Search candidate name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="candidates-filter-search-btn"
                title="Search candidate"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Candidates Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <p>Loading candidate evaluation records...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <Users size={36} color="var(--accent-orange)" style={{ opacity: 0.6, marginBottom: "8px" }} />
            <h4 style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "1rem", marginBottom: "4px" }}>
              No candidates available
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "14px" }}>
              Upload resumes to start evaluating candidates.
            </p>
            <button className="btn-primary" onClick={() => onNavigate("upload")}>
              Upload Resumes
            </button>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th style={{ width: "36px" }}>#</th>
                  <th>Candidate</th>
                  <th>Job Role</th>
                  <th>Match Score</th>
                  <th>Skills Matched</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((cand, idx) => {
                  const ev = cand.latest_evaluation;
                  const score = ev ? Math.round(ev.match_percentage) : 0;
                  const status = ev ? ev.status : "PENDING";
                  const initial = (cand.name || "C")[0].toUpperCase();
                  const avatarClass = getAvatarClass(cand.name);
                  const barClass = score >= 75 ? "green" : (score >= 50 ? "amber" : "red");
                  const statusClass = status === "ACCEPT" ? "status-accept" : (status === "REVIEW" ? "status-review" : (status === "REJECT" ? "status-reject" : "status-review"));
                  const matchedSkillsCount = ev ? (ev.matching_skills?.length || 0) : (cand.skills?.length || 0);
                  const totalRequired = ev ? (matchedSkillsCount + (ev.missing_skills?.length || 0)) : (cand.skills?.length || 0);

                  return (
                    <tr key={cand.id}>
                      <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className={`avatar-circle ${avatarClass}`}>
                            {initial}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>
                              {cand.name}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                              {cand.email || "No email specified"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-body)" }}>
                        {ev ? formatJobRole(ev.job_title) : "-"}
                      </td>
                      <td>
                        <div className="match-bar-container">
                          <span style={{ fontWeight: 700, color: "var(--text-dark)", width: "34px" }}>
                            {score}%
                          </span>
                          <div className="match-bar-track">
                            <div 
                              className={`match-bar-fill ${barClass}`} 
                              style={{ width: `${score}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-dark)", fontWeight: 600 }}>
                        {matchedSkillsCount}/{totalRequired || "-"}
                      </td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="table-actions">
                          <button 
                            className="btn-view"
                            onClick={() => onSelectCandidate({
                              id: cand.id,
                              name: cand.name,
                              initial: initial,
                              avatarClass: avatarClass,
                              role: ev ? formatJobRole(ev.job_title) : "-",
                              score: score,
                              status: status,
                              statusClass: statusClass,
                              email: cand.email || "-",
                              phone: cand.phone || "-",
                              experience: cand.experience_years ? `${cand.experience_years} Years` : "-",
                              education: cand.education || "-",
                              matchingSkills: (ev ? ev.matching_skills : (cand.skills || [])).map(formatSkill),
                              missingSkills: (ev ? ev.missing_skills : []).map(formatSkill),
                              summary: ev ? ev.ai_summary : "Resume parsed successfully.",
                              evaluationReason: ev ? ev.evaluation_reason : "Awaiting evaluation."
                            })}
                          >
                            View
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => {
                              setDeleteError(null);
                              setCandidateToDelete(cand);
                            }}
                            title={`Delete candidate ${cand.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
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
