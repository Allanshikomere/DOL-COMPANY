import {
  PhoneTypeConfig,
  DailyRecord,
  CalculatedDay,
  MonthSummary,
  MonthData,
  SamsungTrackerEntry
} from './types';

/**
 * Computes a single day row given the current record, previous day's row,
 * and current phone type pricing configurations.
 */
export function calculateDay(
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
  },
  prevDay: CalculatedDay | null,
  phoneTypes: PhoneTypeConfig[],
  initialFloat: number
): CalculatedDay {
  const expectedOpening = prevDay ? prevDay.closingFloat : initialFloat;
  const openingUsed =
    record.actualBalance !== null && record.actualBalance !== undefined
      ? record.actualBalance
      : expectedOpening;
  const differenceVsExpected = openingUsed - expectedOpening;

  const cashAdded = record.cashAdded || 0;

  // Helper to extract out/back counts for any phone type id
  const getPhoneCounts = (ptId: string) => {
    if (ptId === 'type-a') return { out: record.typeAOut || 0, back: record.typeABack || 0 };
    if (ptId === 'type-b') return { out: record.typeBOut || 0, back: record.typeBBack || 0 };
    if (ptId === 'type-c') return { out: record.typeCOut || 0, back: record.typeCBack || 0 };
    const custom = record.customPhones?.[ptId];
    return { out: custom?.out || 0, back: custom?.back || 0 };
  };

  let cashGivenOut = 0;
  let cashReceivedBack = 0;
  let profitTakenOut = 0;
  let toSecondAccount = 0;
  let totalPhonesOut = 0;
  let totalPhonesBack = 0;
  const unreconciledByType: Record<string, number> = {};
  let valueAtCost = 0;
  let cashStillToCome = 0;

  for (const pt of phoneTypes) {
    const { out, back } = getPhoneCounts(pt.id);
    cashGivenOut += out * pt.cost;
    cashReceivedBack += back * pt.returnCash;
    profitTakenOut += back * pt.baseProfit;
    toSecondAccount += back * (pt.secondAccountSpread || 0);

    totalPhonesOut += out;
    totalPhonesBack += back;

    const prevUnrec = prevDay ? prevDay.unreconciledByType[pt.id] || 0 : 0;
    const curUnrec = prevUnrec + out - back;
    unreconciledByType[pt.id] = curUnrec;

    valueAtCost += curUnrec * pt.cost;
    cashStillToCome += curUnrec * pt.returnCash;
  }

  // Samsung tracker / Quick entry money given out & back
  const samsungCashOut = record.samsungCashOut || 0;
  const samsungCashIn = record.samsungCashIn || 0;

  // Cash left in hand = openingUsed + cashAdded - cashGivenOut - samsungCashOut
  const cashLeftInHand = openingUsed + cashAdded - cashGivenOut - samsungCashOut;

  // Closing float = cashLeftInHand + cashReceivedBack - profitTakenOut - toSecondAccount + samsungCashIn
  const closingFloat =
    cashLeftInHand + cashReceivedBack - profitTakenOut - toSecondAccount + samsungCashIn;

  const unreconciledToday = totalPhonesOut - totalPhonesBack;
  const unreconciledBF = prevDay ? prevDay.stillOut : 0;
  const stillOut = unreconciledBF + unreconciledToday;

  let positionStatus = 'No trading';
  if (totalPhonesOut === 0 && totalPhonesBack === 0 && stillOut === 0) {
    positionStatus = 'No trading';
  } else if (stillOut === 0) {
    positionStatus = 'All reconciled';
  } else {
    positionStatus = `${stillOut} phones not reconciled`;
  }

  const secondAccountRunning =
    (prevDay ? prevDay.secondAccountRunning : 0) + toSecondAccount;

  return {
    date: record.date,
    expectedOpening,
    openingUsed,
    differenceVsExpected,
    cashAdded,
    cashGivenOut,
    cashLeftInHand,
    cashReceivedBack,
    profitTakenOut,
    toSecondAccount,
    closingFloat,
    samsungCashOut,
    samsungCashIn,
    totalPhonesOut,
    totalPhonesBack,
    unreconciledToday,
    unreconciledBF,
    stillOut,
    unreconciledByType,
    valueAtCost,
    cashStillToCome,
    positionStatus,
    secondAccountRunning,
    cashStillOwedFromDate: 0, // Populated in secondary FIFO pass below
  };
}

/**
 * Computes all days for a given month and applies FIFO matching to determine
 * which date the outstanding cash is owed from (Column AD in spreadsheet).
 */
export function calculateMonth(
  month: MonthData,
  phoneTypes: PhoneTypeConfig[],
  samsungTracker?: SamsungTrackerEntry[]
): { calculatedDays: CalculatedDay[]; summary: MonthSummary } {
  const calculatedDays: CalculatedDay[] = [];
  let prevDay: CalculatedDay | null = null;

  for (const record of month.records) {
    let rec = record;
    if (samsungTracker) {
      const entry = samsungTracker.find((e) => e.date === rec.date);
      if (entry) {
        rec = {
          ...rec,
          samsungCashOut: entry.cashOut,
          samsungCashIn: entry.cashIn,
        };
      }
    }
    const day = calculateDay(
      rec,
      prevDay,
      phoneTypes,
      month.openingFloat
    );
    calculatedDays.push(day);
    prevDay = day;
  }

  // FIFO pass to compute cashStillOwedFromDate (matching Column AD)
  let cumulativeBack = 0;
  for (const day of calculatedDays) {
    cumulativeBack += day.totalPhonesBack;
  }

  let remainingReconciledToConsume = cumulativeBack;
  for (const day of calculatedDays) {
    if (day.totalPhonesOut === 0) {
      day.cashStillOwedFromDate = 0;
      continue;
    }

    if (remainingReconciledToConsume >= day.totalPhonesOut) {
      remainingReconciledToConsume -= day.totalPhonesOut;
      day.cashStillOwedFromDate = 0;
    } else {
      const unreconciledFromThisDay =
        day.totalPhonesOut - remainingReconciledToConsume;
      remainingReconciledToConsume = 0;
      day.cashStillOwedFromDate = unreconciledFromThisDay * 3800;
    }
  }

  // Calculate Month Summary
  let totalCapitalDeployed = 0;
  let totalCashRecovered = 0;
  let totalPhonesOut = 0;
  let totalPhonesReconciled = 0;
  let totalBaseProfit = 0;
  let totalSecondAccount = 0;
  let totalSamsungOut = 0;
  let totalSamsungIn = 0;
  let totalCashAdded = 0;
  let totalDiffVsExpected = 0;

  for (const day of calculatedDays) {
    totalCapitalDeployed += day.cashGivenOut;
    totalCashRecovered += day.cashReceivedBack;
    totalPhonesOut += day.totalPhonesOut;
    totalPhonesReconciled += day.totalPhonesBack;
    totalBaseProfit += day.profitTakenOut;
    totalSecondAccount += day.toSecondAccount;
    totalSamsungOut += day.samsungCashOut;
    totalSamsungIn += day.samsungCashIn;
    totalCashAdded += day.cashAdded;
    totalDiffVsExpected += day.differenceVsExpected;
  }

  const latestDay = calculatedDays[calculatedDays.length - 1];
  let activeClosingFloat = month.openingFloat;
  let outstandingPhones = 0;
  let outstandingValueAtCost = 0;
  let outstandingCashToCome = 0;

  if (latestDay) {
    activeClosingFloat = latestDay.closingFloat;
    outstandingPhones = latestDay.stillOut;
    outstandingValueAtCost = latestDay.valueAtCost;
    outstandingCashToCome = latestDay.cashStillToCome;
  }

  const totalEarnings = totalBaseProfit + totalSecondAccount;
  const returnOnCapitalPercent =
    totalCapitalDeployed > 0
      ? (totalEarnings / totalCapitalDeployed) * 100
      : 0;

  // Matches AI39 & AI40 in spreadsheet: closing float + outstanding value at cost
  const floatOnceReconciled = activeClosingFloat + outstandingValueAtCost;

  // Spreadsheet Row 27 Check: AI11 + AI12 + AI13 - AI14 + AI15 - AI19 - AI20 - AI22 - B54 + C54 === 0
  const floatTiesCheck = Math.abs(
    month.openingFloat +
    totalCashAdded +
    totalDiffVsExpected -
    totalCapitalDeployed +
    totalCashRecovered -
    totalBaseProfit -
    totalSecondAccount -
    activeClosingFloat -
    totalSamsungOut +
    totalSamsungIn
  ) < 0.01;

  // Spreadsheet Row 28 Check: AI23 - AI24 - Y33 === 0
  const reconciliationTiesCheck = (totalPhonesOut - totalPhonesReconciled - outstandingPhones) === 0;

  const summary: MonthSummary = {
    totalCapitalDeployed,
    totalCashRecovered,
    totalPhonesOut,
    totalPhonesReconciled,
    totalBaseProfit,
    totalSecondAccount,
    totalEarnings,
    closingFloat: activeClosingFloat,
    outstandingPhones,
    outstandingValueAtCost,
    outstandingCashToCome,
    totalSamsungOut,
    totalSamsungIn,
    samsungNet: totalSamsungIn - totalSamsungOut,
    floatTiesCheck,
    reconciliationTiesCheck,
    floatOnceReconciled,
    returnOnCapitalPercent,
  };

  return { calculatedDays, summary };
}

/**
 * Format currency in Kenyan Shillings (KES #,##0)
 */
export function formatKES(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'KES 0';
  const isNegative = amount < 0;
  const absFormatted = Math.abs(Math.round(amount)).toLocaleString('en-US');
  return isNegative ? `(KES ${absFormatted})` : `KES ${absFormatted}`;
}

export function formatNumber(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Math.round(val).toLocaleString('en-US');
}
