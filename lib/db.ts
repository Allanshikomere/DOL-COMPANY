import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import {
  MonthData,
  PhoneTypeConfig,
  DailyRecord,
  SamsungTrackerEntry
} from './types';
import {
  INITIAL_MONTHS,
  DEFAULT_PHONE_TYPES,
  INITIAL_SAMSUNG_TRACKER
} from './initialData';

let dbInstance: DatabaseSync | null = null;

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {
      console.error('Error closing database:', e);
    }
    dbInstance = null;
  }
}

export function getDbPath(): string {
  const isVercel = !!process.env.VERCEL;
  if (!isVercel) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, 'tracker.db');
  }

  // On Vercel serverless functions, the root filesystem is read-only. We use /tmp.
  const tmpDir = path.join('/tmp', 'data');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const tmpDbPath = path.join(tmpDir, 'tracker.db');

  // Copy bundled seed database if it doesn't exist in /tmp yet
  if (!fs.existsSync(tmpDbPath)) {
    const bundledDb = path.join(process.cwd(), 'data', 'tracker.db');
    if (fs.existsSync(bundledDb)) {
      try {
        fs.copyFileSync(bundledDb, tmpDbPath);
      } catch (e) {
        console.warn('Could not copy bundled database to /tmp:', e);
      }
    }
  }

  return tmpDbPath;
}

export function getDatabase(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  const db = new DatabaseSync(dbPath);

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS months (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      opening_float REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_records (
      month_id TEXT NOT NULL,
      date TEXT NOT NULL,
      actual_balance REAL,
      cash_added REAL NOT NULL DEFAULT 0,
      type_a_out INTEGER NOT NULL DEFAULT 0,
      type_a_back INTEGER NOT NULL DEFAULT 0,
      type_b_out INTEGER NOT NULL DEFAULT 0,
      type_b_back INTEGER NOT NULL DEFAULT 0,
      type_c_out INTEGER NOT NULL DEFAULT 0,
      type_c_back INTEGER NOT NULL DEFAULT 0,
      samsung_cash_out REAL NOT NULL DEFAULT 0,
      samsung_cash_in REAL NOT NULL DEFAULT 0,
      notes TEXT,
      custom_phones TEXT,
      PRIMARY KEY (month_id, date)
    );

    CREATE TABLE IF NOT EXISTS samsung_tracker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      cash_out REAL NOT NULL DEFAULT 0,
      cash_in REAL NOT NULL DEFAULT 0,
      profit REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS phone_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      cost REAL NOT NULL,
      return_cash REAL NOT NULL,
      base_profit REAL NOT NULL,
      second_account_spread REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Migrations for existing database
  try {
    db.exec(`ALTER TABLE daily_records ADD COLUMN samsung_cash_out REAL NOT NULL DEFAULT 0;`);
  } catch {}
  try {
    db.exec(`ALTER TABLE daily_records ADD COLUMN samsung_cash_in REAL NOT NULL DEFAULT 0;`);
  } catch {}
  try {
    db.exec(`ALTER TABLE daily_records ADD COLUMN custom_phones TEXT;`);
  } catch {}
  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_samsung_tracker_date ON samsung_tracker (date);`);
  } catch {}

  // Seed default data if empty or if legacy pricing exists
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM months');
  const result: any = countStmt.get();

  const typeBStmt = db.prepare("SELECT cost FROM phone_types WHERE id = 'type-b'");
  let typeBRow: any = null;
  try {
    typeBRow = typeBStmt.get();
  } catch {}

  if (result.count === 0 || !typeBRow || typeBRow.cost === 3570) {
    seedDefaults(db);
  } else {
    // Ensure all INITIAL_SAMSUNG_TRACKER entries (including 9/23 through 9/30) are populated
    try {
      const upsertSamsung = db.prepare(`
        INSERT INTO samsung_tracker (date, cash_out, cash_in, profit, status)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          cash_out = excluded.cash_out,
          cash_in = excluded.cash_in,
          profit = excluded.profit,
          status = excluded.status
      `);
      for (const st of INITIAL_SAMSUNG_TRACKER) {
        upsertSamsung.run(st.date, st.cashOut, st.cashIn, st.profit, st.status);
      }
    } catch {}
  }

  dbInstance = db;
  return dbInstance;
}

export function seedDefaults(db: DatabaseSync) {
  // 1. Phone Types
  const insertPhoneType = db.prepare(`
    INSERT OR REPLACE INTO phone_types (id, name, model, cost, return_cash, base_profit, second_account_spread)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const pt of DEFAULT_PHONE_TYPES) {
    insertPhoneType.run(
      pt.id,
      pt.name,
      pt.model,
      pt.cost,
      pt.returnCash,
      pt.baseProfit,
      pt.secondAccountSpread
    );
  }

  // 2. Months & Daily Records
  const insertMonth = db.prepare(`
    INSERT OR REPLACE INTO months (id, name, model, opening_float)
    VALUES (?, ?, ?, ?)
  `);
  const insertRecord = db.prepare(`
    INSERT OR REPLACE INTO daily_records (
      month_id, date, actual_balance, cash_added,
      type_a_out, type_a_back, type_b_out, type_b_back,
      type_c_out, type_c_back, samsung_cash_out, samsung_cash_in, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const m of INITIAL_MONTHS) {
    insertMonth.run(m.id, m.name, m.model, m.openingFloat);
    for (const r of m.records) {
      insertRecord.run(
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

  // 3. Samsung Tracker
  const insertSamsung = db.prepare(`
    INSERT INTO samsung_tracker (date, cash_out, cash_in, profit, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const st of INITIAL_SAMSUNG_TRACKER) {
    insertSamsung.run(st.date, st.cashOut, st.cashIn, st.profit, st.status);
  }

  // 4. Default Settings
  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO app_settings (key, value)
    VALUES (?, ?)
  `);
  insertSetting.run('owner_password', '1234');
  insertSetting.run('theme', 'dark');
}

// Data Fetchers
export function fetchAllData() {
  const db = getDatabase();

  // 1. Phone Types
  const phoneTypesStmt = db.prepare('SELECT * FROM phone_types');
  const rawPhoneTypes: any[] = phoneTypesStmt.all();
  const phoneTypes: PhoneTypeConfig[] = rawPhoneTypes.map((row) => ({
    id: row.id,
    name: row.name,
    model: row.model,
    cost: row.cost,
    returnCash: row.return_cash,
    baseProfit: row.base_profit,
    secondAccountSpread: row.second_account_spread,
  }));

  // 2. Months
  const monthsStmt = db.prepare('SELECT * FROM months');
  const rawMonths: any[] = monthsStmt.all();

  const recordsStmt = db.prepare('SELECT * FROM daily_records ORDER BY date ASC');
  const allRecords: any[] = recordsStmt.all();

  const months: MonthData[] = rawMonths.map((m) => {
    const recordsForMonth: DailyRecord[] = allRecords
      .filter((r) => r.month_id === m.id)
      .map((r) => {
        let customPhones: Record<string, { out: number; back: number }> | undefined = undefined;
        if (r.custom_phones) {
          try {
            customPhones = JSON.parse(r.custom_phones);
          } catch {}
        }
        return {
          date: r.date,
          actualBalance: r.actual_balance,
          cashAdded: r.cash_added,
          typeAOut: r.type_a_out,
          typeABack: r.type_a_back,
          typeBOut: r.type_b_out,
          typeBBack: r.type_b_back,
          typeCOut: r.type_c_out,
          typeCBack: r.type_c_back,
          samsungCashOut: r.samsung_cash_out ?? 0,
          samsungCashIn: r.samsung_cash_in ?? 0,
          notes: r.notes,
          customPhones,
        };
      });

    return {
      id: m.id,
      name: m.name,
      model: m.model,
      openingFloat: m.opening_float,
      records: recordsForMonth,
    };
  });

  // 3. Samsung Tracker
  const samsungStmt = db.prepare('SELECT * FROM samsung_tracker ORDER BY id ASC');
  const rawSamsung: any[] = samsungStmt.all();
  const samsungTracker: SamsungTrackerEntry[] = rawSamsung.map((s) => ({
    date: s.date,
    cashOut: s.cash_out,
    cashIn: s.cash_in,
    profit: s.profit,
    status: s.status,
  }));

  // 4. Settings
  const settingsStmt = db.prepare('SELECT * FROM app_settings');
  const rawSettings: any[] = settingsStmt.all();
  const settings: Record<string, string> = {};
  for (const s of rawSettings) {
    settings[s.key] = s.value;
  }

  return {
    phoneTypes,
    months,
    samsungTracker,
    settings,
  };
}

export function updateDailyRecord(
  monthId: string,
  record: {
    date: string;
    actualBalance: number | null;
    cashAdded: number;
    typeAOut: number;
    typeABack: number;
    typeBOut: number;
    typeBBack: number;
    typeCOut: number;
    typeCBack: number;
    samsungCashOut?: number;
    samsungCashIn?: number;
    notes?: string;
    customPhones?: Record<string, { out: number; back: number }>;
  }
) {
  const db = getDatabase();
  const customPhonesStr = record.customPhones ? JSON.stringify(record.customPhones) : null;
  const stmt = db.prepare(`
    INSERT INTO daily_records (
      month_id, date, actual_balance, cash_added,
      type_a_out, type_a_back, type_b_out, type_b_back,
      type_c_out, type_c_back, samsung_cash_out, samsung_cash_in, notes, custom_phones
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(month_id, date) DO UPDATE SET
      actual_balance = excluded.actual_balance,
      cash_added = excluded.cash_added,
      type_a_out = excluded.type_a_out,
      type_a_back = excluded.type_a_back,
      type_b_out = excluded.type_b_out,
      type_b_back = excluded.type_b_back,
      type_c_out = excluded.type_c_out,
      type_c_back = excluded.type_c_back,
      samsung_cash_out = excluded.samsung_cash_out,
      samsung_cash_in = excluded.samsung_cash_in,
      notes = excluded.notes,
      custom_phones = excluded.custom_phones
  `);

  stmt.run(
    monthId,
    record.date,
    record.actualBalance,
    record.cashAdded,
    record.typeAOut,
    record.typeABack,
    record.typeBOut,
    record.typeBBack,
    record.typeCOut,
    record.typeCBack,
    record.samsungCashOut ?? 0,
    record.samsungCashIn ?? 0,
    record.notes ?? null,
    customPhonesStr
  );
}

export function addSamsungRecord(entry: SamsungTrackerEntry) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO samsung_tracker (date, cash_out, cash_in, profit, status)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      cash_out = excluded.cash_out,
      cash_in = excluded.cash_in,
      profit = excluded.profit,
      status = excluded.status
  `);
  stmt.run(entry.date, entry.cashOut, entry.cashIn, entry.profit, entry.status);

  // Sync to daily_records if matching date exists
  try {
    const updateDaily = db.prepare(`
      UPDATE daily_records
      SET samsung_cash_out = ?, samsung_cash_in = ?
      WHERE date = ?
    `);
    updateDaily.run(entry.cashOut, entry.cashIn, entry.date);
  } catch {}
}

export function updatePhoneTypesInDB(types: PhoneTypeConfig[]) {
  const db = getDatabase();
  if (types.length > 0) {
    const placeholders = types.map(() => '?').join(',');
    const deleteMissing = db.prepare(`DELETE FROM phone_types WHERE id NOT IN (${placeholders})`);
    deleteMissing.run(...types.map((t) => t.id));
  }
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO phone_types (id, name, model, cost, return_cash, base_profit, second_account_spread)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const t of types) {
    stmt.run(t.id, t.name, t.model, t.cost, t.returnCash, t.baseProfit, t.secondAccountSpread);
  }
}

export function updateSettingInDB(key: string, value: string) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO app_settings (key, value)
    VALUES (?, ?)
  `);
  stmt.run(key, value);
}

export function resetDatabaseToDefaults() {
  const db = getDatabase();
  db.exec(`
    DELETE FROM months;
    DELETE FROM daily_records;
    DELETE FROM samsung_tracker;
    DELETE FROM phone_types;
    DELETE FROM app_settings;
  `);
  seedDefaults(db);
}
