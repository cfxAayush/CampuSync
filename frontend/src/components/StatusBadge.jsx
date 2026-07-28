import React from 'react';
import { Clock, Eye, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getStatusConfig = (st) => {
    switch (st) {
      case 'APPLIED':
        return {
          label: 'Applied',
          className: 'applied',
          icon: <Clock size={13} />,
        };
      case 'IN_REVIEW':
        return {
          label: 'In Review',
          className: 'in_review',
          icon: <Eye size={13} />,
        };
      case 'INTERVIEWING':
        return {
          label: 'Interviewing',
          className: 'interviewing',
          icon: <MessageSquare size={13} />,
        };
      case 'SELECTED':
        return {
          label: 'Selected',
          className: 'selected',
          icon: <CheckCircle size={13} />,
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          className: 'rejected',
          icon: <XCircle size={13} />,
        };
      default:
        return {
          label: st || 'Unknown',
          className: 'applied',
          icon: <Clock size={13} />,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`status-badge ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export const ApplicationPipelineTracker = ({ currentStatus }) => {
  const stages = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'IN_REVIEW', label: 'In Review' },
    { key: 'INTERVIEWING', label: 'Interviewing' },
    { key: 'SELECTED', label: 'Selected' },
  ];

  if (currentStatus === 'REJECTED') {
    return (
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <StatusBadge status="REJECTED" />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          Application was not selected for this role.
        </p>
      </div>
    );
  }

  const getStageIndex = (st) => {
    const idx = stages.findIndex((s) => s.key === st);
    return idx >= 0 ? idx : 0;
  };

  const currentIdx = getStageIndex(currentStatus);

  return (
    <div className="pipeline-steps">
      {stages.map((stage, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;

        return (
          <div
            key={stage.key}
            className={`pipeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <div className="step-node">{idx + 1}</div>
            <div className="step-label">{stage.label}</div>
          </div>
        );
      })}
    </div>
  );
};
