# Comprehensive System Documentation & Financial Audit Ledger
**Workbook Title:** TRACKER2
**System:** Phone Sales & Working Capital Float Management System
**Timeline Covered:** May 24, 2026 – December 31, 2026
**Document Currency:** Kenyan Shillings (KES)
**Export Date:** September 2026
---
## 1. Executive Summary & Architecture
The spreadsheet manages a multi-tier handset distribution, micro-financing, and sales reconciliation business across two distinct operational phases:
┌─────────────────────────────────────────────────────────────────────────────┐
│ OPERATIONAL TIMELINE │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ Phase 1: Collo-Financed Model │ Phase 2: Self-Financed Float Model │
│ (May 24 – August 31, 2026) │ (September 1 – December 31, 2026) │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • External capital from Collo │ • Closed-loop self-sustaining float │
│ • Daily credit/debt tracking │ • Initial capital: KES 200,000 │
│ • Reinvested vs Settled repayments │ • Multi-device margin split │
│ • Tabs: MAY - JUNE, JULY-AUGUST │ • Tabs: SEPTEMBER, OCT, NOV… │
└──────────────────────────────────────┴──────────────────────────────────────┘
### Complete Tab Index
| Tab Name | Operating Scope | Category | Description |
| :--- | :--- | :--- | :--- |
| `DASHBOARD` | Portfolio-wide | Executive Reporting | High-level KPI cards, monthly progression table, model comparison, and Samsung recovery metrics. |
| `SEPTEMBER` | Sep 1–30, 2026 | Daily Trading Ledger | 30-day active float engine, 3 handset types, 2nd account tracking, reconciliation checks, and Samsung sub-ledger. |
| `OCTOBER` | Oct 1–31, 2026 | Daily Trading Ledger | Pre-built template linking closing float and unreconciled stock forward from September. |
| `NOVEMBER` | Nov 1–30, 2026 | Daily Trading Ledger | Pre-built template linking forward from October. |
| `DECEMBER` | Dec 1–31, 2026 | Daily Trading Ledger | Pre-built template linking forward from November and year-end reconciliation. |
| `MAY - JUNE` | May 24 – Jun 30, 2026 | External Debt Ledger | Capital injections from Collo vs value of phones sold; tracks in-period repayments and full settlement. |
| `JULY-AUGUST` | Jul 4 – Aug 31, 2026 | External Debt Ledger | Collo ledger continuation; tracks reinvested vs settled cash and post-period clearout. |
| `ALL MONTHS` | May 24 – Dec 31, 2026 | Master Consolidation | 222-day continuous ledger, debt tie-out checks, audit holdback tracker, and period rollups. |
| `Samsung Tracker` | Interactive | Visual Canvas App | Dynamic interactive frontend workspace backed directly by `SEPTEMBER!A1:AM68`. |
| `Sheet1` | Reference | Roadmap & Notes | Enhancement checklist, UX suggestions, and number-formatting guides. |
---
## 2. Business Logic & Mathematical Framework
### 2.1 Phase 1: Collo-Financed Operations (May – August)
External capital provided by financing partner Collo:
- **Capital Inflow:** Cash received from Collo.
- **Capital Outflow:** Phones issued for sale.
- **Running Debt Formula:**
$$\text{Closing Balance} = \text{Opening Balance} + \text{Cash Received from Collo} - \text{Value of Phones Sold}$$
- $\text{Balance} > 0$: Operator owes Collo (surplus cash held).
- $\text{Balance} < 0$: Collo owes Operator (phone sales exceeded cash provided).
- **Repayment Separation:**
- *Reinvested Repayments:* Cash immediately used to purchase new stock; logged for visibility but does not reduce net debt.
- *Settled Repayments:* Direct cash transfers that formally reduce outstanding liability.
---
### 2.2 Phase 2: Self-Financed Float Operations (September – December)
From September 1, 2026, the business operates on a closed-loop working capital float starting at **KES 200,000**.
#### Unit Economics by Handset Type
| Device Type | Specification | Deployed Cost | Cash Returned | Base Profit (Retained) | 2nd Account Spread |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Type A** | 128GB Smartphone | KES 3,700 | KES 3,800 | KES 100 | KES 0 |
| **Type B** | 64GB Smartphone | KES 3,530 / 3,570 | KES 3,800 | KES 100 | KES 170 (or KES 130) |
| **Type C** | Pop 20 64GB | KES 3,600 | KES 3,700 | KES 100 | KES 0 |
#### Cash Flow & Float Mechanics
1. Handing out a phone reduces cash-in-hand by its unit cost.
2. A phone is only reconciled when cash is returned by the agent.
3. Upon reconciliation, the principal capital returns to the float, while profit is distributed:
- KES 100 base profit is extracted.
- For Type B, the KES 170 spread is transferred to the **2nd Account**.
4. **Float Neutrality:** On days where all units reconcile, the cash float returns exactly to its starting balance (adjusted only for intentional owner cash additions/withdrawals).
5. **Open Receivables Asset Protection:** If units do not reconcile on the day of issue:
$$\text{Total Capital Preserved} = \text{Closing Cash Float} + \text{Open Stock at Cost}$$
---
## 3. Tab Structure & Formulas
### 3.1 TAB: `SEPTEMBER`
The operational engine of the self-financed model.
#### Daily Columns (Row 3 to 32)
- **Date (`A`):** `2026-09-01` in `A3`; `=A3+1` sequentially through `A32`.
- **Actual Balance Override (`B`):** Manual input if cash counted differs from expected.
- **Cash Added / Taken (`C`):** Manual capital injections (+) or owner draws (-).
- **Phone Counts (`D:I`):**
- `D`: Type A Out | `E`: Type A Reconciled
- `F`: Type B Out | `G`: Type B Reconciled
- `H`: Type C Out | `I`: Type C Reconciled
- **Expected Opening (`K`):** Row 3 links to `=$AI$6` (200,000); Row 4+ links to `=R3` (yesterday's closing float).
- **Opening Used (`L`):** `=IF(B3="", K3, B3)`
- **Cash Given Out (`N`):** `=D3*$AI$3 + F3*$AI$7 + H3*$AI$9`
- **Cash Left in Hand (`O`):**
- Rows 3–17: `=L3 + M3 - N3`
- Rows 18–32 (with Samsung deduction): `=L18 + M18 - N18 - B39`
- **Cash Received Back (`P`):** `=(E3+G3)*$AI$4 + I3*$AL$4`
- **Base Profit Taken (`Q`):** `=V3*$AI$5` *(Total Reconciled Units × 100)*
- **Closing Float (`R`):**
- Rows 3–17: `=L3 + M3 - N3 + P3 - Q3 - AE3`
- Rows 18–32: `=O18 + P18 - Q18 - AE18 + C39`
- **Difference vs Expected (`S`):** `=L3 - K3`
- **Trading Position (`T`):**
`=IF(Y3>0, TEXT(Y3,"#,##0")&" phones not reconciled", IF(AND(U3=0,V3=0), "No trading", "All reconciled"))`
- **Total Phones Given Out (`U`):** `=D3 + F3 + H3`
- **Total Phones Reconciled (`V`):** `=E3 + G3 + I3`
- **Daily Net Unreconciled (`W`):** `=U3 - V3`
- **Unreconciled Brought Forward (`X`):** `0` on Day 1; `=Y3` on subsequent days.
- **Phones Still Out (`Y`):** `=X3 + U3 - V3`
- **Stock Value at Cost (`Z`):** `=AB3*$AI$3 + AC3*$AI$7 + AD3*$AL$3`
- **Cash Expected Upon Return (`AA`):** `=(AB3+AC3)*$AI$4 + AD3*$AL$4`
- **Open Handsets by Type (`AB:AD`):**
- Type A (`AB`): `=AB2 + D3 - E3`
- Type B (`AC`): `=AC2 + F3 - G3`
- Type C (`AD`): `=AD2 + H3 - I3`
- **2nd Account Daily Transfer (`AE`):** `=G3*$AI$8`
- **2nd Account Running Balance (`AF`):** `=AF2 + AE3`
- **Aging Receivables Allocation (`AG`):**
`=MIN(U3, MAX(0, $Y$33 - SUM($U4:U$32))) * $AI$4`
#### Summary & Reconciliation Block (`AH3:AL41`)
- **Initial Float (`AI11`):** `=AI6` *(200,000)*
- **Total Cash Out (`AI14`):** `=N33` *(1,460,390)*
- **Total Cash Received (`AI15`):** `=P33` *(1,474,400)*
- **Total Expected Cash (`AI16`):** `=(SUM(D3:D32)+SUM(F3:F32))*$AI$4 + SUM(H3:H32)*$AL$4` *(1,538,800)*
- **Still to Come (`AI17`):** `=AI16 - AI15` *(64,400)*
- **Base Profit (`AI19`):** `=Q33` *(38,800)*
- **2nd Account Earnings (`AI20`):** `=AE33` *(36,550)*
- **Closing Float at 30 Sep (`AI22`):** `=R32` *(111,345)*
- **Audit Check 1 — Float Reconciliation (`AI27`):**
`=IF(ROUND(AI11 + AI12 + AI13 - AI14 + AI15 - AI19 - AI20 - AI22 - B54 + C54, 2)=0, "OK", "MISMATCH")`
- **Audit Check 2 — Unit Reconciliation (`AI28`):**
`=IF(ROUND(AI23 - AI24 - Y33, 2)=0, "OK", "MISMATCH")`
- **Total Portfolio Value Carried to Oct (`AI40`):** `=AI38 + AI34` *(Cash + Stock at Cost = 172,685)*
---
### 3.2 TAB: `DASHBOARD`
Executive command center summarizing all operating months:
- **Active Month Deployed:** `=INDEX(FILTER(D9:D16, D9:D16>0), ROWS(FILTER(D9:D16, D9:D16>0)))`
- **Active Month Recovered:** `=INDEX(FILTER(E9:E16, D9:D16>0), ROWS(FILTER(D9:D16, D9:D16>0)))`
- **Active Month Net Earnings:** `=INDEX(FILTER(I9:I16, D9:D16>0), ROWS(FILTER(D9:D16, D9:D16>0)))`
- **Latest Closing Float:** `=IFERROR(LOOKUP(2, 1/(D9:D16>0), K9:K16), K13)`
- **Model Comparison (Collo vs Self-Financed):** Uses `SUMIF(C9:C16, "Collo-Financed", ...)` and `SUMIF(C9:C16, "Self-Financed", ...)`.
---
### 3.3 TAB: `ALL MONTHS`
Master portfolio tie-out:
- **By-Period Debt Balance (`J3:Q5`):** Calculates gross net position (`=K4-L4`), subtracts settled repayments (`='MAY - JUNE'!M30 + M46`), and ties out closing liability to zero.
- **Audit Holdback (`J24:K29`):** Tracks the KES 50,000 provisional audit reserve.
- **Continuous Master Ledger (`A10:H232`):** Daily chronologically arranged log merging May through December into a unified ledger.
---
## 4. Complete Numerical Data Records
### 4.1 September 2026: Complete Daily Ledger (Active Trading)
| Date | Added/(Taken) | Type A Out/Back | Type B Out/Back | Type C Out/Back | Cash Out | Cash Left | Cash Back | Base Profit | 2nd Acct | Closing Float | Open Stock | Expected Cash |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **01/09** | 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 | 200,000 | 0 | 0 | 0 | 200,000 | 0 | 0 |
| **02/09** | 0 | 1 / 1 | 0 / 0 | 0 / 0 | 3,700 | 196,300 | 3,800 | 100 | 0 | 200,000 | 0 | 0 |
| **03/09** | 0 | 1 / 1 | 0 / 0 | 0 / 0 | 3,700 | 196,300 | 3,800 | 100 | 0 | 200,000 | 0 | 0 |
| **04/09** | 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 | 200,000 | 0 | 0 | 0 | 200,000 | 0 | 0 |
| **05/09** | 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 | 200,000 | 0 | 0 | 0 | 200,000 | 0 | 0 |
| **06/09** | 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 | 200,000 | 0 | 0 | 0 | 200,000 | 0 | 0 |
| **07/09** | 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 | 200,000 | 0 | 0 | 0 | 200,000 | 0 | 0 |
| **08/09** | 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 | 200,000 | 0 | 0 | 0 | 200,000 | 0 | 0 |
| **09/09** | 0 | 13 / 13 | 7 / 7 | 0 / 0 | 72,810 | 127,190 | 76,000 | 2,000 | 1,190 | 200,000 | 0 | 0 |
| **10/09** | 0 | 9 / 9 | 4 / 4 | 0 / 0 | 47,420 | 152,580 | 49,400 | 1,300 | 680 | 200,000 | 0 | 0 |
| **11/09** | (10,000) | 13 / 13 | 18 / 18 | 0 / 0 | 111,640 | 78,360 | 117,800 | 3,100 | 3,060 | 190,000 | 0 | 0 |
| **12/09** | (5,700) | 4 / 4 | 17 / 17 | 0 / 0 | 74,810 | 109,490 | 79,800 | 2,100 | 2,890 | 184,300 | 0 | 0 |
| **13/09** | 0 | 7 / 7 | 8 / 8 | 0 / 0 | 54,140 | 130,160 | 57,000 | 1,500 | 1,360 | 184,300 | 0 | 0 |
| **14/09** | (1,605) | 3 / 3 | 14 / 14 | 0 / 0 | 60,520 | 122,175 | 64,600 | 1,700 | 2,380 | 182,695 | 0 | 0 |
| **15/09** | 0 | 12 / 12 | 14 / 14 | 0 / 0 | 93,820 | 88,875 | 98,800 | 2,600 | 2,380 | 182,695 | 0 | 0 |
| **16/09** | 0 | 14 / 14 | 16 / 16 | 0 / 0 | 108,280 | 71,015 | 114,000 | 3,000 | 2,720 | 182,795 | 0 | 0 |
| **17/09** | 0 | 16 / 16 | 18 / 18 | 0 / 0 | 122,740 | 60,055 | 129,200 | 3,400 | 3,060 | 182,795 | 0 | 0 |
| **18/09** | 0 | 14 / 14 | 16 / 16 | 0 / 0 | 108,280 | 65,415 | 114,000 | 3,000 | 2,720 | 184,195 | 0 | 0 |
| **19/09** | (3,000) | 11 / 11 | 18 / 18 | 0 / 0 | 104,240 | 66,655 | 110,200 | 2,900 | 3,060 | 181,995 | 0 | 0 |
| **20/09** | 0 | 11 / 10 | 16 / 16 | 0 / 0 | 97,180 | 77,815 | 98,800 | 2,600 | 2,720 | 178,295 | 1 (Type A) | 3,800 |
| **21/09** | 0 | 20 / 20 | 24 / 24 | 0 / 0 | 158,720 | 9,775 | 167,200 | 4,400 | 4,080 | 178,995 | 1 (Type A) | 3,800 |
| **22/09** | (2,610) | 15 / 15 | 16 / 16 | 0 / 0 | 111,980 | 60,505 | 117,800 | 3,100 | 2,720 | 175,985 | 1 (Type A) | 3,800 |
| **23/09** | 0 | 10 / 10 | 10 / 9 | 0 / 0 | 72,300 | 96,685 | 72,200 | 1,900 | 1,530 | 165,455 | 2 (1A, 1B) | 7,600 |
| **24/09** | 0 | 6 / 0 | 7 / 0 | 2 / 0 | 54,110 | 111,345 | 0 | 0 | 0 | 111,345 | 17 (7A,8B,2C)| 64,400 |
| **25–30** | 0 | - | - | - | 0 | 111,345 | 0 | 0 | 0 | 111,345 | 17 | 64,400 |
| **TOTAL** | **(22,915)** | **179/172** | **224/216** | **2 / 0** | **1,460,390** | — | **1,474,400** | **38,800** | **36,550** | **111,345** | **17** | **64,400** |
---
### 4.2 Samsung Financing Sub-Ledger (September 16–30)
| Date | Money Given Out | Expected Received Back | Net Difference | Notes |
| :---: | :---: | :---: | :---: | :---: |
| **16/09/2026** | 3,400 | 3,500 | +100 | Fully recovered + margin |
| **17/09/2026** | 0 | 0 | 0 | No trading |
| **18/09/2026** | 9,100 | 10,500 | +1,400 | Fully recovered + margin |
| **19/09/2026** | 10,300 | 11,100 | +800 | Fully recovered + margin |
| **20/09/2026** | 7,000 | 7,000 | 0 | Capital recovered |
| **21/09/2026** | 9,800 | 10,500 | +700 | Fully recovered + margin |
| **22/09/2026** | 3,900 | 3,500 | (400) | Partial recovery |
| **23/09/2026** | 7,000 | 0 | (7,000) | Pending return |
| **24–30/09** | 0 | 0 | 0 | Blank / pending entries |
| **TOTAL** | **50,500** | **46,100** | **(4,400)** | **KES 4,400 Pending Recovery** |
---
### 4.3 Historical Collo Era Summaries (May – August 2026)
#### May 2026 (May 24 – 31)
- Cash received from Collo: **KES 452,800**
- Value of phones sold: **KES 523,000**
- Net position: **(KES 70,200)** *(Collo owed operator; carried to June)*
#### June 2026 (June 1 – 30)
- Cash received from Collo: **KES 1,768,800**
- Value of phones sold: **KES 1,884,800**
- In-period repayments logged: **KES 36,000**
- Month-end closing balance: **(KES 150,200)**
- Final post-period settlement: **KES 150,200 paid by Collo (Cleared in Full to KES 0)**
#### July 2026 (July 4 – 31)
- Cash received from Collo: **KES 1,924,500**
- Value of phones sold: **KES 1,888,000**
- Month-end closing balance: **KES 36,500** *(Operator owed Collo; carried to August)*
#### August 2026 (August 1 – 31)
- Cash received from Collo: **KES 2,059,600**
- Value of phones sold: **KES 2,329,400**
- In-period repayments logged: **KES 135,300**
- Gross deficit position: **(KES 233,300)**
- Reinvested repayments: **KES 160,400**
- Settlement 1 (Aug 26): **KES 152,000**
- Settlement 2: **KES 81,300**
- Final balance: **KES 0 (Cleared in Full)**
---
### 4.4 Master By-Period Debt Reconciliation (`ALL MONTHS!J3:Q6`)
| Period | Cash from Collo | Value Sold | Gross Net | Reinvested (Excluded) | Settled Repayments | Closing Debt | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **May – June** | 2,221,600 | 2,407,800 | (186,200) | 0 | 186,200 | **0** | **Settled in Full** |
| **July – August** | 3,984,100 | 4,217,400 | (233,300) | 160,400 | 233,300 | **0** | **Settled in Full** |
| **Total Collo Era** | **6,205,700** | **6,625,200** | **(419,500)** | **160,400** | **419,500** | **0** | **100% Reconciled** |
---
### 4.5 Executive Dashboard Multi-Month Progression (`DASHBOARD!B8:L18`)
| Month | Model | Cash Out | Cash Back | Volume | Base Profit | 2nd Acct | Net Profit | Margin % | Closing Balance | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **May 2026** | Collo | 523,000 | 452,800 | 145 | — | — | — | — | (70,200) | Settled |
| **Jun 2026** | Collo | 1,884,800 | 1,768,800 | 524 | — | — | — | — | (186,200) | Settled |
| **Jul 2026** | Collo | 1,888,000 | 1,924,500 | 497 | — | — | — | — | 36,500 | Settled |
| **Aug 2026** | Collo | 2,329,400 | 2,059,600 | 613 | — | — | — | — | (233,300) | Settled |
| **Sep 2026** | Self-Financed | 1,460,390 | 1,474,400 | 405 | 38,800 | 36,550 | 75,350 | 5.2% | 111,345 | Active (64,400 open) |
| **Oct 2026** | Self-Financed | 0 | 0 | 0 | 0 | 0 | 0 | 0.0% | 111,345 | Pending Trading |
| **Nov 2026** | Self-Financed | 0 | 0 | 0 | 0 | 0 | 0 | 0.0% | 111,345 | Pending Trading |
| **Dec 2026** | Self-Financed | 0 | 0 | 0 | 0 | 0 | 0 | 0.0% | 111,345 | Pending Trading |
| **TOTAL** | **5 Active Mos** | **8,085,590** | **7,680,100** | **2,184** | **38,800** | **36,550** | **75,350** | **0.9%** | **111,345** | **Fully Tied Out** |
---
## 5. Daily Standard Operating Procedure (SOP)
┌─────────────────────────────────────────────────────────────────────────────┐
│ DAILY OPERATING PROCEDURE │
└─────────────────────────────────────────────────────────────────────────────┘
MORNING (Opening Float):
a. Check Column K for expected opening cash.
b. Physically count cash. If it matches, leave Column B blank.
c. If physical cash differs, enter the counted cash in Column B.
d. Enter any capital injections (+) or owner draws (-) in Column C.
DURING THE DAY (Disbursement):
a. Enter units handed out:
• Col D: Type A (128GB @ 3,700)
• Col F: Type B (64GB @ 3,530)
• Col H: Type C (Pop 20 @ 3,600)
b. Cash out (Col N) and cash left in hand (Col O) calculate automatically.
EVENING (Reconciliation & Close):
a. Enter reconciled units returning cash:
• Col E: Type A back (3,800)
• Col G: Type B back (3,800)
• Col I: Type C back (3,700)
b. If Samsung devices were sold, enter cash out and back in rows 39–53.
c. Check Column R for closing float.
d. Verify audit cells AI27 ("Float ties") and AI28 ("Reconciliation ties")
both read "OK".
How to Convert this to PDF, Word, or Google Docs
To Google Docs / PDF:
Copy the text above.
Open a new document at[docs.new](https://docs.new).
Paste the content. Google Docs will format the headers and markdown tables automatically.
Select File → Download → PDF Document (.pdf).
Direct to PDF via Visual Studio Code / Typora / Obsidian:
Save the snippet as DOCUMENTATION.md and use the built-in Export to PDF or Print to PDF option.