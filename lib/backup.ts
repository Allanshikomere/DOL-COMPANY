import fs from 'fs';
import path from 'path';
import { getDatabase, closeDatabase, fetchAllData, getDbPath } from './db';

export function getBackupDir(): string {
  const isVercel = !!process.env.VERCEL;
  const dir = isVercel ? path.join('/tmp', 'data', 'backups') : path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_BACKUP_RETENTION_DAYS = 30;

export interface BackupFileInfo {
  filename: string;
  type: 'sqlite' | 'json';
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
}

export interface BackupStatus {
  lastBackupTime: string | null;
  nextBackupDue: string;
  autoBackupActive: boolean;
  totalBackups: number;
}

/**
 * Ensures the backups directory exists.
 */
function ensureBackupDir(): void {
  getBackupDir();
}

/**
 * Formats bytes into a human-readable string.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Retrieves the timestamp of the last automated backup from the database.
 */
export function getLastBackupTime(): string | null {
  try {
    const db = getDatabase();
    const row: any = db.prepare("SELECT value FROM app_settings WHERE key = 'last_auto_backup_time'").get();
    return row?.value || null;
  } catch (e) {
    console.error('Failed to read last_auto_backup_time:', e);
    return null;
  }
}

/**
 * Updates the timestamp of the last automated backup.
 */
export function setLastBackupTime(timestamp: string): void {
  try {
    const db = getDatabase();
    db.prepare(`
      INSERT OR REPLACE INTO app_settings (key, value)
      VALUES ('last_auto_backup_time', ?)
    `).run(timestamp);
  } catch (e) {
    console.error('Failed to save last_auto_backup_time:', e);
  }
}

/**
 * Automatically prunes backup files older than MAX_BACKUP_RETENTION_DAYS (30 days).
 */
export function pruneOldBackups(): number {
  ensureBackupDir();
  let deletedCount = 0;
  const cutoffTime = Date.now() - MAX_BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  try {
    const files = fs.readdirSync(getBackupDir());
    for (const file of files) {
      if (!file.startsWith('tracker-backup-') && !file.startsWith('oyigo-snapshot-')) continue;
      const filePath = path.join(getBackupDir(), file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoffTime) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
  } catch (e) {
    console.error('Failed to prune old backups:', e);
  }
  return deletedCount;
}

/**
 * Performs a dual backup (binary SQLite copy + structured JSON export).
 */
export function createBackup(isManual = false): { dbFilename: string; jsonFilename: string } {
  ensureBackupDir();

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '');
  const suffix = isManual ? `manual_${dateStr}_${timeStr}` : `${dateStr}_${timeStr}`;

  const dbFilename = `tracker-backup-${suffix}.db`;
  const jsonFilename = `oyigo-snapshot-${suffix}.json`;

  const destDbPath = path.join(getBackupDir(), dbFilename);
  const destJsonPath = path.join(getBackupDir(), jsonFilename);

  // 1. Copy SQLite database file atomically
  if (fs.existsSync(getDbPath())) {
    fs.copyFileSync(getDbPath(), destDbPath);
  }

  // 2. Export full human-readable JSON snapshot
  try {
    const fullData = fetchAllData();
    const snapshotPayload = {
      backupVersion: '2.0',
      system: 'OYIGO Financial Float Ledger',
      createdAt: now.toISOString(),
      type: isManual ? 'manual' : 'scheduled-24h',
      data: fullData,
    };
    fs.writeFileSync(destJsonPath, JSON.stringify(snapshotPayload, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to generate JSON snapshot:', e);
  }

  // Update last backup timestamp
  setLastBackupTime(now.toISOString());

  // Prune any backups older than 30 days
  pruneOldBackups();

  return { dbFilename, jsonFilename };
}

/**
 * Checks if 24 hours have elapsed since the last automated backup and runs backup if needed.
 */
export function checkAndPerform24hBackup(): boolean {
  try {
    const lastBackup = getLastBackupTime();
    const now = Date.now();

    if (!lastBackup) {
      // First run: execute initial automated backup
      createBackup(false);
      return true;
    }

    const lastTime = new Date(lastBackup).getTime();
    if (isNaN(lastTime) || now - lastTime >= BACKUP_INTERVAL_MS) {
      createBackup(false);
      return true;
    }

    return false;
  } catch (e) {
    console.error('Error during 24h backup check:', e);
    return false;
  }
}

/**
 * Lists all existing backup files ordered by newest first.
 */
export function listBackups(): BackupFileInfo[] {
  ensureBackupDir();
  try {
    const files = fs.readdirSync(getBackupDir());
    const backups: BackupFileInfo[] = [];

    for (const file of files) {
      if (!file.startsWith('tracker-backup-') && !file.startsWith('oyigo-snapshot-')) continue;
      const filePath = path.join(getBackupDir(), file);
      const stat = fs.statSync(filePath);
      const type = file.endsWith('.db') ? 'sqlite' : 'json';

      backups.push({
        filename: file,
        type,
        sizeBytes: stat.size,
        sizeFormatted: formatBytes(stat.size),
        createdAt: stat.mtime.toISOString(),
      });
    }

    return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Failed to list backups:', e);
    return [];
  }
}

/**
 * Gets high-level backup system status and countdown.
 */
export function getBackupStatus(): BackupStatus {
  const lastBackupTime = getLastBackupTime();
  const backups = listBackups();

  let nextBackupDue = 'In 24 hours';
  if (lastBackupTime) {
    const lastMs = new Date(lastBackupTime).getTime();
    const nextMs = lastMs + BACKUP_INTERVAL_MS;
    const diffMs = nextMs - Date.now();
    if (diffMs <= 0) {
      nextBackupDue = 'Due now';
    } else {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      nextBackupDue = hours > 0 ? `In ${hours}h ${minutes}m` : `In ${minutes} minutes`;
    }
  }

  return {
    lastBackupTime,
    nextBackupDue,
    autoBackupActive: true,
    totalBackups: backups.length,
  };
}

/**
 * Restores the database from a designated backup file.
 */
export function restoreBackup(filename: string): { success: boolean; message: string } {
  ensureBackupDir();
  const backupFilePath = path.join(getBackupDir(), filename);

  if (!fs.existsSync(backupFilePath)) {
    return { success: false, message: `Backup file ${filename} not found` };
  }

  try {
    if (filename.endsWith('.db')) {
      // Close existing connection cleanly before file replacement
      closeDatabase();

      // Create a safety pre-restore backup
      const safetyFile = path.join(getBackupDir(), `pre_restore_safety_${Date.now()}.db`);
      if (fs.existsSync(getDbPath())) {
        fs.copyFileSync(getDbPath(), safetyFile);
      }

      // Overwrite database file
      fs.copyFileSync(backupFilePath, getDbPath());
      return { success: true, message: `Successfully restored database from ${filename}` };
    }

    if (filename.endsWith('.json')) {
      const raw = fs.readFileSync(backupFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      const data = parsed.data || parsed;

      if (!data.months || !data.phoneTypes) {
        return { success: false, message: 'Invalid JSON snapshot format' };
      }

      const db = getDatabase();
      db.exec(`
        DELETE FROM months;
        DELETE FROM daily_records;
        DELETE FROM samsung_tracker;
        DELETE FROM phone_types;
      `);

      // Insert phone types
      const ptStmt = db.prepare(`
        INSERT OR REPLACE INTO phone_types (id, name, model, cost, return_cash, base_profit, second_account_spread)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const pt of data.phoneTypes) {
        ptStmt.run(pt.id, pt.name, pt.model, pt.cost, pt.returnCash, pt.baseProfit, pt.secondAccountSpread);
      }

      // Insert months and daily records
      const mStmt = db.prepare(`INSERT OR REPLACE INTO months (id, name, model, opening_float) VALUES (?, ?, ?, ?)`);
      const rStmt = db.prepare(`
        INSERT OR REPLACE INTO daily_records (
          month_id, date, actual_balance, cash_added,
          type_a_out, type_a_back, type_b_out, type_b_back,
          type_c_out, type_c_back, samsung_cash_out, samsung_cash_in, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const m of data.months) {
        mStmt.run(m.id, m.name, m.model, m.openingFloat);
        if (Array.isArray(m.records)) {
          for (const r of m.records) {
            rStmt.run(
              m.id,
              r.date,
              r.actualBalance ?? null,
              r.cashAdded ?? 0,
              r.typeAOut ?? 0,
              r.typeABack ?? 0,
              r.typeBOut ?? 0,
              r.typeBBack ?? 0,
              r.typeCOut ?? 0,
              r.typeCBack ?? 0,
              r.samsungCashOut ?? 0,
              r.samsungCashIn ?? 0,
              r.notes ?? null
            );
          }
        }
      }

      // Insert samsung tracker
      if (Array.isArray(data.samsungTracker)) {
        const sStmt = db.prepare(`INSERT INTO samsung_tracker (date, cash_out, cash_in, profit, status) VALUES (?, ?, ?, ?, ?)`);
        for (const st of data.samsungTracker) {
          sStmt.run(st.date, st.cashOut, st.cashIn, st.profit, st.status);
        }
      }

      return { success: true, message: `Successfully restored database from JSON snapshot ${filename}` };
    }

    return { success: false, message: 'Unsupported backup file extension' };
  } catch (e: any) {
    console.error('Error during backup restoration:', e);
    return { success: false, message: e.message || 'Restoration failed' };
  }
}

/**
 * Initializes a lightweight background interval (checks every 30 minutes).
 */
let daemonInitialized = false;
export function initBackupDaemon(): void {
  if (daemonInitialized) return;
  daemonInitialized = true;

  // Initial check on startup
  checkAndPerform24hBackup();

  // Periodic check every 30 minutes
  setInterval(() => {
    checkAndPerform24hBackup();
  }, 30 * 60 * 1000);
}
