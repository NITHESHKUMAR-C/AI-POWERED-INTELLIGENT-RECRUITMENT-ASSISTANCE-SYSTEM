import React from "react";
import { Search, Menu } from "lucide-react";

export default function TopHeader({ searchQuery, setSearchQuery, onSearch, onToggleMobileMenu }) {
  return (
    <header className="top-header">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-btn" 
        onClick={onToggleMobileMenu}
        title="Toggle Navigation"
      >
        <Menu size={18} />
      </button>

      {/* Search Field with visible thin dark-orange border */}
      <div className="header-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search jobs, candidates, skills..."
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearch) onSearch();
          }}
        />
      </div>
    </header>
  );
}
