import React, { useState, useEffect, useRef } from 'react';
import { ContributionsData, ContributionDay } from '../types';
import { fetchContributions, refreshContributions } from '../api';

interface ContributionGraphProps {
  initialYear?: number;
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({ initialYear = 2026 }) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [data, setData] = useState<ContributionsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    day: ContributionDay | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    day: null,
  });

  const availableYears = [2026, 2025, 2024];
  const autoRefreshTimerRef = useRef<any>(null);

  const loadData = async (year: number, isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = isRefresh ? await refreshContributions(year) : await fetchContributions(year);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve GitHub contributions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedYear, false);

    // Automatic refresh every 5 minutes (300,000 ms)
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
    }
    autoRefreshTimerRef.current = setInterval(() => {
      loadData(selectedYear, true);
    }, 300000);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [selectedYear]);

  const handleCellMouseEnter = (e: React.MouseEvent<HTMLDivElement>, day: ContributionDay) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      day,
    });
  };

  const handleCellMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      return dt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dateStr;
    }
  };

  const formatLastUpdated = (isoStr?: string) => {
    if (!isoStr) return 'Recently';
    try {
      const dt = new Date(isoStr);
      return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  // Map GitHub contributionLevel to theme color
  const getCellColor = (day: ContributionDay): string => {
    if (day.contributionCount === 0) return 'var(--git-level-0)';
    switch (day.contributionLevel) {
      case 'FIRST_QUARTILE':
        return 'var(--git-level-1)';
      case 'SECOND_QUARTILE':
        return 'var(--git-level-2)';
      case 'THIRD_QUARTILE':
        return 'var(--git-level-3)';
      case 'FOURTH_QUARTILE':
        return 'var(--git-level-4)';
      default:
        return day.color || 'var(--git-level-1)';
    }
  };

  return (
    <div className="calendar-wrapper">
      {/* Calendar Header with Controls */}
      <div className="calendar-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h3 style={{ margin: 0 }}>GitHub Contribution Activity</h3>
            <a
              href="https://github.com/revamptori"
              target="_blank"
              rel="noopener noreferrer"
              className="mono-tag"
              style={{ color: 'var(--accent)', textDecoration: 'underline' }}
            >
              @revamptori ↗
            </a>
          </div>
          <div className="mono-tag">
            {data ? `${data.total_contributions.toLocaleString()} total contributions in ${selectedYear}` : 'Loading calendar data...'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Year Selector */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-surface-subtle)', padding: '2px', borderRadius: '2px' }}>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className="btn"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  backgroundColor: selectedYear === yr ? 'var(--bg-active)' : 'transparent',
                  borderColor: selectedYear === yr ? 'var(--border-strong)' : 'transparent',
                  color: selectedYear === yr ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => loadData(selectedYear, true)}
            disabled={refreshing || loading}
            className="btn"
            title="Fetch live updates from GitHub GraphQL API"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
              }}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>{refreshing ? 'REFRESHING...' : 'REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* Stale Cache Banner */}
      {data?.is_stale && (
        <div className="stale-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            Displaying cached snapshot (updated {formatLastUpdated(data.last_updated)}). Live GitHub API temporarily unreachable:{' '}
            {data.stale_reason || 'Rate limit or network delay'}.
          </span>
        </div>
      )}

      {/* Error state (no cache and failed) */}
      {error && !data && (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
          <p style={{ color: '#ef4444' }}>[ERR.UPSTREAM]: {error}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real GitHub data could not be retrieved. In accordance with strict portfolio integrity rules, fake contribution squares are never fabricated.
          </p>
          <button onClick={() => loadData(selectedYear, true)} className="btn" style={{ marginTop: '0.75rem' }}>
            RETRY GRAPHQL QUERY
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          [SYS.IO]: Executing GraphQL query contributionsCollection(login: "revamptori", year: {selectedYear})...
        </div>
      )}

      {/* Calendar Grid Display */}
      {data && (
        <div className="calendar-grid-container">
          {/* Weekday labels (Mon, Wed, Fri) */}
          <div className="weekday-labels">
            <span>&nbsp;</span>
            <span>Mon</span>
            <span>&nbsp;</span>
            <span>Wed</span>
            <span>&nbsp;</span>
            <span>Fri</span>
            <span>&nbsp;</span>
          </div>

          <div className="calendar-weeks-scroll">
            {/* Months row */}
            <div className="months-row">
              {data.months.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${(m.totalWeeks / 53) * 100}%`,
                    minWidth: '32px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.name}
                </div>
              ))}
            </div>

            {/* Weeks columns */}
            <div className="weeks-columns">
              {data.weeks.map((week, wIdx) => (
                <div key={wIdx} className="week-column">
                  {week.contributionDays.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className="day-cell"
                      style={{
                        backgroundColor: getCellColor(day),
                      }}
                      onMouseEnter={(e) => handleCellMouseEnter(e, day)}
                      onMouseLeave={handleCellMouseLeave}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend & Meta Footer */}
      {data && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            <span>LAST SYNC: {formatLastUpdated(data.last_updated)}</span>
            {data.cached && <span style={{ marginLeft: '0.75rem', color: 'var(--text-faint)' }}>(5-min cache active)</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Less</span>
            <div className="day-cell" style={{ backgroundColor: 'var(--git-level-0)' }} />
            <div className="day-cell" style={{ backgroundColor: 'var(--git-level-1)' }} />
            <div className="day-cell" style={{ backgroundColor: 'var(--git-level-2)' }} />
            <div className="day-cell" style={{ backgroundColor: 'var(--git-level-3)' }} />
            <div className="day-cell" style={{ backgroundColor: 'var(--git-level-4)' }} />
            <span>More</span>
          </div>
        </div>
      )}

      {/* Custom Tooltip */}
      {tooltip.visible && tooltip.day && (
        <div
          className="tooltip-box"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <strong>{tooltip.day.contributionCount} contributions</strong> on {formatDate(tooltip.day.date)}
        </div>
      )}
    </div>
  );
};
