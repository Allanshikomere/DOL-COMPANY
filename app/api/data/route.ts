import { NextResponse } from 'next/server';
import {
  fetchAllData,
  updateDailyRecord,
  addSamsungRecord,
  updatePhoneTypesInDB,
  updateSettingInDB,
  resetDatabaseToDefaults
} from '@/lib/db';
import { initBackupDaemon, checkAndPerform24hBackup } from '@/lib/backup';

export async function GET() {
  try {
    initBackupDaemon();
    checkAndPerform24hBackup();
    const data = fetchAllData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching data from SQLite:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'update_daily_record') {
      const { monthId, record } = body;
      updateDailyRecord(monthId, record);
      return NextResponse.json({ success: true });
    }

    if (action === 'add_samsung_record') {
      const { entry } = body;
      addSamsungRecord(entry);
      return NextResponse.json({ success: true });
    }

    if (action === 'update_phone_types') {
      const { types } = body;
      updatePhoneTypesInDB(types);
      return NextResponse.json({ success: true });
    }

    if (action === 'update_setting') {
      const { key, value } = body;
      updateSettingInDB(key, value);
      return NextResponse.json({ success: true });
    }

    if (action === 'reset_database') {
      resetDatabaseToDefaults();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating SQLite:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
