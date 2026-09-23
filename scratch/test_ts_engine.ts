import { DEFAULT_PHONE_TYPES, INITIAL_MONTHS, INITIAL_SAMSUNG_TRACKER } from '../lib/initialData';
import { calculateMonth } from '../lib/engine';

const sep = INITIAL_MONTHS.find(m => m.id === '2026-09')!;
const { calculatedDays, summary } = calculateMonth(sep, DEFAULT_PHONE_TYPES, INITIAL_SAMSUNG_TRACKER);

console.log('=== TEST UPDATED ENGINE VS SPREADSHEET ===');
console.log('Capital Deployed:      ', summary.totalCapitalDeployed, ' | Target: 1,322,880 | Match:', summary.totalCapitalDeployed === 1322880);
console.log('Cash Recovered:        ', summary.totalCashRecovered, ' | Target: 1,284,400 | Match:', summary.totalCashRecovered === 1284400);
console.log('Phones Out:            ', summary.totalPhonesOut, ' | Target: 367       | Match:', summary.totalPhonesOut === 367);
console.log('Phones Reconciled:     ', summary.totalPhonesReconciled, ' | Target: 338       | Match:', summary.totalPhonesReconciled === 338);
console.log('Base Profit:           ', summary.totalBaseProfit, ' | Target: 33,800    | Match:', summary.totalBaseProfit === 33800);
console.log('2nd Account:           ', summary.totalSecondAccount, ' | Target: 32,300    | Match:', summary.totalSecondAccount === 32300);
console.log('Total Earnings:        ', summary.totalEarnings, ' | Target: 66,100    | Match:', summary.totalEarnings === 66100);
console.log('Closing Float:         ', summary.closingFloat, ' | Target: 68,105    | Match:', summary.closingFloat === 68105);
console.log('Outstanding Phones:    ', summary.outstandingPhones, ' | Target: 29        | Match:', summary.outstandingPhones === 29);
console.log('Outstanding Cost:      ', summary.outstandingValueAtCost, ' | Target: 104,580   | Match:', summary.outstandingValueAtCost === 104580);
console.log('Outstanding Cash:      ', summary.outstandingCashToCome, ' | Target: 110,200   | Match:', summary.outstandingCashToCome === 110200);
console.log('Float Once Reconciled: ', summary.floatOnceReconciled, ' | Target: 172,685   | Match:', summary.floatOnceReconciled === 172685);
console.log('Float Ties Check:      ', summary.floatTiesCheck, ' | Target: true      | Match:', summary.floatTiesCheck === true);
console.log('Reconciliation Ties:   ', summary.reconciliationTiesCheck, ' | Target: true      | Match:', summary.reconciliationTiesCheck === true);

const day21 = calculatedDays.find(d => d.date === '2026-09-21');
const day22 = calculatedDays.find(d => d.date === '2026-09-22');
console.log('Day 21 FIFO Owed:      ', day21?.cashStillOwedFromDate, ' | Target: 3,800     | Match:', day21?.cashStillOwedFromDate === 3800);
console.log('Day 22 FIFO Owed:      ', day22?.cashStillOwedFromDate, ' | Target: 106,400   | Match:', day22?.cashStillOwedFromDate === 106400);

// Check all 30 days closing float against target
console.log('\nChecking all days matching exactly:');
const expectedFloats = [
  200000, 200000, 200000, 200000, 200000, 200000, 200000, 200000, 200000, 200000,
  190000, 184300, 184300, 182695, 182695, 182795, 182795, 184195, 181995, 178295,
  175495, 68105, 68105, 68105, 68105, 68105, 68105, 68105, 68105, 68105
];
let allDaysMatch = true;
calculatedDays.forEach((d, idx) => {
  if (d.closingFloat !== expectedFloats[idx]) {
    console.log(`Mismatch on Day ${idx+1} (${d.date}): engine=${d.closingFloat}, expected=${expectedFloats[idx]}`);
    allDaysMatch = false;
  }
});
console.log('ALL 30 DAYS CLOSING FLOAT EXACT MATCH:', allDaysMatch);
