import React, { useState } from "react";
import { 
  Briefcase, 
  Plus, 
  X, 
  Check, 
  AlertCircle,
  Trash2,
  Users
} from "lucide-react";
import { createJob, deleteJob } from "../services/api";
import { formatJobRole, formatSkill } from "../utils/formatters";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const SUGGESTED_SKILLS = [
  "Python", "FastAPI", "SQL", "Power BI", "React", "JavaScript", 
  "HTML", "CSS", "Machine Learning", "Deep Learning", "Docker", "Node.js", "TypeScript"
];

export default function CreateJobView({ jobs = [], onJobCreated, onJobDeleted, onNavigate }) {
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [experienceRequired, setExperienceRequired] = useState("");
  const [education, setEducation] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleAddSkill = (skillToAdd) => {
    const formatted = formatSkill(skillToAdd);
    if (formatted && !skills.includes(formatted)) {
      setSkills([...skills, formatted]);
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim() || !description.trim()) {
      setError("Please fill in both Job Role and Job Description.");
      return;
    }
    if (skills.length === 0) {
      setError("Please specify at least one required skill.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newJob = await createJob({
        title: formatJobRole(role.trim()),
        department: "Engineering",
        description: description.trim(),
        required_skills: skills.map(formatSkill),
        experience_required: parseFloat(experienceRequired) || 0,
        education_requirement: education.trim()
      });

      setSuccess(true);
      if (onJobCreated) onJobCreated(newJob);

      setTimeout(() => {
        onNavigate("dashboard");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to create job requisition.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteJob(jobToDelete.id);
      if (onJobDeleted) onJobDeleted(jobToDelete.id);
      setJobToDelete(null);
    } catch (err) {
      console.error("Failed to delete job:", err);
      setDeleteError(err.message || "Unable to delete job. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="dashboard-content" style={{ maxWidth: "780px", margin: "0 auto", width: "100%" }}>
      <div className="content-card">
        <div className="card-header-row" style={{ borderBottom: "1.5px solid var(--border-subtle)", paddingBottom: "16px", marginBottom: "22px" }}>
          <div>
            <h2 className="card-header-title">Create Job</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Define candidate prerequisites and role requirements for AI matching
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: "var(--status-closed-bg)",
            border: "1px solid var(--status-closed-border)",
            color: "var(--status-closed-text)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.85rem"
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: "var(--status-active-bg)",
            border: "1px solid var(--status-active-border)",
            color: "var(--status-active-text)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.85rem"
          }}>
            <Check size={18} />
            <span>Job created successfully! Returning to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Job Role */}
          <div className="form-group">
            <label className="form-label">Job Role *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Software Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          {/* Job Description */}
          <div className="form-group">
            <label className="form-label">Job Description *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe core role responsibilities, tech stack, and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Required Skills */}
          <div className="form-group">
            <label className="form-label">Required Skills *</label>
            
            {/* Active Skills Badges */}
            {skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="skill-badge"
                    style={{ 
                      background: "var(--accent-orange-light)", 
                      border: "1.5px solid var(--accent-orange-border)", 
                      color: "var(--accent-orange)", 
                      padding: "6px 12px", 
                      borderRadius: "var(--radius-sm)",
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "6px",
                      fontWeight: 600
                    }}
                  >
                    {skill}
                    <X
                      size={14}
                      style={{ cursor: "pointer", opacity: 0.8 }}
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type a skill and click Add..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleAddSkill(newSkillInput)}
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            {/* Suggestions */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Suggested:</span>
              {SUGGESTED_SKILLS.map((suggested) => (
                <button
                  key={suggested}
                  type="button"
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border-button)",
                    color: "var(--text-body)",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.75rem",
                    cursor: "pointer"
                  }}
                  onClick={() => handleAddSkill(suggested)}
                >
                  + {suggested}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Required & Education (2 Columns) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginTop: "16px" }}>
            <div className="form-group">
              <label className="form-label">Experience Required</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 0–2 Years"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Education</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B.E / B.Tech"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1.5px solid var(--border-subtle)"
          }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate("dashboard")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>

      {/* Job Management Directory Section */}
      <div className="content-card" style={{ marginTop: "24px" }}>
        <div className="card-header-row" style={{ borderBottom: "1.5px solid var(--border-subtle)", paddingBottom: "14px", marginBottom: "16px" }}>
          <div>
            <h3 className="card-header-title" style={{ fontSize: "1.1rem" }}>
              Active Job Postings
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Manage, review, and delete active job requirements across the recruitment pipeline
            </p>
          </div>
          <span className="card-header-btn">
            {jobs.length} {jobs.length === 1 ? "Requisition" : "Requisitions"}
          </span>
        </div>

        {jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Briefcase size={36} color="var(--accent-orange)" style={{ opacity: 0.6, marginBottom: "8px" }} />
            <h4 style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "1rem", marginBottom: "4px" }}>
              No jobs available
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Create a job requirement to start recruiting.
            </p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th style={{ width: "36px" }}>#</th>
                  <th>Job Role</th>
                  <th>Required Skills</th>
                  <th style={{ textAlign: "center" }}>Candidates</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, idx) => (
                  <tr key={job.id}>
                    <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--text-dark)", display: "block" }}>
                        {formatJobRole(job.title)}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {job.department || "Engineering"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {(job.required_skills || []).map((skill) => (
                          <span key={skill} className="skill-badge" style={{ fontSize: "0.72rem" }}>
                            {formatSkill(skill)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "var(--text-dark)" }}>
                      {job.candidate_count ?? 0}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`status-pill ${job.status === "ACTIVE" ? "status-active" : "status-closed"}`}>
                        {job.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-view"
                          onClick={() => onNavigate("candidates", { jobId: job.id })}
                        >
                          View
                        </button>
                        <button
                          type="button"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
}
