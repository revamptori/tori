import React from 'react';

interface ArchitectureDiagramProps {
  title?: string;
  diagram: string;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ title, diagram }) => {
  return (
    <div style={{ margin: '1.25rem 0' }}>
      {title && (
        <div className="mono-tag" style={{ color: 'var(--accent)', marginBottom: '0.4rem' }}>
          [SYSTEM ARCHITECTURE // {title}]
        </div>
      )}
      <div className="diagram-container">
        {diagram.trim()}
      </div>
    </div>
  );
};
