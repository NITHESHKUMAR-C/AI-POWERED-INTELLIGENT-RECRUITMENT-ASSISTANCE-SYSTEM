import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Check, 
  Briefcase 
} from "lucide-react";
import { uploadResumes, analyzeCandidates } from "../services/api";
import { formatJobRole, formatSkill } from "../utils/formatters";

export default function ResumeUploadView({ jobs, onNavigate, onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(jobs && jobs.length > 0 ? jobs[0].id : "");
  const [isDragging, setIsDragging] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const fileInputRef = useRef(null);

  const handleFiles = (incomingFiles) => {
    const validFiles = [];
    const invalidNames = [];

    Array.from(incomingFiles).forEach((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (["pdf", "docx", "doc"].includes(ext)) {
        if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
          validFiles.push(file);
        }
      } else {
        invalidNames.push(file.name);
      }
    });

    if (invalidNames.length > 0) {
      setError(`Ignored unsupported file formats: ${invalidNames.join(", ")}. Please upload PDF or DOCX files.`);
    } else {
      setError(null);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select or drop at least one resume file.");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadStep(1);
    setUploadMessage("Uploading files...");

    try {
      setTimeout(() => {
        setUploadStep(2);
        setUploadMessage("Extracting candidate profiles...");
      }, 500);

      setTimeout(() => {
        setUploadStep(3);
        setUploadMessage("Analyzing semantic embeddings and skill matrices...");
      }, 1000);

      const uploadResp = await uploadResumes(selectedFiles, selectedJobId || null);
      setResults(uploadResp);

      if (onUploadComplete) onUploadComplete();

      if (selectedJobId) {
        await analyzeCandidates(selectedJobId);
      }

      setTimeout(() => {
        setUploadStep(4);
        setUploadMessage("Resumes processed and evaluated successfully!");
        setUploading(false);
        setSelectedFiles([]);
      }, 1500);
    } catch (err) {
      setError(err.message || "An error occurred while uploading resumes.");
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-content" style={{ maxWidth: "860px", margin: "0 auto", width: "100%" }}>
      <div className="content-card">
        <div className="card-header-row" style={{ borderBottom: "1.5px solid var(--border-subtle)", paddingBottom: "16px", marginBottom: "20px" }}>
          <div>
            <h2 className="card-header-title">Upload Resumes</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Drag & drop candidate resumes for automated NLP extraction and semantic scoring
            </p>
          </div>
          <button className="card-header-btn">
            Multiple Files
          </button>
        </div>

        {/* Requisition Dropdown */}
        <div className="form-group" style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-card)" }}>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Briefcase size={16} color="#C65A0A" />
            Evaluate Against Job Requisition
          </label>
          <select
            className="form-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">-- General Ingestion (Evaluate on Demand) --</option>
            {jobs && jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {formatJobRole(job.title)} ({job.department}) - {job.experience_required}+ yrs required
              </option>
            ))}
          </select>
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

        {/* Dropzone with thin dashed orange border */}
        <div
          className="upload-dropzone"
          style={{ padding: "36px 20px" }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />

          <div className="upload-icon-circle">
            <UploadCloud size={26} />
          </div>
          <h4>Drag & drop resumes here</h4>
          <p>Supports PDF, DOCX (Multiple files)</p>
          <button type="button" className="btn-primary" style={{ marginTop: "6px" }}>
            Choose Files
          </button>
        </div>

        {uploadMessage && (
          <p style={{ fontSize: "0.8rem", color: uploadStep === 4 ? "#059669" : "#C65A0A", textAlign: "center", marginTop: "12px", fontWeight: 600 }}>
            {uploadMessage}
          </p>
        )}

        {/* Stepper Workflow */}
        <div className="stepper-container" style={{ marginTop: "24px" }}>
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

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1.5px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)" }}>
                Selected Files ({selectedFiles.length})
              </h4>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                onClick={() => setSelectedFiles([])}
              >
                Clear All
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border-card)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FileText size={16} color="#C65A0A" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)" }}>
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}
                    onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn-primary"
                onClick={handleUploadAndAnalyze}
                disabled={uploading}
              >
                {uploading ? (uploadMessage || "Processing...") : `Upload & Analyze ${selectedFiles.length} Resume${selectedFiles.length > 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        )}

        {/* Results Confirmation */}
        {results && results.length > 0 && (
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1.5px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={18} />
                Successfully Processed {results.length} Candidates
              </h3>
              <button className="btn-view" onClick={() => onNavigate("candidates")}>
                View Candidates &rarr;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {results.map((res) => (
                <div key={res.id} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-card)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "0.95rem" }}>
                      {res.detected_name}
                    </span>
                    <span className="status-pill status-accept">Parsed</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                    {res.detected_skills?.map((sk) => (
                      <span key={sk} className="skill-badge skill-badge-match">
                        {formatSkill(sk)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
