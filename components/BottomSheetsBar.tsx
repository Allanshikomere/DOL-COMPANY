'use client';

import React from 'react';
import { Table, Plus, Menu, Lock } from 'lucide-react';

export type ActiveSheetView =
  | 'overview'
  | 'dashboard'
  | 'september'
  | 'all-months'
  | 'may-june'
  | 'july-august'
  | 'october'
  | 'november'
  | 'december'
  | 'sheet1'
  | 'documentation';

interface BottomSheetsBarProps {
  activeView: ActiveSheetView;
  onSelectView: (view: ActiveSheetView) => void;
  onAddSheet?: () => void;
}

export const BottomSheetsBar: React.FC<BottomSheetsBarProps> = ({
  activeView,
  onSelectView,
  onAddSheet,
}) => {
  const tabs: { id: ActiveSheetView; name: string; locked?: boolean }[] = [
    { id: 'overview', name: 'Samsung Tracker & Float Ledger' },
    { id: 'dashboard', name: 'DASHBOARD', locked: true },
    { id: 'september', name: 'SEPTEMBER', locked: true },
    { id: 'all-months', name: 'ALL MONTHS', locked: true },
    { id: 'may-june', name: 'MAY - JUNE', locked: true },
    { id: 'july-august', name: 'JULY-AUGUST', locked: true },
    { id: 'october', name: 'OCTOBER', locked: true },
    { id: 'november', name: 'NOVEMBER', locked: true },
    { id: 'december', name: 'DECEMBER', locked: true },
    { id: 'sheet1', name: 'Sheet1' },
    { id: 'documentation', name: 'DOCUMENTATION.md' },
  ];

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 40,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-card)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.5rem',
        overflowX: 'auto',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', paddingRight: '0.5rem', borderRight: '1px solid var(--border-subtle)' }}>
        <button
          className="btn-icon-close"
          style={{ width: 28, height: 28 }}
          onClick={onAddSheet}
          title="Add New Sheet"
        >
          <Plus size={15} />
        </button>
        <button
          className="btn-icon-close"
          style={{ width: 28, height: 28 }}
          title="All Sheets"
        >
          <Menu size={15} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '2px 0' }}>
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'var(--accent-purple-dim)' : 'transparent',
                color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-purple)' : '2px solid transparent',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.locked && <Lock size={10} style={{ opacity: 0.6 }} />}
              {tab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
