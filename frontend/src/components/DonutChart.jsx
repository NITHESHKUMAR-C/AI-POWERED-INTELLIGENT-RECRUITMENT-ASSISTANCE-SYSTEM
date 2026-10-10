import React from "react";

export default function DonutChart({ 
  total = 0,
  data = []
}) {
  const radius = 54;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius; // ~339.29

  // Calculate cumulative offsets
  let accumulatedPercent = 0;

  return (
    <div className="donut-wrapper">
      {/* SVG Donut */}
      <div className="donut-svg-container">
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
          {/* Background circle track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {total > 0 && data.map((item, index) => {
            const fraction = total > 0 ? item.count / total : 0;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += fraction;

            return (
              <circle
                key={index}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="donut-center-text">
          <span className="donut-center-number">{total}</span>
          <span className="donut-center-label">Candidates</span>
        </div>
      </div>

      {/* Legend */}
      {data && data.length > 0 && (
        <div className="donut-legend">
          {data.map((item, idx) => (
            <div key={idx} className="legend-item">
              <div className="legend-left">
                <span className="legend-dot" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
              <span className="legend-count">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
