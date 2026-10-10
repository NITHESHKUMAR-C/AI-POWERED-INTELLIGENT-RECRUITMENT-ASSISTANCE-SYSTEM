/**
 * REST API client for communicating with FastAPI backend
 */

const API_BASE = "http://127.0.0.1:8000";

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
  return res.json();
}

export async function fetchJobs() {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function fetchJob(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch job details");
  return res.json();
}

export async function createJob(jobData) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create job posting");
  }
  return res.json();
}

export async function uploadResumes(files, jobId = null) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  if (jobId) {
    formData.append("job_id", jobId);
  }

  const res = await fetch(`${API_BASE}/resumes/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload resumes");
  }
  return res.json();
}

export async function analyzeCandidates(jobId, candidateIds = null) {
  const payload = { job_id: parseInt(jobId) };
  if (candidateIds && candidateIds.length > 0) {
    payload.candidate_ids = candidateIds;
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to analyze candidates");
  }
  return res.json();
}

export async function fetchCandidates({ jobId, status, search } = {}) {
  const params = new URLSearchParams();
  if (jobId) params.append("job_id", jobId);
  if (status && status !== "ALL") params.append("status", status);
  if (search) params.append("search", search);

  const res = await fetch(`${API_BASE}/candidates?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch candidates");
  return res.json();
}

export async function fetchCandidateDetails(candidateId) {
  const res = await fetch(`${API_BASE}/candidates/${candidateId}`);
  if (!res.ok) throw new Error("Failed to fetch candidate details");
  return res.json();
}

export async function deleteCandidate(candidateId) {
  const res = await fetch(`${API_BASE}/candidates/${candidateId}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Unable to delete candidate. Please try again.");
  }
  return res.json();
}

export async function deleteJob(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Unable to delete job. Please try again.");
  }
  return res.json();
}

