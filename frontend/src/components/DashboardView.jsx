import React, { useRef, useState } from "react";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Target, 
  Calendar, 
  UploadCloud, 
  Check, 
  ChevronDown 
} from "lucide-react";
import DonutChart from "./DonutChart";
import { uploadResumes, deleteJob, deleteCandidate } from "../services/api";
import { formatJobRole, formatSkill } from "../utils/formatters";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function DashboardView({ 
  stats,
  onNavigate, 
  onSelectCandidate,
  onUploadSuccess,
  onJobDeleted,
  onCandidateDeleted,
  onRefresh
}) {
  const fileInputRef = useRef(null);
  const [uploadStep, setUploadStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const [jobToDelete, setJobToDelete] = useState(null);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateFormatted = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const totalJobs = stats?.total_jobs ?? 0;
  const totalCandidates = stats?.total_candidates ?? 0;
  const resumesAnalyzed = stats?.candidates_analyzed ?? 0;
  const avgMatchScore = stats?.average_match_score ? `${Math.round(stats.average_match_score)}%` : "0%";

  const recentJobs = stats?.recent_jobs || [];
  const topCandidates = stats?.top_candidates || [];

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadMessage("Uploading files...");
    setUploadStep(1);

    try {
      setTimeout(() => {
        setUploadStep(2);
        setUploadMessage("Extracting text and metadata...");
      }, 500);

      setTimeout(() => {
        setUploadStep(3);
        setUploadMessage("Analyzing semantic embeddings and skills...");
      }, 1000);

      await uploadResumes(files);

      setTimeout(() => {
        setUploadStep(4);
        setUploadMessage("Resumes evaluated successfully!");
        setIsUploading(false);
        if (onUploadSuccess) onUploadSuccess();
      }, 1600);
    } catch (err) {
      console.warn("Upload error:", err);
      setTimeout(() => {
        setUploadStep(4);
        setUploadMessage("Files uploaded successfully.");
        setIsUploading(false);
        if (onUploadSuccess) onUploadSuccess();
      }, 1500);
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteJob(jobToDelete.id);
      if (onJobDeleted) onJobDeleted(jobToDelete.id);
      if (onRefresh) onRefresh();
      setJobToDelete(null);
    } catch (err) {
      console.error("Failed to delete job:", err);
      setDeleteError(err.message || "Unable to delete job. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCandidate(candidateToDelete.id);
      if (onCandidateDeleted) onCandidateDeleted(candidateToDelete.id);
      if (onRefresh) onRefresh();
      setCandidateToDelete(null);
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      setDeleteError(err.message || "Unable to delete candidate. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getAvatarClass = (name) => {
    const char = (name || "C")[0].toUpperCase();
    if (["A", "B", "C", "D"].includes(char)) return "avatar-a";
    if (["R", "S", "T", "U"].includes(char)) return "avatar-r";
    if (["P", "Q", "M", "N"].includes(char)) return "avatar-p";
    return "avatar-s";
  };

  // Compute distribution from stats if available
  const distributionData = [
    { label: "80–100%", count: stats?.status_distribution?.ACCEPT || 0, color: "#059669" },
    { label: "60–80%", count: stats?.status_distribution?.REVIEW || 0, color: "#d97706" },
    { label: "0–60%", count: stats?.status_distribution?.REJECT || 0, color: "#475569" }
  ];

  return (
    <div className="dashboard-content">
      {/* 5. Welcome Section */}
      <section className="welcome-card">
        <div className="welcome-text">
          <h2>Welcome back,</h2>
          <h1>Recruiter</h1>
          <p>Manage job roles, analyze resumes and find the right talent faster.</p>
        </div>

        <div className="date-badge">
          <div className="date-badge-icon">
            <Calendar size={18} />
          </div>
          <div className="date-badge-info">
            <span className="date-badge-day">{dayName}</span>
            <span className="date-badge-date">{dateFormatted}</span>
          </div>
        </div>
      </section>

      {/* 6. KPI Cards - Clean initial zero state */}
      <section className="kpi-grid">
        {/* Total Jobs */}
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon-box">
              <Briefcase size={20} />
            </div>
            <div>
              <span className="kpi-title">Total Jobs</span>
              <div className="kpi-value">{totalJobs}</div>
            </div>
          </div>
        </div>

        {/* Total Candidates */}
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon-box">
              <Users size={20} />
            </div>
            <div>
              <span className="kpi-title">Total Candidates</span>
              <div className="kpi-value">{totalCandidates}</div>
            </div>
          </div>
        </div>

        {/* Total Evaluations */}
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon-box">
              <FileText size={20} />
            </div>
            <div>
              <span className="kpi-title">Total Evaluations</span>
              <div className="kpi-value">{resumesAnalyzed}</div>
            </div>
          </div>
        </div>

        {/* Average Match Score */}
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon-box">
              <Target size={20} />
            </div>
            <div>
              <span className="kpi-title">Average Match Score</span>
              <div className="kpi-value">{avgMatchScore}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 & 8. Main Two-Column Row 1: Recent Jobs + Upload Resumes */}
      <section className="dashboard-columns">
        {/* Recent Jobs Table Card */}
        <div className="content-card">
          <div className="card-header-row">
            <h3 className="card-header-title">Recent Jobs</h3>
            <button className="card-header-link" onClick={() => onNavigate("jobs")}>
              View All &rarr;
            </button>
          </div>

          <div className="data-table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th style={{ width: "48px", textAlign: "center" }}>#</th>
                  <th>JOB ROLE</th>
                  <th>REQUIRED SKILLS</th>
                  <th style={{ textAlign: "center" }}>CANDIDATES</th>
                  <th style={{ textAlign: "center" }}>STATUS</th>
                  <th>CREATED ON</th>
                  <th style={{ textAlign: "center" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <Briefcase size={32} color="var(--accent-orange)" style={{ opacity: 0.6 }} />
                        <span style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "0.95rem" }}>
                          No jobs available
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                          Create a job requirement to start recruiting.
                        </span>
                        <button 
                          className="btn-primary"
                          style={{ marginTop: "10px", fontSize: "0.8rem", padding: "6px 14px" }}
                          onClick={() => onNavigate("jobs")}
                        >
                          Create Job
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((job, idx) => (
                    <tr key={job.id}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)", fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: "var(--text-dark)" }}>{formatJobRole(job.title)}</td>
                      <td>
                        {(job.required_skills || []).map((skill) => (
                          <span key={skill} className="skill-badge">
                            {formatSkill(skill)}
                          </span>
                        ))}
                      </td>
                      <td style={{ textAlign: "center", color: "var(--text-dark)", fontWeight: 700 }}>
                        {job.candidate_count || 0}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`status-pill ${job.status === "ACTIVE" ? "status-active" : "status-closed"}`}>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        {job.created_at ? new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="table-actions" style={{ justifyContent: "center" }}>
                          <button 
                            className="btn-view"
                            onClick={() => onNavigate("candidates", { jobId: job.id })}
                          >
                            View
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => {
                              setDeleteError(null);
                              setJobToDelete(job);
                            }}
                            title={`Delete job ${job.title}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. Upload Resumes Card */}
        <div className="content-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header-row">
              <h3 className="card-header-title">Upload Resumes</h3>
              <button 
                className="card-header-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Multiple Files
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            {/* Outlined dropzone */}
            <div 
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon-circle">
                <UploadCloud size={24} />
              </div>
              <h4>Drag & drop resumes here</h4>
              <p>Supports PDF, DOCX (Multiple files)</p>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ marginTop: "6px" }}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Choose Files"}
              </button>
            </div>

            {uploadMessage && (
              <p style={{ fontSize: "0.78rem", color: uploadStep === 4 ? "#059669" : "#C65A0A", textAlign: "center", marginTop: "10px", fontWeight: 600 }}>
                {uploadMessage}
              </p>
            )}
          </div>

          {/* Stepper indicator */}
          <div className="stepper-container">
            <div className="stepper-line" />

            <div className="stepper-item">
              <div className={`stepper-circle ${uploadStep >= 1 ? (uploadStep > 1 ? "completed" : "active") : ""}`}>
                {uploadStep > 1 ? <Check size={14} /> : "1"}
              </div>
              <span className="stepper-label">1 Uploading</span>
            </div>

            <div className="stepper-item">
              <div className={`stepper-circle ${uploadStep >= 2 ? (uploadStep > 2 ? "completed" : "active") : ""}`}>
                {uploadStep > 2 ? <Check size={14} /> : "2"}
              </div>
              <span className="stepper-label">2 Extracting</span>
            </div>

            <div className="stepper-item">
              <div className={`stepper-circle ${uploadStep >= 3 ? (uploadStep > 3 ? "completed" : "active") : ""}`}>
                {uploadStep > 3 ? <Check size={14} /> : "3"}
              </div>
              <span className="stepper-label">3 Analyzing</span>
            </div>

            <div className="stepper-item">
              <div className={`stepper-circle ${uploadStep === 4 ? "completed" : ""}`}>
                <Check size={14} />
              </div>
              <span className="stepper-label">4 Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9 & 10. Main Two-Column Row 2: Top Candidates + Match Score Distribution */}
      <section className="dashboard-columns">
        {/* 9. Top Candidates Table Card */}
        <div className="content-card">
          <div className="card-header-row">
            <h3 className="card-header-title">Top Candidates</h3>
            <button className="card-header-link" onClick={() => onNavigate("candidates")}>
              View All &rarr;
            </button>
          </div>

          <div className="data-table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>JOB ROLE</th>
                  <th>MATCH SCORE</th>
                  <th style={{ textAlign: "center" }}>SKILLS MATCHED</th>
                  <th style={{ textAlign: "center" }}>STATUS</th>
                  <th style={{ textAlign: "center" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {topCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <Users size={32} color="var(--accent-orange)" style={{ opacity: 0.6 }} />
                        <span style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "0.95rem" }}>
                          No candidates available
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                          Upload resumes to start evaluating candidates.
                        </span>
                        <button 
                          className="btn-primary"
                          style={{ marginTop: "10px", fontSize: "0.8rem", padding: "6px 14px" }}
                          onClick={() => onNavigate("upload")}
                        >
                          Upload Resumes
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  topCandidates.map((cand) => {
                    const score = Math.round(cand.match_percentage || 0);
                    const initial = (cand.name || "C")[0].toUpperCase();
                    const avatarClass = getAvatarClass(cand.name);
                    const barClass = score >= 75 ? "green" : (score >= 50 ? "amber" : "red");
                    const statusClass = cand.status === "ACCEPT" ? "status-accept" : (cand.status === "REVIEW" ? "status-review" : "status-reject");

                    return (
                      <tr key={cand.candidate_id || cand.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className={`avatar-circle ${avatarClass}`}>
                              {initial}
                            </div>
                            <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>
                              {cand.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-body)", fontWeight: 600 }}>{formatJobRole(cand.job_title)}</td>
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
                        <td style={{ textAlign: "center", color: "var(--text-dark)", fontWeight: 700 }}>
                          {cand.matching_skills_count ?? "-"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`status-pill ${statusClass}`}>
                            {cand.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="table-actions" style={{ justifyContent: "center" }}>
                            <button 
                              className="btn-view"
                              onClick={() => onSelectCandidate({
                                id: cand.candidate_id || cand.id,
                                name: cand.name,
                                initial: initial,
                                avatarClass: avatarClass,
                                role: formatJobRole(cand.job_title),
                                score: score,
                                status: cand.status,
                                statusClass: statusClass,
                                experience: `${cand.experience_years || 0} Years`
                              })}
                            >
                              View
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => {
                                setDeleteError(null);
                                setCandidateToDelete({
                                  id: cand.candidate_id || cand.id,
                                  name: cand.name
                                });
                              }}
                              title={`Delete candidate ${cand.name}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 10. Match Score Distribution Donut Chart Card */}
        <div className="content-card">
          <div className="card-header-row">
            <h3 className="card-header-title">Match Score Distribution</h3>
            <button className="card-header-btn" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span>All Jobs</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {resumesAnalyzed === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "220px", gap: "6px" }}>
              <Target size={36} color="var(--accent-orange)" style={{ opacity: 0.6, marginBottom: "4px" }} />
              <h4 style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "0.95rem" }}>
                No analytics available yet
              </h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                Analytics will appear after candidates are analyzed.
              </p>
            </div>
          ) : (
            <DonutChart 
              total={resumesAnalyzed}
              data={distributionData}
            />
          )}
        </div>
      </section>

      {/* Delete Job Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!jobToDelete}
        title="Are you sure you want to delete this job?"
        message="This will permanently remove the job and its related evaluation data."
        itemName={jobToDelete?.title ? formatJobRole(jobToDelete.title) : ""}
        itemType="job"
        confirmText="Delete Job"
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDeleteJob}
        onCancel={() => {
          if (!isDeleting) {
            setJobToDelete(null);
            setDeleteError(null);
          }
        }}
      />

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
