import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import DashboardView from "./components/DashboardView";
import CreateJobView from "./components/CreateJobView";
import ResumeUploadView from "./components/ResumeUploadView";
import CandidateResultsView from "./components/CandidateResultsView";
import ResumeAnalysisView from "./components/ResumeAnalysisView";
import AnalyticsView from "./components/AnalyticsView";
import SkillGapRecommendationsView from "./components/SkillGapRecommendationsView";
import CandidateDetailsModal from "./components/CandidateDetailsModal";
import { fetchDashboardStats, fetchJobs } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filterJobId, setFilterJobId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);

  const loadData = async () => {
    try {
      const [statsData, jobsData] = await Promise.all([
        fetchDashboardStats(),
        fetchJobs()
      ]);
      setStats(statsData);
      setJobs(jobsData);
    } catch (err) {
      console.warn("Error loading app data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNavigate = (tab, params = {}) => {
    if (params.jobId !== undefined) {
      setFilterJobId(params.jobId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJobCreated = (newJob) => {
    setJobs(prev => [newJob, ...prev]);
    loadData();
    setDataVersion(v => v + 1);
  };

  const handleJobDeleted = (jobId) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    if (filterJobId && String(filterJobId) === String(jobId)) {
      setFilterJobId("");
    }
    loadData();
    setDataVersion(v => v + 1);
  };

  const handleCandidateDeleted = (candidateId) => {
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate(null);
    }
    loadData();
    setDataVersion(v => v + 1);
  };

  const handleHeaderSearch = () => {
    if (searchQuery.trim()) {
      setActiveTab("candidates");
    }
  };

  return (
    <div className="app-layout">
      {/* Fixed Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <TopHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleHeaderSearch}
          onToggleMobileMenu={() => setMobileOpen(prev => !prev)}
        />

        {/* View Router */}
        {activeTab === "dashboard" && (
          <DashboardView
            stats={stats}
            onNavigate={handleNavigate}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            onUploadSuccess={loadData}
            onJobDeleted={handleJobDeleted}
            onCandidateDeleted={handleCandidateDeleted}
            onRefresh={loadData}
          />
        )}

        {activeTab === "jobs" && (
          <CreateJobView
            jobs={jobs}
            onJobCreated={handleJobCreated}
            onJobDeleted={handleJobDeleted}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === "upload" && (
          <ResumeUploadView
            jobs={jobs}
            onNavigate={handleNavigate}
            onUploadComplete={loadData}
          />
        )}

        {activeTab === "candidates" && (
          <CandidateResultsView
            jobs={jobs}
            initialJobId={filterJobId}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            onNavigate={handleNavigate}
            onCandidateDeleted={handleCandidateDeleted}
            dataVersion={dataVersion}
          />
        )}

        {activeTab === "analysis" && (
          <ResumeAnalysisView
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            onNavigate={handleNavigate}
            onCandidateDeleted={handleCandidateDeleted}
            dataVersion={dataVersion}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView
            stats={stats}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === "skills" && (
          <SkillGapRecommendationsView
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            onNavigate={handleNavigate}
            dataVersion={dataVersion}
          />
        )}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onDeleteCandidate={handleCandidateDeleted}
        />
      )}
    </div>
  );
}
