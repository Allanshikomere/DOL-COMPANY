'use client';

import React from 'react';
import { CheckCircle2, ListChecks, ArrowUpRight } from 'lucide-react';
import { SHEET1_ENHANCEMENTS } from '../lib/initialData';

export const Sheet1View: React.FC = () => {
  return (
    <div className="ledger-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <ListChecks size={22} color="var(--accent-blue)" />
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Sheet1 — System Enhancement Roadmap & Audit</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Original recommendations documented in TRACKER2 Sheet1 and implemented in this web app
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {SHEET1_ENHANCEMENTS.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                className={`badge ${
                  item.priority === 'High'
                    ? 'badge-warning'
                    : item.priority.includes('Medium')
                    ? 'badge-info'
                    : 'badge-neutral'
                }`}
              >
                {item.priority}
              </span>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{item.area}</strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {item.suggestion}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Implemented</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
