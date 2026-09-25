// Initial pre-loaded data from TRACKER2 spreadsheet
import { MonthData, PhoneTypeConfig, ExecutiveSummary, SamsungTrackerEntry } from './types';

export const DEFAULT_PHONE_TYPES: PhoneTypeConfig[] = [
  {
    id: 'type-a',
    name: 'Type A',
    model: '128GB (e.g. Samsung A05/A06/A15)',
    cost: 3700,
    returnCash: 3800,
    baseProfit: 100,
    secondAccountSpread: 0,
  },
  {
    id: 'type-b',
    name: 'Type B',
    model: '64GB (e.g. Samsung A05/A06)',
    cost: 3530,
    returnCash: 3800,
    baseProfit: 100,
    secondAccountSpread: 170,
  },
  {
    id: 'type-c',
    name: 'Type C Pop 20',
    model: 'Pop 20 64GB',
    cost: 3600,
    returnCash: 3700,
    baseProfit: 100,
    secondAccountSpread: 0,
  },
  {
    id: 'tecno-64',
    name: 'Tecno 64GB',
    model: 'Tecno Spark / Pop 64GB',
    cost: 3550,
    returnCash: 3750,
    baseProfit: 100,
    secondAccountSpread: 100,
  },
  {
    id: 'itel-128',
    name: 'Itel 128GB',
    model: 'Itel A70 / P55 128GB',
    cost: 3700,
    returnCash: 3800,
    baseProfit: 100,
    secondAccountSpread: 0,
  },
  {
    id: 'itel-64',
    name: 'Itel 64GB',
    model: 'Itel A60 / A70 64GB',
    cost: 3450,
    returnCash: 3650,
    baseProfit: 100,
    secondAccountSpread: 100,
  },
  {
    id: 'infinix-128',
    name: 'Infinix 128GB',
    model: 'Infinix Smart 8 / Hot 40 128GB',
    cost: 3800,
    returnCash: 3950,
    baseProfit: 100,
    secondAccountSpread: 50,
  },
];

export const INITIAL_MONTHS: MonthData[] = [
  {
    id: '2026-09',
    name: 'September 2026',
    model: 'self-financed',
    openingFloat: 200000,
    records: [
      { "date": "2026-09-01", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-02", "actualBalance": null, "cashAdded": 0, "typeAOut": 1, "typeABack": 1, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-03", "actualBalance": null, "cashAdded": 0, "typeAOut": 1, "typeABack": 1, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-04", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-05", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-06", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-07", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-08", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-09", "actualBalance": null, "cashAdded": 0, "typeAOut": 13, "typeABack": 13, "typeBOut": 7, "typeBBack": 7, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-10", "actualBalance": null, "cashAdded": 0, "typeAOut": 9, "typeABack": 9, "typeBOut": 4, "typeBBack": 4, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-11", "actualBalance": null, "cashAdded": -10000, "typeAOut": 13, "typeABack": 13, "typeBOut": 18, "typeBBack": 18, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-12", "actualBalance": null, "cashAdded": -5700, "typeAOut": 4, "typeABack": 4, "typeBOut": 17, "typeBBack": 17, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-13", "actualBalance": null, "cashAdded": 0, "typeAOut": 7, "typeABack": 7, "typeBOut": 8, "typeBBack": 8, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-14", "actualBalance": null, "cashAdded": -1605, "typeAOut": 3, "typeABack": 3, "typeBOut": 14, "typeBBack": 14, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-15", "actualBalance": null, "cashAdded": 0, "typeAOut": 12, "typeABack": 12, "typeBOut": 14, "typeBBack": 14, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-16", "actualBalance": null, "cashAdded": 0, "typeAOut": 14, "typeABack": 14, "typeBOut": 16, "typeBBack": 16, "typeCOut": 0, "typeCBack": 0, "samsungCashOut": 3400, "samsungCashIn": 3500 },
      { "date": "2026-09-17", "actualBalance": null, "cashAdded": 0, "typeAOut": 16, "typeABack": 16, "typeBOut": 18, "typeBBack": 18, "typeCOut": 0, "typeCBack": 0, "samsungCashOut": 0, "samsungCashIn": 0 },
      { "date": "2026-09-18", "actualBalance": null, "cashAdded": 0, "typeAOut": 14, "typeABack": 14, "typeBOut": 16, "typeBBack": 16, "typeCOut": 0, "typeCBack": 0, "samsungCashOut": 9100, "samsungCashIn": 10500 },
      { "date": "2026-09-19", "actualBalance": null, "cashAdded": -3000, "typeAOut": 11, "typeABack": 11, "typeBOut": 18, "typeBBack": 18, "typeCOut": 0, "typeCBack": 0, "samsungCashOut": 10300, "samsungCashIn": 11100 },
      { "date": "2026-09-20", "actualBalance": null, "cashAdded": 0, "typeAOut": 11, "typeABack": 10, "typeBOut": 16, "typeBBack": 16, "typeCOut": 0, "typeCBack": 0, "samsungCashOut": 7000, "samsungCashIn": 7000 },
      { "date": "2026-09-21", "actualBalance": null, "cashAdded": 0, "typeAOut": 20, "typeABack": 20, "typeBOut": 24, "typeBBack": 24, "typeCOut": 0, "typeCBack": 0, "samsungCashOut": 9800, "samsungCashIn": 10500 },
      { "date": "2026-09-22", "actualBalance": null, "cashAdded": -2610, "typeAOut": 15, "typeABack": 15, "typeBOut": 16, "typeBBack": 16, "typeCOut": 0, "typeCBack": 0, "samsungCashOut": 3900, "samsungCashIn": 3500 },
      { "date": "2026-09-23", "actualBalance": null, "cashAdded": 0, "typeAOut": 10, "typeABack": 10, "typeBOut": 10, "typeBBack": 9, "typeCOut": 0, "typeCBack": 0, "samsungCashOut": 7000, "samsungCashIn": 0 },
      { "date": "2026-09-24", "actualBalance": null, "cashAdded": 0, "typeAOut": 6, "typeABack": 0, "typeBOut": 7, "typeBBack": 0, "typeCOut": 2, "typeCBack": 0, "samsungCashOut": 0, "samsungCashIn": 0 },
      { "date": "2026-09-25", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-26", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-27", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-28", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-29", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
      { "date": "2026-09-30", "actualBalance": null, "cashAdded": 0, "typeAOut": 0, "typeABack": 0, "typeBOut": 0, "typeBBack": 0, "typeCOut": 0, "typeCBack": 0 },
    ],
  },
  {
    id: '2026-10',
    name: 'October 2026',
    model: 'self-financed',
    openingFloat: 111345,
    records: Array.from({ length: 31 }, (_, i) => ({
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      actualBalance: null,
      cashAdded: 0,
      typeAOut: 0,
      typeABack: 0,
      typeBOut: 0,
      typeBBack: 0,
      typeCOut: 0,
      typeCBack: 0,
    })),
  },
  {
    id: '2026-11',
    name: 'November 2026',
    model: 'self-financed',
    openingFloat: 111345,
    records: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-11-${String(i + 1).padStart(2, '0')}`,
      actualBalance: null,
      cashAdded: 0,
      typeAOut: 0,
      typeABack: 0,
      typeBOut: 0,
      typeBBack: 0,
      typeCOut: 0,
      typeCBack: 0,
    })),
  },
  {
    id: '2026-12',
    name: 'December 2026',
    model: 'self-financed',
    openingFloat: 111345,
    records: Array.from({ length: 31 }, (_, i) => ({
      date: `2026-12-${String(i + 1).padStart(2, '0')}`,
      actualBalance: null,
      cashAdded: 0,
      typeAOut: 0,
      typeABack: 0,
      typeBOut: 0,
      typeBBack: 0,
      typeCOut: 0,
      typeCBack: 0,
    })),
  },
];

export const INITIAL_SAMSUNG_TRACKER: SamsungTrackerEntry[] = [
  { date: '2026-09-16', cashOut: 3400, cashIn: 3500, profit: 100, status: 'Profit (+KES 100)' },
  { date: '2026-09-17', cashOut: 0, cashIn: 0, profit: 0, status: 'No trading' },
  { date: '2026-09-18', cashOut: 9100, cashIn: 10500, profit: 1400, status: 'Profit (+KES 1,400)' },
  { date: '2026-09-19', cashOut: 10300, cashIn: 11100, profit: 800, status: 'Profit (+KES 800)' },
  { date: '2026-09-20', cashOut: 7000, cashIn: 7000, profit: 0, status: 'Reconciled' },
  { date: '2026-09-21', cashOut: 9800, cashIn: 10500, profit: 700, status: 'Profit (+KES 700)' },
  { date: '2026-09-22', cashOut: 3900, cashIn: 3500, profit: -400, status: 'Partial (400 pending)' },
  { date: '2026-09-23', cashOut: 7000, cashIn: 0, profit: -7000, status: 'Pending (7,000)' },
  { date: '2026-09-24', cashOut: 0, cashIn: 0, profit: 0, status: 'No trading' },
  { date: '2026-09-25', cashOut: 0, cashIn: 0, profit: 0, status: 'No trading' },
  { date: '2026-09-26', cashOut: 0, cashIn: 0, profit: 0, status: 'No trading' },
  { date: '2026-09-27', cashOut: 0, cashIn: 0, profit: 0, status: 'No trading' },
  { date: '2026-09-28', cashOut: 0, cashIn: 0, profit: 0, status: 'No trading' },
  { date: '2026-09-29', cashOut: 0, cashIn: 0, profit: 0, status: 'No trading' },
  { date: '2026-09-30', cashOut: 0, cashIn: 0, profit: 0, status: 'No trading' },
];

export const HISTORICAL_COLLO_PERIODS = [
  {
    period: 'May 24 – June 30, 2026',
    cashReceivedFromCollo: 2221600,
    phonesSoldValue: 2407800,
    netDifference: -186200,
    repaidAndSettled: 186200,
    closingOwed: 0,
    status: 'Settled / Fully Reimbursed',
  },
  {
    period: 'July 4 – August 31, 2026',
    cashReceivedFromCollo: 3984100,
    phonesSoldValue: 4217400,
    netDifference: -233300,
    repaidAndSettled: 233300,
    closingOwed: 0,
    status: 'Settled / Fully Reimbursed',
  },
];

export const HISTORICAL_EXECUTIVE_SUMMARY: ExecutiveSummary = {
  lifetimeCapitalDeployed: 8085590,
  lifetimeCashRecovered: 7680100,
  lifetimePhoneVolume: 2184,
  colloFinancedDeployed: 6625200,
  colloFinancedRecovered: 6205700,
  colloFinancedPhones: 1779,
  selfFinancedDeployed: 1460390,
  selfFinancedRecovered: 1474400,
  selfFinancedPhones: 405,
  selfFinancedBaseProfit: 38800,
  selfFinancedSecondAccount: 36550,
  selfFinancedTotalEarnings: 75350,
  activePendingCash: 64400,
  activePendingPhones: 17,
};

export const SHEET1_ENHANCEMENTS = [
  { priority: 'High', area: 'Number Formats', suggestion: 'Apply #,##0 currency formatting to fix scientific notation (e.g. 1.05958e+06) in summaries and totals.' },
  { priority: 'High', area: 'Layout', suggestion: 'Separate the stacked Samsung Sales Tracker from the daily ledger into a dedicated view.' },
  { priority: 'Medium', area: 'Input Guidance', suggestion: 'Softly tint editable input cells (Columns B, C, D, E, F, G, H, I) to distinguish them from formulas.' },
  { priority: 'Medium', area: 'Visual Status', suggestion: 'Add conditional formatting for "All reconciled" vs. "Phones not reconciled".' },
  { priority: 'Medium', area: 'Organization', suggestion: 'Reorder tabs chronologically and move extensive text guides to a dedicated tab.' },
  { priority: 'Low / Polish', area: 'Dashboard', suggestion: 'Add KPI metric cards and quick navigation buttons.' }
];

export const SPREADSHEET_GUIDE_RULES = [
  {
    title: 'Self-Financed Model (September Onwards)',
    text: 'From September you finance yourself — no cash comes from Collo, so there is no "owed" balance. This sheet tracks your own float instead.'
  },
  {
    title: 'Unit Economics: Type A vs Type B vs Type C',
    text: 'TYPE A: you pay 3,700, it comes back at 3,800. Profit 100. Nothing goes to the other account.\n\nTYPE B: you pay 3,530, it comes back at 3,800. That is a spread of 270 — 100 is your profit, the other 170 goes to the second account.\n\nTYPE C (Pop 20 64GB): you pay 3,600, it comes back at 3,700. Profit 100.\n\nBoth types leave the float exactly level: what you paid comes back into the float, and only the profit (and the 170) is taken out.'
  },
  {
    title: 'Why Type B is Typed as a Count',
    text: 'Both types share one account, so cash alone cannot tell them apart — 7,270 out could be one of each, or something else entirely. Typing the Type B count removes the guesswork.'
  },
  {
    title: 'Idle Cash (Cash Not Given Out)',
    text: 'Column M shows the cash still in your hand after the day\'s phones went out. If you open with 111,000 and give out only 37,000, 74,000 stays in closing float and becomes tomorrow\'s opening balance.'
  },
  {
    title: 'Reconciliation Rules',
    text: 'You only receive 3,800 for a phone once the company reconciles it. If you give out 20 and only 5 reconcile, you type 20 in the out column and 5 in the back column — the other 15 stay open.'
  },
  {
    title: 'Samsung Sales Tracker & Quick Entry Buffer (Rows 37–54)',
    text: 'Dedicated short-term financing buffer for Samsung sales. When capital is advanced (Money Given Out), it is subtracted from In Hand (Column O: L - N - quick_out). When cash is recovered (Expected Received Back), it is added to Closing Float (Column R: O + P - Q - AE + quick_in). Any unrecovered net difference remains in the field and is restored in the Reconciliation Float asset balance.'
  }
];
