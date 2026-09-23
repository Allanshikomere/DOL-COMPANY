'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RefreshCw,
  Download,
  RotateCcw,
  Check,
  Database,
  ShieldCheck,
  Clock,
  HardDrive,
  AlertTriangle,
  FileCode,
  FileCheck,
  Archive,
  ArrowDownToLine,
  CheckCircle2,
  Trash2,
  PlusCircle,
  Smartphone,
  Plus
} from 'lucide-react';
import { PhoneTypeConfig, MonthData } from '../lib/types';
import { exportBackupJSON } from '../lib/storage';

interface BackupFileInfo {
  filename: string;
  type: 'sqlite' | 'json';
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
}

interface BackupStatus {
  lastBackupTime: string | null;
  nextBackupDue: string;
  autoBackupActive: boolean;
  totalBackups: number;
}

interface SettingsModalProps {
  phoneTypes: PhoneTypeConfig[];
  months: MonthData[];
  onSavePhoneTypes: (types: PhoneTypeConfig[]) => void;
  onResetDefaults: () => void;
  onClose: () => void;
  onRestoreCompleted?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  phoneTypes,
  months,
  onSavePhoneTypes,
  onResetDefaults,
  onClose,
  onRestoreCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'backups' | 'assumptions'>('backups');
  const [types, setTypes] = useState<PhoneTypeConfig[]>(JSON.parse(JSON.stringify(phoneTypes)));
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Phone Model Creator State
  const [isAddingNewPhone, setIsAddingNewPhone] = useState(false);
  const [newPhoneName, setNewPhoneName] = useState('');
  const [newPhoneModel, setNewPhoneModel] = useState('');
  const [newPhoneCost, setNewPhoneCost] = useState<number>(3700);
  const [newPhoneReturn, setNewPhoneReturn] = useState<number>(3800);
  const [newPhoneProfit, setNewPhoneProfit] = useState<number>(100);
  const [newPhoneSpread, setNewPhoneSpread] = useState<number>(0);

  // Backup System State
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [backupsList, setBackupsList] = useState<BackupFileInfo[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [restoringFilename, setRestoringFilename] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBackupData = async () => {
    setIsLoadingBackups(true);
    try {
      const res = await fetch('/api/backup');
      const json = await res.json();
      if (json.success && json.data) {
        setBackupStatus(json.data.status);
        setBackupsList(json.data.backups);
      }
    } catch (e: any) {
      console.error('Failed to fetch backup status:', e);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    fetchBackupData();
  }, []);

  const handlePriceChange = (
    id: string,
    field: keyof PhoneTypeConfig,
    value: number | string
  ) => {
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleAddNewPhone = () => {
    if (!newPhoneName.trim()) {
      alert('Please enter a phone model name (e.g. Type D, Samsung A16).');
      return;
    }
    const slug = newPhoneName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `type-${slug || Date.now()}`;
    if (types.some((t) => t.id === id)) {
      alert(`A phone model with ID "${id}" already exists. Please choose a different name.`);
      return;
    }
    const newType: PhoneTypeConfig = {
      id,
      name: newPhoneName.trim(),
      model: newPhoneModel.trim() || 'Custom Model',
      cost: Number(newPhoneCost) || 0,
      returnCash: Number(newPhoneReturn) || 0,
      baseProfit: Number(newPhoneProfit) || 0,
      secondAccountSpread: Number(newPhoneSpread) || 0,
    };
    const updated = [...types, newType];
    setTypes(updated);
    onSavePhoneTypes(updated);
    setIsAddingNewPhone(false);
    setNewPhoneName('');
    setNewPhoneModel('');
    setNewPhoneCost(3700);
    setNewPhoneReturn(3800);
    setNewPhoneProfit(100);
    setNewPhoneSpread(0);
    setNotification({ type: 'success', message: `Added new phone model "${newType.name}" successfully!` });
  };

  const handleDeletePhone = (id: string, name: string) => {
    if (id === 'type-a' || id === 'type-b' || id === 'type-c') {
      alert('Core spreadsheet phone types (Type A, Type B, Type C Pop 20) are protected and cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete phone model "${name}"?`)) {
      const updated = types.filter((t) => t.id !== id);
      setTypes(updated);
      onSavePhoneTypes(updated);
      setNotification({ type: 'success', message: `Removed phone model "${name}".` });
    }
  };

  const handleSave = () => {
    onSavePhoneTypes(types);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data and pricing back to spreadsheet defaults?')) {
      onResetDefaults();
      onClose();
    }
  };

  const handleCreateManualBackup = async () => {
    setIsCreatingBackup(true);
    setNotification(null);
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_backup' }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: 'Backup created successfully! Both SQLite .db and JSON snapshots saved.' });
        if (json.data) {
          setBackupStatus(json.data.status);
          setBackupsList(json.data.backups);
        } else {
          fetchBackupData();
        }
      } else {
        setNotification({ type: 'error', message: json.error || 'Failed to create backup' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Network error' });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestore = async (filename: string) => {
    const isDb = filename.endsWith('.db');
    const msg = isDb
      ? `Are you sure you want to restore the entire SQLite database from "${filename}"?\n\nA safety pre-restore backup of your current database will be saved first.`
      : `Are you sure you want to restore all ledger records from JSON snapshot "${filename}"?`;

    if (!confirm(msg)) return;

    setRestoringFilename(filename);
    setNotification(null);

    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', filename }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message || 'Restoration complete!' });
        if (json.data) {
          setBackupStatus(json.data.status);
          setBackupsList(json.data.backups);
        }
        if (onRestoreCompleted) {
          onRestoreCompleted();
        }
      } else {
        setNotification({ type: 'error', message: json.error || 'Restoration failed' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Network error during restore' });
    } finally {
      setRestoringFilename(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 740, width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-purple-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
              }}
            >
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
                System Controls & 24h Auto-Backup
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Continuous 24-hour automated data protection, restore points & unit assumptions
              </p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)',
            padding: '0.5rem 1.25rem 0',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={() => setActiveTab('backups')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'backups' ? 'var(--bg-surface)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'backups' ? '2px solid var(--odoo-purple)' : '2px solid transparent',
              color: activeTab === 'backups' ? 'var(--odoo-purple)' : 'var(--text-muted)',
              borderTopLeftRadius: 'var(--radius-md)',
              borderTopRightRadius: 'var(--radius-md)',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldCheck size={15} />
            24h Auto-Backup & Recovery
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981',
                marginLeft: 3,
              }}
            />
          </button>

          <button
            onClick={() => setActiveTab('assumptions')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'assumptions' ? 'var(--bg-surface)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'assumptions' ? '2px solid var(--odoo-purple)' : '2px solid transparent',
              color: activeTab === 'assumptions' ? 'var(--odoo-purple)' : 'var(--text-muted)',
              borderTopLeftRadius: 'var(--radius-md)',
              borderTopRightRadius: 'var(--radius-md)',
              transition: 'all 0.15s ease',
            }}
          >
            <Sliders size={15} />
            Unit Assumptions & Economics
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '1.25rem' }}>
          {/* Notification Toast */}
          {notification && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: notification.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              }}
            >
              {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{notification.message}</span>
            </div>
          )}

          {activeTab === 'backups' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Status Header Card */}
              <div
                style={{
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '9999px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: 'var(--accent-emerald)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#10b981',
                          boxShadow: '0 0 8px #10b981',
                        }}
                      />
                      Continuous Protection Active
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Retention: <strong>30-Day Auto-Rotation</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={fetchBackupData}
                      disabled={isLoadingBackups}
                      title="Refresh backup status"
                    >
                      <RefreshCw size={13} className={isLoadingBackups ? 'spin' : ''} />
                      Refresh
                    </button>

                    <button
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={handleCreateManualBackup}
                      disabled={isCreatingBackup}
                    >
                      {isCreatingBackup ? (
                        <>
                          <RefreshCw size={13} className="spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <HardDrive size={13} />
                          Backup Now
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3 Metric Tiles */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                      <Clock size={12} color="var(--accent-purple)" />
                      NEXT AUTO-BACKUP
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--odoo-purple)' }}>
                      {backupStatus?.nextBackupDue || 'In 24 hours'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Frequency: Every 24 hours
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                      <ShieldCheck size={12} color="var(--accent-emerald)" />
                      LAST SNAPSHOT
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {backupStatus?.lastBackupTime
                        ? new Date(backupStatus.lastBackupTime).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Initialized'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Dual: .db binary + .json
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                      <Archive size={12} color="var(--odoo-teal)" />
                      SNAPSHOTS ON DISK
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--odoo-teal)' }}>
                      {backupsList.length} Files
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Stored in data/backups/
                    </div>
                  </div>
                </div>
              </div>

              {/* Restore Points List */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Archive size={15} color="var(--accent-purple)" />
                    Available Restore Points & Snapshots
                  </h4>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.725rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => exportBackupJSON(months, types)}
                  >
                    <Download size={12} />
                    Export Browser JSON
                  </button>
                </div>

                {backupsList.length === 0 ? (
                  <div
                    style={{
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      background: 'var(--bg-app)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--border-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                    }}
                  >
                    No backup files found yet. Click <strong>"Backup Now"</strong> above to take your first snapshot.
                  </div>
                ) : (
                  <div
                    style={{
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      overflow: 'hidden',
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Format</th>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Snapshot File</th>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Size</th>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Created</th>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backupsList.map((b, idx) => (
                          <tr
                            key={b.filename}
                            style={{
                              borderBottom: idx < backupsList.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                              background: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-app)',
                            }}
                          >
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              {b.type === 'sqlite' ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--accent-purple-dim)',
                                    color: 'var(--accent-purple)',
                                    fontWeight: 700,
                                    fontSize: '0.68rem',
                                  }}
                                >
                                  <Database size={10} />
                                  SQLite DB
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(1, 126, 132, 0.12)',
                                    color: 'var(--odoo-teal)',
                                    fontWeight: 700,
                                    fontSize: '0.68rem',
                                  }}
                                >
                                  <FileCode size={10} />
                                  JSON
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                              {b.filename}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>
                              {b.sizeFormatted}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>
                              {new Date(b.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <a
                                  href={`/api/backup?download=${encodeURIComponent(b.filename)}`}
                                  download={b.filename}
                                  className="btn-secondary"
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.7rem',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                  }}
                                  title="Download snapshot file to your computer"
                                >
                                  <ArrowDownToLine size={11} />
                                  Download
                                </a>

                                <button
                                  className="btn-secondary"
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.7rem',
                                    color: 'var(--accent-amber)',
                                    borderColor: 'rgba(180, 83, 9, 0.3)',
                                  }}
                                  onClick={() => handleRestore(b.filename)}
                                  disabled={restoringFilename === b.filename}
                                  title="Restore state from this snapshot"
                                >
                                  {restoringFilename === b.filename ? (
                                    <>
                                      <RefreshCw size={11} className="spin" />
                                      Restoring...
                                    </>
                                  ) : (
                                    <>
                                      <RotateCcw size={11} />
                                      Restore
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Safety Architecture Notice */}
              <div
                style={{
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.725rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ShieldCheck size={16} color="var(--odoo-teal)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Zero Data Loss Guarantee:</strong> Dual snapshots (atomic SQLite binary + portable JSON) are created automatically every 24 hours. When performing any restore, the system automatically creates a pre-restore safety copy first. Backups older than 30 days are automatically pruned to keep your system clean.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Phone Models Header & Add Button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.875rem' }}>Active Phone Types Catalog ({types.length})</strong>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: 0 }}>
                    Configure purchase cost, expected cash back, base profit, and secondary margins per unit.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ background: 'var(--odoo-teal)', color: '#ffffff', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => setIsAddingNewPhone(!isAddingNewPhone)}
                >
                  <PlusCircle size={14} />
                  {isAddingNewPhone ? 'Cancel' : '+ Add Phone Model'}
                </button>
              </div>

              {/* Dynamic Add Phone Model Form Card */}
              {isAddingNewPhone && (
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '2px dashed var(--odoo-teal)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    animation: 'fadeIn 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--odoo-teal)' }}>
                    <Smartphone size={16} />
                    <span>Create New Phone Model</span>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Type D or Samsung A16"
                        value={newPhoneName}
                        onChange={(e) => setNewPhoneName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="form-group">
                      <label>Model / Specification</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 128GB Dual SIM or Pop 30"
                        value={newPhoneModel}
                        onChange={(e) => setNewPhoneModel(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="form-group">
                      <label>Cost / Purchase (KES)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newPhoneCost}
                        onChange={(e) => setNewPhoneCost(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Cash Back / Return (KES)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newPhoneReturn}
                        onChange={(e) => setNewPhoneReturn(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Base Profit (KES)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newPhoneProfit}
                        onChange={(e) => setNewPhoneProfit(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label>2nd Acc Margin (KES)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newPhoneSpread}
                        onChange={(e) => setNewPhoneSpread(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                      onClick={() => setIsAddingNewPhone(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ background: 'var(--odoo-teal)', color: '#ffffff', fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
                      onClick={handleAddNewPhone}
                    >
                      <Check size={13} /> Save Phone Model
                    </button>
                  </div>
                </div>
              )}

              {types.map((type) => {
                const isCore = type.id === 'type-a' || type.id === 'type-b' || type.id === 'type-c';
                return (
                  <div key={type.id} className="settings-unit-card">
                    <div className="settings-unit-header">
                      <div>
                        <span style={{ fontWeight: 700 }}>{type.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          ({type.model})
                        </span>
                        {isCore && (
                          <span className="badge badge-purple" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                            Core SpreadSheet Model
                          </span>
                        )}
                        {!isCore && (
                          <span className="badge badge-success" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                            Custom Model
                          </span>
                        )}
                      </div>

                      {!isCore && (
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            padding: '0.2rem 0.45rem',
                            fontSize: '0.7rem',
                            color: 'var(--accent-rose)',
                            borderColor: 'rgba(190, 18, 60, 0.3)',
                          }}
                          onClick={() => handleDeletePhone(type.id, type.name)}
                          title="Delete this custom phone model"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Cost / Purchase (KES)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={type.cost}
                        onChange={(e) =>
                          handlePriceChange(type.id, 'cost', Number(e.target.value))
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Cash Back / Return (KES)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={type.returnCash}
                        onChange={(e) =>
                          handlePriceChange(type.id, 'returnCash', Number(e.target.value))
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Base Profit (KES)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={type.baseProfit}
                        onChange={(e) =>
                          handlePriceChange(type.id, 'baseProfit', Number(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  {type.id === 'type-b' && (
                    <div className="form-group" style={{ marginTop: '0.25rem' }}>
                      <label>2nd Account Margin Spread (KES)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={type.secondAccountSpread}
                        onChange={(e) =>
                          handlePriceChange(type.id, 'secondAccountSpread', Number(e.target.value))
                        }
                      />
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        Extra margin spread on Type B that flows to the secondary bank account.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  className="btn-secondary"
                  style={{ color: 'var(--accent-rose)' }}
                  onClick={handleReset}
                >
                  <RotateCcw size={14} />
                  Reset to Spreadsheet Defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            OYIGO Float Ledger v2.0 • Automatic 24h Protection
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            {activeTab === 'assumptions' && (
              <button className="btn-primary" onClick={handleSave}>
                {savedSuccess ? (
                  <>
                    <Check size={14} /> Saved!
                  </>
                ) : (
                  'Save Assumptions'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
