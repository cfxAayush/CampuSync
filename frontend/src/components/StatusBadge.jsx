import React from 'react';
import { Clock, Search, Calendar, CheckCircle2, XCircle, Check } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getStatusConfig = (st) => {
    switch (st) {
      case 'APPLIED':
        return {
          label: 'Applied',
          className: 'badge badge-applied',
          icon: <Clock size={12} strokeWidth={2.2} />,
        };
      case 'IN_REVIEW':
        return {
          label: 'In Review',
          className: 'badge badge-review',
          icon: <Search size={12} strokeWidth={2.2} />,
        };
      case 'INTERVIEWING':
        return {
          label: 'Interviewing',
          className: 'badge badge-interview',
          icon: <Calendar size={12} strokeWidth={2.2} />,
        };
      case 'SELECTED':
        return {
          label: 'Selected',
          className: 'badge badge-selected',
          icon: <CheckCircle2 size={12} strokeWidth={2.2} />,
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          className: 'badge badge-rejected',
          icon: <XCircle size={12} strokeWidth={2.2} />,
        };
      default:
        return {
          label: st || 'Unknown',
          className: 'badge badge-neutral',
          icon: <Clock size={12} strokeWidth={2.2} />,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={config.className}>
      {config.icon}
      <span>{config.label}</span>
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--status-rejected-bg)',
          border: '1px solid var(--status-rejected-border)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <XCircle size={16} style={{ color: 'var(--status-rejected-text)' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-rejected-text)' }}>
            Application Closed
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Candidate not moved forward for this cycle
        </span>
      </div>
    );
  }

  const getStageIndex = (st) => {
    const idx = stages.findIndex((s) => s.key === st);
    return idx >= 0 ? idx : 0;
  };

  const currentIdx = getStageIndex(currentStatus);

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* Background connecting line */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '20px',
            right: '20px',
            height: '2px',
            backgroundColor: 'var(--border-color)',
            zIndex: 0,
          }}
        />

        {stages.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={stage.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                zIndex: 1,
                minWidth: '60px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                  backgroundColor: isCompleted
                    ? 'var(--status-selected-text)'
                    : isCurrent
                    ? 'var(--accent-primary)'
                    : 'var(--bg-surface)',
                  color: isCompleted || isCurrent ? '#FFFFFF' : 'var(--text-muted)',
                  border: isCompleted
                    ? '2px solid var(--status-selected-text)'
                    : isCurrent
                    ? '2px solid var(--accent-primary)'
                    : '2px solid var(--border-color)',
                }}
              >
                {isCompleted ? <Check size={13} strokeWidth={2.8} /> : idx + 1}
              </div>
              <span
                style={{
                  fontSize: '0.71875rem',
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textAlign: 'center',
                }}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
