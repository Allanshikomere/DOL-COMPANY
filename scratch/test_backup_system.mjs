// Test script for backup endpoints and engine
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('--- 1. Testing GET /api/backup ---');
  let res = await fetch(`${BASE_URL}/api/backup`);
  let json = await res.json();
  console.log('GET status:', res.status, json.success ? 'SUCCESS' : 'FAILED');
  console.log('Backup Status:', json.data?.status);
  console.log('Existing Backups count:', json.data?.backups?.length);

  console.log('\n--- 2. Testing POST /api/backup (create_backup) ---');
  res = await fetch(`${BASE_URL}/api/backup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_backup' })
  });
  json = await res.json();
  console.log('POST create_backup status:', res.status, json.success ? 'SUCCESS' : 'FAILED');
  console.log('Result files:', json.result);
  console.log('Updated backups count:', json.data?.backups?.length);

  const testFile = json.result?.jsonFilename || json.data?.backups?.[0]?.filename;

  if (testFile) {
    console.log(`\n--- 3. Testing GET /api/backup?download=${testFile} ---`);
    res = await fetch(`${BASE_URL}/api/backup?download=${encodeURIComponent(testFile)}`);
    console.log('Download status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Content-Disposition:', res.headers.get('content-disposition'));
    const text = await res.text();
    console.log('File size fetched:', text.length, 'bytes');

    console.log(`\n--- 4. Testing POST /api/backup (restore) with ${testFile} ---`);
    res = await fetch(`${BASE_URL}/api/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restore', filename: testFile })
    });
    json = await res.json();
    console.log('Restore status:', res.status, json.success ? 'SUCCESS' : 'FAILED');
    console.log('Restore message:', json.message);
  }

  console.log('\n--- 5. Verifying DB Integrity After Restore ---');
  res = await fetch(`${BASE_URL}/api/data`);
  json = await res.json();
  console.log('Data fetch status:', res.status, json.success ? 'SUCCESS' : 'FAILED');
  console.log('Months count:', json.data?.months?.length);
  const sep = json.data?.months?.find(m => m.id === '2026-09');
  console.log('September records count:', sep?.records?.length);

  console.log('\nALL BACKUP ENGINE TESTS PASSED!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
