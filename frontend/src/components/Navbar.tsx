import React, { useState } from 'react';
import { SystemHealth } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  health: SystemHealth | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, health }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'INDEX' },
    { id: 'projects', label: 'PROJECTS' },
    { id: 'engineering', label: 'ENGINEERING' },
    { id: 'benchmarks', label: 'BENCHMARKS' },
    { id: 'github', label: 'GITHUB' },
    { id: 'about', label: 'ABOUT' },
    { id: 'contact', label: 'CONTACT' },
  ];

  const handleNav = (id: string) => {
    onSelectTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Top System Status Bar */}
      <div className="system-status-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="status-dot active" />
          <span>BACKEND: FLAP v{health?.framework_version || '1.0.0'}</span>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span style={{ color: health?.engine === 'rust' ? 'var(--accent)' : 'var(--text-secondary)' }}>
            ENGINE: {health?.engine ? health.engine.toUpperCase() : 'PYTHON'} (TOKIO+HYPER / UVLOOP)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span>HOST: 0.0.0.0:{health ? '8000' : '...'}</span>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span>GITHUB: @revamptori</span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="navbar">
        <div className="container nav-container">
          <a
            href="#home"
            className="nav-brand"
            onClick={(e) => {
              e.preventDefault();
              handleNav('home');
            }}
          >
            TORI <span className="accent-slash">//</span> SYSTEMS
          </a>

          <button
            className="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <nav>
            <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
                    onClick={() => handleNav(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};
