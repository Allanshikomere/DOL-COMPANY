'use client';

import React, { useState } from 'react';
import { KeyRound, Lock, Check, ShieldAlert } from 'lucide-react';

interface PasswordModalProps {
  currentPassword: string;
  onSaveNewPassword: (newPass: string) => void;
  onUnlockSuccess?: () => void;
  isUnlockMode?: boolean;
  onClose: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  currentPassword,
  onSaveNewPassword,
  onUnlockSuccess,
  isUnlockMode = false,
  onClose,
}) => {
  const [enteredPass, setEnteredPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPass === currentPassword) {
      if (onUnlockSuccess) onUnlockSuccess();
      onClose();
    } else {
      setErrorMsg('Incorrect PIN or Password. Please try again.');
    }
  };

  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPass !== currentPassword) {
      setErrorMsg('Current password does not match.');
      return;
    }
    if (!newPass || newPass.length < 4) {
      setErrorMsg('New password must be at least 4 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    onSaveNewPassword(newPass);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <KeyRound color="var(--accent-blue)" size={20} />
            <div>
              <h3>{isUnlockMode ? 'Unlock Canvas' : 'Owner Security & Password'}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isUnlockMode
                  ? 'Enter Owner PIN to unlock inline editing'
                  : 'Manage PIN protection for ledger and canvas entries'}
              </p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={isUnlockMode ? handleUnlock : handleChangePass}>
          <div className="modal-body">
            {errorMsg && (
              <div className="alert-box danger">
                <ShieldAlert size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {success && (
              <div className="alert-box success">
                <Check size={16} />
                <span>Password updated successfully!</span>
              </div>
            )}

            <div className="form-group">
              <label>{isUnlockMode ? 'Owner PIN / Password' : 'Current Password'}</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter PIN (Default: 1234)"
                value={enteredPass}
                autoFocus
                onChange={(e) => {
                  setEnteredPass(e.target.value);
                  setErrorMsg(null);
                }}
              />
            </div>

            {!isUnlockMode && (
              <>
                <div className="form-group">
                  <label>New Password / PIN</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter at least 4 characters"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirm new password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isUnlockMode ? 'Unlock Canvas' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
