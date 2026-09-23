'use client';

import React from 'react';
import { BookOpen, CheckCircle, HelpCircle, Layers, ShieldCheck } from 'lucide-react';
import { SPREADSHEET_GUIDE_RULES } from '../lib/initialData';

interface HowItWorksModalProps {
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 760 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen color="var(--accent-blue)" size={22} />
            <div>
              <h3>How This System Works — Official Guide</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Operational rules, float mechanics, and reconciliation logic from TRACKER2
              </p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {SPREADSHEET_GUIDE_RULES.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--odoo-teal)' }}>
                  <CheckCircle size={16} color="var(--accent-emerald)" />
                  {rule.title}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {rule.text}
                </p>
              </div>
            ))}

            {/* Worked Example */}
            <div
              style={{
                background: 'var(--accent-blue-dim)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1.15rem',
              }}
            >
              <strong style={{ color: 'var(--odoo-teal)', fontSize: '0.9rem' }}>
                Worked Example (from the original spreadsheet):
              </strong>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', marginTop: '0.4rem', lineHeight: 1.6 }}>
                Say you give out 30 Type A phones and 10 Type B phones, and all of them reconcile the same day:
                <br />
                Type 30 in D, 30 in E, 10 in F and 10 in G. The system works out <strong>111,000 + 35,700 = 146,700 cash out</strong>, <strong>152,000 cash back</strong>, <strong>4,000 profit taken out</strong> and <strong>1,300 to the 2nd account</strong>.
                <br />
                The float ends exactly where it started — the cost of every phone returns to it, and only the earnings are withdrawn.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
