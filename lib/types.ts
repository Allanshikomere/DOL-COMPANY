export interface PhoneTypeConfig {
  id: string;
  name: string;
  model: string;
  cost: number;
  returnCash: number;
  baseProfit: number;
  secondAccountSpread: number;
}

export interface DailyRecord {
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

export interface CalculatedDay {
  date: string;
  expectedOpening: number;
  openingUsed: number;
  differenceVsExpected: number;
  cashAdded: number;
  cashGivenOut: number;
  cashLeftInHand: number;
  cashReceivedBack: number;
  profitTakenOut: number;
  toSecondAccount: number;
  closingFloat: number;
  samsungCashOut: number;
  samsungCashIn: number;
  totalPhonesOut: number;
  totalPhonesBack: number;
  unreconciledToday: number;
  unreconciledBF: number;
  stillOut: number;
  unreconciledByType: Record<string, number>;
  valueAtCost: number;
  cashStillToCome: number;
  positionStatus: string;
  secondAccountRunning: number;
  cashStillOwedFromDate: number;
}

export interface MonthSummary {
  totalCapitalDeployed: number;
  totalCashRecovered: number;
  totalPhonesOut: number;
  totalPhonesReconciled: number;
  totalBaseProfit: number;
  totalSecondAccount: number;
  totalEarnings: number;
  closingFloat: number;
  outstandingPhones: number;
  outstandingValueAtCost: number;
  outstandingCashToCome: number;
  totalSamsungOut?: number;
  totalSamsungIn?: number;
  samsungNet?: number;
  floatTiesCheck?: boolean;
  reconciliationTiesCheck?: boolean;
  floatOnceReconciled: number;
  returnOnCapitalPercent: number;
}

export interface MonthData {
  id: string;
  name: string;
  model: 'self-financed' | 'collo-financed';
  openingFloat: number;
  records: DailyRecord[];
}

export interface SamsungTrackerEntry {
  date: string;
  cashOut: number;
  cashIn: number;
  profit: number;
  status: string;
}

export interface ColloPeriodRecord {
  period: string;
  cashReceivedFromCollo: number;
  phonesSoldValue: number;
  netDifference: number;
  repaidAndSettled: number;
  closingOwed: number;
  status: string;
}

export interface ExecutiveSummary {
  lifetimeCapitalDeployed: number;
  lifetimeCashRecovered: number;
  lifetimePhoneVolume: number;
  colloFinancedDeployed: number;
  colloFinancedRecovered: number;
  colloFinancedPhones: number;
  selfFinancedDeployed: number;
  selfFinancedRecovered: number;
  selfFinancedPhones: number;
  selfFinancedBaseProfit: number;
  selfFinancedSecondAccount: number;
  selfFinancedTotalEarnings: number;
  activePendingCash: number;
  activePendingPhones: number;
}
