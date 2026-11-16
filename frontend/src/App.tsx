import React, { useState, useEffect } from 'react';
import { Project, GitHubRepo, SystemHealth } from './types';
import { fetchHealth, fetchProjects, fetchRepositories } from './api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { EngineeringPage } from './pages/EngineeringPage';
import { BenchmarksPage } from './pages/BenchmarksPage';
import { GitHubPage } from './pages/GitHubPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  // Initial load: health, projects, repos
  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((err) => console.error('Health check failed:', err));

    fetchProjects()
      .then(setProjects)
      .catch((err) => console.error('Fetch projects failed:', err));

    fetchRepositories()
      .then(setRepos)
      .catch((err) => console.error('Fetch repos failed:', err));

    // Handle hash routing on initial load
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && ['home', 'projects', 'engineering', 'benchmarks', 'github', 'about', 'contact'].includes(hash)) {
      setCurrentTab(hash);
    }
  }, []);

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setSelectedProject(null);
    window.location.hash = tab === 'home' ? '' : `#${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProjectDetail = (proj: Project) => {
    setSelectedProject(proj);
    setCurrentTab('project-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (currentTab === 'project-detail' && selectedProject) {
      const liveRepo = repos.find(
        (r) =>
          selectedProject.github_repo_name &&
          r.name.toLowerCase() === selectedProject.github_repo_name.toLowerCase()
      );
      return (
        <ProjectDetailPage
          project={selectedProject}
          liveRepo={liveRepo}
          onBack={() => handleSelectTab('projects')}
        />
      );
    }

    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            projects={projects}
            repos={repos}
            health={health}
            onSelectTab={handleSelectTab}
            onOpenProjectDetail={handleOpenProjectDetail}
          />
        );
      case 'projects':
        return (
          <ProjectsPage
            projects={projects}
            repos={repos}
            onOpenDetail={handleOpenProjectDetail}
          />
        );
      case 'engineering':
        return <EngineeringPage />;
      case 'benchmarks':
        return <BenchmarksPage />;
      case 'github':
        return <GitHubPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <NotFoundPage onReturnHome={() => handleSelectTab('home')} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        currentTab={currentTab === 'project-detail' ? 'projects' : currentTab}
        onSelectTab={handleSelectTab}
        health={health}
      />

      <main style={{ flex: 1 }}>{renderContent()}</main>

      <Footer health={health} onSelectTab={handleSelectTab} />
    </div>
  );
};

export default App;
