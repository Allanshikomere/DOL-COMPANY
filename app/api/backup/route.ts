import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  createBackup,
  listBackups,
  getBackupStatus,
  restoreBackup,
  initBackupDaemon,
  checkAndPerform24hBackup,
  getBackupDir
} from '@/lib/backup';

export async function GET(req: NextRequest) {
  try {
    // Initialize background backup scheduler and check if 24h cycle is due
    initBackupDaemon();
    checkAndPerform24hBackup();

    const { searchParams } = new URL(req.url);
    const downloadFile = searchParams.get('download');

    if (downloadFile) {
      // Validate filename to prevent path traversal
      const safeFilename = path.basename(downloadFile);
      if (
        safeFilename !== downloadFile ||
        safeFilename.includes('..') ||
        (!safeFilename.endsWith('.db') && !safeFilename.endsWith('.json'))
      ) {
        return NextResponse.json({ success: false, error: 'Invalid file requested' }, { status: 400 });
      }

      const filePath = path.join(getBackupDir(), safeFilename);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);
      const isDb = safeFilename.endsWith('.db');
      const contentType = isDb ? 'application/x-sqlite3' : 'application/json';

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    }

    const status = getBackupStatus();
    const backups = listBackups();

    return NextResponse.json({
      success: true,
      data: {
        status,
        backups,
      },
    });
  } catch (error: any) {
    console.error('Error handling GET /api/backup:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal backup error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    initBackupDaemon();
    const body = await req.json();
    const { action } = body;

    if (action === 'create_backup') {
      const result = createBackup(true);
      const status = getBackupStatus();
      const backups = listBackups();
      return NextResponse.json({
        success: true,
        message: 'Manual backup snapshot created successfully',
        result,
        data: {
          status,
          backups,
        },
      });
    }

    if (action === 'restore') {
      const { filename } = body;
      if (!filename || typeof filename !== 'string') {
        return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
      }

      const safeFilename = path.basename(filename);
      if (safeFilename !== filename || safeFilename.includes('..')) {
        return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 });
      }

      const result = restoreBackup(safeFilename);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.message }, { status: 400 });
      }

      const status = getBackupStatus();
      const backups = listBackups();

      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          status,
          backups,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling POST /api/backup:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal backup error' },
      { status: 500 }
    );
  }
}
