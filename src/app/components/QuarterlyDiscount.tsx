import { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle, AlertCircle,
  Wifi, WifiOff, Trophy, Clock, Package, BarChart2, Users,
  Info, Zap, Award, ShoppingCart,
} from "lucide-react";

// ─── ТИПЫ ───────────────────────────────────────────────────────────────────
type PeriodState = "in_progress" | "closed_calc" | "closed_final";
type StatusColor  = "green" | "yellow" | "red" | "gray" | "blue";
type ReportSt     = "ontime" | "late" | "missing" | "pending";

interface MonthRow {
  month: string;
  plan: number;
  fact: number;
  pct: number;
  isFuture: boolean;
}
interface SILine { name: string; lim: number; fact: number; remaining: number; ok: boolean; na?: boolean; }
interface SOLine { name: string; lim: number; plan: number; fact: number; remaining: number; ok: boolean; }
interface Report  { month: string; type: string; deadline: string; st: ReportSt; }

// ─── ТИПЫ БЛОКА 5 (Отчётность) ──────────────────────────────────────────────
type ReportStatus5 = "ontime" | "late" | "missing" | "pending";
type MonthCardStatus = "ontime" | "late" | "missing" | "pending" | "partial";

interface ReportEntry5 {
  name: string;
  deadline: string;
  submittedDate: string | null;
  status: ReportStatus5;
}

interface MonthReport5 {
  month: string;
  reports: ReportEntry5[];
}

interface Scenario {
  id: string; label: string; date: string;
  monthIdx: 1 | 2 | 3 | 0; state: PeriodState; cislink: boolean;
  forecastDiscount?: number; growthPotential?: number;
  calcDiscount?: number; finalDiscount?: number | null; finalOverridden?: boolean;
  partnerResult: "partner" | "distributor" | "preliminary";
  criteria: {
    score:   { value: string; color: StatusColor };
    sellout: { value: string; color: StatusColor };
    soLines: { value: string; color: StatusColor };
    cislink: { value: string; color: StatusColor };
  };
  // SI & SO monthly data (always 3 rows)
  siMonths: MonthRow[]; siBlocked: boolean; siEarned: number;
  soMonths: MonthRow[]; soBlocked: boolean; soEarned: number;
  // Remaining blocks
  siLines: SILine[]; siLinesEarned: number; siLinesRec: string; siLinesBlocked: boolean;
  soLines: SOLine[]; soLinesEarned: number; soLinesRec: string;
  reports: Report[]; reportEarned: number; reportNote: string;
  b2c: number; b2b: number; phys: number; channelsSt: StatusColor; channelsNote: string;
  stock: number; inTransit: number; avgMo: number; coverage: number;
  invSt: "deficit" | "norm" | "excess";
  openBlocks: number[];
}

// ─── ДАННЫЕ БЛОКА 5: ОТЧЁТНОСТЬ ─────────────────────────────────────────────
const IS = "Промежуточный отчёт о продажах";
const IR = "Промежуточный отчёт об остатках";
const FS = "Окончательный отчёт о продажах";
const FR = "Окончательный отчёт об остатках";

function mkPendingMonth(month: string, id: string, fd: string): MonthReport5 {
  return { month, reports: [
    { name: IS, deadline: id, submittedDate: null, status: "pending" },
    { name: IR, deadline: id, submittedDate: null, status: "pending" },
    { name: FS, deadline: fd, submittedDate: null, status: "pending" },
    { name: FR, deadline: fd, submittedDate: null, status: "pending" },
  ]};
}
function mkOntimeMonth(month: string, id: string, fd: string, is_: string, fs_: string): MonthReport5 {
  return { month, reports: [
    { name: IS, deadline: id, submittedDate: is_, status: "ontime" },
    { name: IR, deadline: id, submittedDate: is_, status: "ontime" },
    { name: FS, deadline: fd, submittedDate: fs_, status: "ontime" },
    { name: FR, deadline: fd, submittedDate: fs_, status: "ontime" },
  ]};
}
function mkMissingMonth(month: string, id: string, fd: string): MonthReport5 {
  return { month, reports: [
    { name: IS, deadline: id, submittedDate: null, status: "missing" },
    { name: IR, deadline: id, submittedDate: null, status: "missing" },
    { name: FS, deadline: fd, submittedDate: null, status: "missing" },
    { name: FR, deadline: fd, submittedDate: null, status: "missing" },
  ]};
}

const REPORT_BLOCK_DATA: Record<string, MonthReport5[]> = {
  // С1 — 5 апреля, CISLink вкл, все ожидаются
  s1: [
    mkPendingMonth("Апрель", "21 апр", "6 мая"),
    mkPendingMonth("Май",    "21 мая", "3 июн"),
    mkPendingMonth("Июнь",   "23 июн", "3 июл"),
  ],
  // С2 — 20 мая, CISLink выкл, апрель не сдан
  s2: [
    mkMissingMonth("Апрель", "21 апр", "6 мая"),
    mkPendingMonth("Май",    "21 мая", "3 июн"),
    mkPendingMonth("Июнь",   "23 июн", "3 июл"),
  ],
  // С3 — 20 мая, CISLink вкл, апрель вовремя
  s3: [
    mkOntimeMonth("Апрель", "21 апр", "6 мая", "20 апр", "5 мая"),
    mkPendingMonth("Май",    "21 мая", "3 июн"),
    mkPendingMonth("Июнь",   "23 июн", "3 июл"),
  ],
  // С4 — 24 июня, CISLink выкл, апрель не сдан, май: 2 missing + 1 late + 1 missing, июнь: 2 missing + 2 pending
  s4: [
    mkMissingMonth("Апрель", "21 апр", "6 мая"),
    { month: "Май", reports: [
      { name: IS, deadline: "21 мая", submittedDate: null,     status: "missing" },
      { name: IR, deadline: "21 мая", submittedDate: null,     status: "missing" },
      { name: FS, deadline: "3 июн",  submittedDate: "9 июн",  status: "late"    },
      { name: FR, deadline: "3 июн",  submittedDate: null,     status: "missing" },
    ]},
    { month: "Июнь", reports: [
      { name: IS, deadline: "23 июн", submittedDate: null, status: "missing" },
      { name: IR, deadline: "23 июн", submittedDate: null, status: "missing" },
      { name: FS, deadline: "3 июл",  submittedDate: null, status: "pending" },
      { name: FR, deadline: "3 июл",  submittedDate: null, status: "pending" },
    ]},
  ],
  // С5 — 24 июня, CISLink вкл, апрель+май вовремя, июнь: 2 ontime + 2 pending
  s5: [
    mkOntimeMonth("Апрель", "21 апр", "6 мая", "20 апр", "5 мая"),
    mkOntimeMonth("Май",    "21 мая", "3 июн", "20 мая", "2 июн"),
    { month: "Июнь", reports: [
      { name: IS, deadline: "23 июн", submittedDate: "22 июн", status: "ontime"  },
      { name: IR, deadline: "23 июн", submittedDate: "22 июн", status: "ontime"  },
      { name: FS, deadline: "3 июл",  submittedDate: null,     status: "pending" },
      { name: FR, deadline: "3 июл",  submittedDate: null,     status: "pending" },
    ]},
  ],
  // С6 — 3 июля, все 12 вовремя, квартал закрыт
  s6: [
    mkOntimeMonth("Апрель", "21 апр", "6 мая",  "20 апр", "5 мая"),
    mkOntimeMonth("Май",    "21 мая", "3 июн",  "20 мая", "2 июн"),
    mkOntimeMonth("Июнь",   "23 июн", "3 июл",  "22 июн", "3 июл"),
  ],
  // С7 — 16 июля, все 12 вовремя, итоговая скидка
  s7: [
    mkOntimeMonth("Апрель", "21 апр", "6 мая",  "20 апр", "5 мая"),
    mkOntimeMonth("Май",    "21 мая", "3 июн",  "20 мая", "2 июн"),
    mkOntimeMonth("Июнь",   "23 июн", "3 июл",  "22 июн", "3 июл"),
  ],
};

// ─── КОНСТАНТЫ ──────────────────────────────────────────────────────────────
const SI_TOTAL = 5000;
const SO_TOTAL = 4800;
const MONTHS   = ["Апрель", "Май", "Июнь"];
const REPORTS_TYPES = ["Остатки склада", "Sell-Out отчёт", "Данные CISLink", "Каналы сбыта"];

function makeReports(apr: ReportSt, may: ReportSt, jun: ReportSt): Report[] {
  return REPORTS_TYPES.flatMap(type => [
    { month: "Апрель", type, deadline: "05.05.2026", st: apr },
    { month: "Май",    type, deadline: "05.06.2026", st: may },
    { month: "Июнь",  type, deadline: "05.07.2026", st: jun },
  ]);
}

// ─── 7 СЦЕНАРИЕВ ─────────────────────────────────────────────────────────────
// Данные синхронизированы с Dashboard(1).html (маппинг: s1←m1, s2←m2b, s3←m2g,
// s4←m3b, s5←m3g, s6/s7←done). Планы масштабированы к SI_TOTAL=5000 / SO_TOTAL=4800
// (SI×3.846=5000/1300, SO×3.2=4800/1500). Скидки — источник TSX.
const SCENARIOS: Scenario[] = [
  // ── С1: Апрель, мало данных (m1) ──────────────────────────────────────────
  {
    id: "s1", label: "С1 · Апр, мало данных", date: "5 апреля 2026",
    monthIdx: 1, state: "in_progress", cislink: true,
    forecastDiscount: 0, growthPotential: 20,
    partnerResult: "preliminary",
    criteria: {
      score:   { value: "270 баллов (ср.)", color: "gray"  },
      sellout: { value: "7,5%",             color: "red"   },
      soLines: { value: "мало данных",       color: "gray"  },
      cislink: { value: "подключена",        color: "green" },
    },
    siMonths: [
      { month: "Апрель", plan: 1346, fact: 377, pct: 28, isFuture: false },
      { month: "Май",    plan: 1731, fact: 0,   pct: 0,  isFuture: true  },
      { month: "Июнь",   plan: 1923, fact: 0,   pct: 0,  isFuture: true  },
    ],
    siBlocked: false, siEarned: 0,
    soMonths: [
      { month: "Апрель", plan: 1280, fact: 358, pct: 28, isFuture: false },
      { month: "Май",    plan: 1600, fact: 0,   pct: 0,  isFuture: true  },
      { month: "Июнь",   plan: 1920, fact: 0,   pct: 0,  isFuture: true  },
    ],
    soBlocked: false, soEarned: 0,
    siLines: [
      { name: "Эстелайт Астерия",   lim: 11,  fact: 0, remaining: 0, ok: false, na: true },
      { name: "Universal Flow",      lim: 30,  fact: 0, remaining: 0, ok: false, na: true },
      { name: "Bulk Fill Flow",      lim: 2,   fact: 0, remaining: 0, ok: false, na: true },
      { name: "Эстелайт Posterior",  lim: 3,   fact: 0, remaining: 0, ok: false, na: true },
      { name: "Bond Force",          lim: 2.5, fact: 0, remaining: 0, ok: false, na: true },
      { name: "Bond Universal II",   lim: 0,   fact: 0, remaining: 0, ok: false, na: true },
    ],
    siLinesEarned: 0, siLinesRec: "Недостаточно данных для оценки линеек", siLinesBlocked: false,
    soLines: [
      { name: "Эстелайт Астерия", lim: 11, plan: 458,  fact: 38,  remaining: 420,  ok: false },
      { name: "Universal Flow",    lim: 30, plan: 1248, fact: 112, remaining: 1136, ok: false },
      { name: "Bulk Fill Flow",    lim: 2,  plan: 83,   fact: 3,   remaining: 80,   ok: false },
    ],
    soLinesEarned: 0, soLinesRec: "Недостаточно данных",
    reports: makeReports("pending", "nodata" as any, "nodata" as any),
    reportEarned: 0, reportNote: "Отчёты за апрель ожидаются (дедлайн: 21.04.2026)",
    b2c: 92, b2b: 6, phys: 2, channelsSt: "green", channelsNote: "Непрямые каналы 8,2% — норма",
    stock: 3900, inTransit: 450, avgMo: 1759, coverage: 2.5, invSt: "norm",
    openBlocks: [1, 2],
  },

  // ── С2: Май, всё плохо (m2b) ─────────────────────────────────────────────
  {
    id: "s2", label: "С2 · Май, всё плохо", date: "20 мая 2026",
    monthIdx: 2, state: "in_progress", cislink: false,
    forecastDiscount: 0, growthPotential: 5,
    partnerResult: "distributor",
    criteria: {
      score:   { value: "270 баллов (ср.)", color: "gray" },
      sellout: { value: "36,9%",            color: "red"  },
      soLines: { value: "не выполнено",     color: "red"  },
      cislink: { value: "не подключена",    color: "red"  },
    },
    siMonths: [
      { month: "Апрель", plan: 1346, fact: 889,  pct: 66, isFuture: false },
      { month: "Май",    plan: 1731, fact: 1315, pct: 76, isFuture: false },
      { month: "Июнь",   plan: 1923, fact: 0,    pct: 0,  isFuture: true  },
    ],
    siBlocked: true, siEarned: 0,
    soMonths: [
      { month: "Апрель", plan: 1280, fact: 781, pct: 61, isFuture: false },
      { month: "Май",    plan: 1600, fact: 992, pct: 62, isFuture: false },
      { month: "Июнь",   plan: 1920, fact: 0,   pct: 0,  isFuture: true  },
    ],
    soBlocked: true, soEarned: 0,
    siLines: [
      { name: "Эстелайт Астерия",   lim: 11,  fact: 5.2,  remaining: 87,  ok: false },
      { name: "Universal Flow",      lim: 30,  fact: 21.0, remaining: 135, ok: false },
      { name: "Bulk Fill Flow",      lim: 2,   fact: 0.7,  remaining: 20,  ok: false },
      { name: "Эстелайт Posterior",  lim: 3,   fact: 2.1,  remaining: 14,  ok: false },
      { name: "Bond Force",          lim: 2.5, fact: 1.3,  remaining: 18,  ok: false },
      { name: "Bond Universal II",   lim: 0,   fact: 0,    remaining: 0,   ok: true  },
    ],
    siLinesEarned: 0, siLinesRec: "Сначала выполните 90% Sell-In квартала", siLinesBlocked: true,
    soLines: [
      { name: "Эстелайт Астерия", lim: 11, plan: 458,  fact: 480, remaining: 0,   ok: true  },
      { name: "Universal Flow",    lim: 30, plan: 1248, fact: 960, remaining: 288, ok: false },
      { name: "Bulk Fill Flow",    lim: 2,  plan: 83,   fact: 38,  remaining: 45,  ok: false },
    ],
    soLinesEarned: 0, soLinesRec: "Universal Flow −288 шт, Балк Филл −45 шт",
    reports: makeReports("missing" as any, "pending", "nodata" as any),
    reportEarned: 0, reportNote: "CISLink не подключена → скидка за отчётность = 0%",
    b2c: 54, b2b: 30, phys: 16, channelsSt: "red", channelsNote: "Непрямые каналы 45,8% — риск штрафа",
    stock: 1850, inTransit: 100, avgMo: 1759, coverage: 1.1, invSt: "deficit",
    openBlocks: [1, 2, 6],
  },

  // ── С3: Май, всё хорошо (m2g) ────────────────────────────────────────────
  {
    id: "s3", label: "С3 · Май, всё хорошо", date: "20 мая 2026",
    monthIdx: 2, state: "in_progress", cislink: true,
    forecastDiscount: 16, growthPotential: 4,
    partnerResult: "preliminary",
    criteria: {
      score:   { value: "270 баллов (ср.)", color: "gray"  },
      sellout: { value: "68,6%",            color: "red"   },
      soLines: { value: "в процессе",       color: "green" },
      cislink: { value: "подключена",       color: "green" },
    },
    siMonths: [
      { month: "Апрель", plan: 1346, fact: 1738, pct: 129, isFuture: false },
      { month: "Май",    plan: 1731, fact: 1938, pct: 112, isFuture: false },
      { month: "Июнь",   plan: 1923, fact: 0,    pct: 0,   isFuture: true  },
    ],
    siBlocked: false, siEarned: 3,
    soMonths: [
      { month: "Апрель", plan: 1280, fact: 1549, pct: 121, isFuture: false },
      { month: "Май",    plan: 1600, fact: 1744, pct: 109, isFuture: false },
      { month: "Июнь",   plan: 1920, fact: 0,    pct: 0,   isFuture: true  },
    ],
    soBlocked: false, soEarned: 7,
    siLines: [
      { name: "Эстелайт Астерия",   lim: 11,  fact: 9.5,  remaining: 75, ok: false },
      { name: "Universal Flow",      lim: 30,  fact: 34.5, remaining: 0,  ok: true  },
      { name: "Bulk Fill Flow",      lim: 2,   fact: 2.4,  remaining: 0,  ok: true  },
      { name: "Эстелайт Posterior",  lim: 3,   fact: 4.0,  remaining: 0,  ok: true  },
      { name: "Bond Force",          lim: 2.5, fact: 3.0,  remaining: 0,  ok: true  },
      { name: "Bond Universal II",   lim: 0,   fact: 1.2,  remaining: 0,  ok: true  },
    ],
    siLinesEarned: 2, siLinesRec: "Астерия ниже лимита 11% — доработать закупки", siLinesBlocked: false,
    soLines: [
      { name: "Эстелайт Астерия", lim: 11, plan: 458,  fact: 480, remaining: 0,   ok: true  },
      { name: "Universal Flow",    lim: 30, plan: 1248, fact: 976, remaining: 272, ok: false },
      { name: "Bulk Fill Flow",    lim: 2,  plan: 83,   fact: 90,  remaining: 0,   ok: true  },
    ],
    soLinesEarned: 3, soLinesRec: "Universal Flow отстаёт −272 шт, остальные ✓",
    reports: makeReports("ontime", "pending", "nodata" as any),
    reportEarned: 1, reportNote: "Апрель: все отчёты вовремя. Май и июнь ожидаются.",
    b2c: 91, b2b: 7, phys: 2, channelsSt: "green", channelsNote: "Непрямые каналы 9,1% — норма",
    stock: 4060, inTransit: 510, avgMo: 1759, coverage: 2.6, invSt: "norm",
    openBlocks: [1, 2, 3],
  },

  // ── С4: Июнь, всё плохо (m3b) ────────────────────────────────────────────
  {
    id: "s4", label: "С4 · Июнь, всё плохо", date: "24 июня 2026",
    monthIdx: 3, state: "in_progress", cislink: false,
    forecastDiscount: 0, growthPotential: 0,
    partnerResult: "distributor",
    criteria: {
      score:   { value: "270 баллов (ср.)", color: "gray" },
      sellout: { value: "55,7%",            color: "red"  },
      soLines: { value: "не выполнено",     color: "red"  },
      cislink: { value: "не подключена",    color: "red"  },
    },
    siMonths: [
      { month: "Апрель", plan: 1346, fact: 889,  pct: 66, isFuture: false },
      { month: "Май",    plan: 1731, fact: 1315, pct: 76, isFuture: false },
      { month: "Июнь",   plan: 1923, fact: 1108, pct: 58, isFuture: false },
    ],
    siBlocked: true, siEarned: 0,
    soMonths: [
      { month: "Апрель", plan: 1280, fact: 781, pct: 61, isFuture: false },
      { month: "Май",    plan: 1600, fact: 992, pct: 62, isFuture: false },
      { month: "Июнь",   plan: 1920, fact: 902, pct: 47, isFuture: false },
    ],
    soBlocked: true, soEarned: 0,
    siLines: [
      { name: "Эстелайт Астерия",   lim: 11,  fact: 6.9,  remaining: 102, ok: false },
      { name: "Universal Flow",      lim: 30,  fact: 20.4, remaining: 234, ok: false },
      { name: "Bulk Fill Flow",      lim: 2,   fact: 0.9,  remaining: 28,  ok: false },
      { name: "Эстелайт Posterior",  lim: 3,   fact: 1.8,  remaining: 29,  ok: false },
      { name: "Bond Force",          lim: 2.5, fact: 3.0,  remaining: 0,   ok: true  },
      { name: "Bond Universal II",   lim: 0,   fact: 0.5,  remaining: 0,   ok: true  },
    ],
    siLinesEarned: 0, siLinesRec: "Линейки не выполнены", siLinesBlocked: true,
    soLines: [
      { name: "Эстелайт Астерия", lim: 11, plan: 458,  fact: 256, remaining: 202, ok: false },
      { name: "Universal Flow",    lim: 30, plan: 1248, fact: 640, remaining: 608, ok: false },
      { name: "Bulk Fill Flow",    lim: 2,  plan: 83,   fact: 26,  remaining: 57,  ok: false },
    ],
    soLinesEarned: 0, soLinesRec: "Все линейки сбыта не выполнены",
    reports: makeReports("missing" as any, "missing" as any, "pending"),
    reportEarned: 0, reportNote: "CISLink не подключена → скидка за отчётность = 0%",
    b2c: 55, b2b: 29, phys: 15, channelsSt: "red", channelsNote: "Непрямые каналы 44,2% — риск штрафа",
    stock: 1900, inTransit: 200, avgMo: 1759, coverage: 1.2, invSt: "deficit",
    openBlocks: [1, 2],
  },

  // ── С5: Июнь, всё хорошо (m3g) ───────────────────────────────────────────
  {
    id: "s5", label: "С5 · Июнь, всё хорошо", date: "24 июня 2026",
    monthIdx: 3, state: "in_progress", cislink: true,
    forecastDiscount: 16, growthPotential: 4,
    partnerResult: "preliminary",
    criteria: {
      score:   { value: "270 баллов (ср.)", color: "gray"  },
      sellout: { value: "98,7%",            color: "green" },
      soLines: { value: "выполнено",        color: "green" },
      cislink: { value: "подключена",       color: "green" },
    },
    siMonths: [
      { month: "Апрель", plan: 1346, fact: 1738, pct: 129, isFuture: false },
      { month: "Май",    plan: 1731, fact: 1938, pct: 112, isFuture: false },
      { month: "Июнь",   plan: 1923, fact: 1631, pct: 85,  isFuture: false },
    ],
    siBlocked: false, siEarned: 3,
    soMonths: [
      { month: "Апрель", plan: 1280, fact: 1549, pct: 121, isFuture: false },
      { month: "Май",    plan: 1600, fact: 1744, pct: 109, isFuture: false },
      { month: "Июнь",   plan: 1920, fact: 1446, pct: 75,  isFuture: false },
    ],
    soBlocked: false, soEarned: 7,
    siLines: [
      { name: "Эстелайт Астерия",   lim: 11,  fact: 9.0,  remaining: 100, ok: false },
      { name: "Universal Flow",      lim: 30,  fact: 35.0, remaining: 0,   ok: true  },
      { name: "Bulk Fill Flow",      lim: 2,   fact: 2.4,  remaining: 0,   ok: true  },
      { name: "Эстелайт Posterior",  lim: 3,   fact: 3.8,  remaining: 0,   ok: true  },
      { name: "Bond Force",          lim: 2.5, fact: 2.9,  remaining: 0,   ok: true  },
      { name: "Bond Universal II",   lim: 0,   fact: 1.1,  remaining: 0,   ok: true  },
    ],
    siLinesEarned: 2, siLinesRec: "Астерия не достигла лимита 11%. Остальные линейки ✓", siLinesBlocked: false,
    soLines: [
      { name: "Эстелайт Астерия", lim: 11, plan: 458,  fact: 486,  remaining: 0, ok: true },
      { name: "Universal Flow",    lim: 30, plan: 1248, fact: 1264, remaining: 0, ok: true },
      { name: "Bulk Fill Flow",    lim: 2,  plan: 83,   fact: 90,   remaining: 0, ok: true },
    ],
    soLinesEarned: 3, soLinesRec: "Все линейки сбыта выполнены ✓",
    reports: makeReports("ontime", "ontime", "pending"),
    reportEarned: 1, reportNote: "0 просрочек из 12 за квартал — скидка +1%",
    b2c: 90, b2b: 7, phys: 3, channelsSt: "green", channelsNote: "Непрямые каналы 10,1% — норма",
    stock: 4300, inTransit: 650, avgMo: 1759, coverage: 2.8, invSt: "norm",
    openBlocks: [1, 2, 3],
  },

  // ── С6: После квартала, расчётная (done → closed_calc) ───────────────────
  {
    id: "s6", label: "С6 · Расчётная, итоговой нет", date: "3 июля 2026",
    monthIdx: 0, state: "closed_calc", cislink: true,
    calcDiscount: 16, finalDiscount: null,
    partnerResult: "partner",
    criteria: {
      score:   { value: "280 баллов", color: "green" },
      sellout: { value: "103,3%",     color: "green" },
      soLines: { value: "выполнено",  color: "green" },
      cislink: { value: "подключена", color: "green" },
    },
    siMonths: [
      { month: "Апрель", plan: 1154, fact: 1485, pct: 129, isFuture: false },
      { month: "Май",    plan: 1923, fact: 2196, pct: 114, isFuture: false },
      { month: "Июнь",   plan: 1923, fact: 1450, pct: 75,  isFuture: false },
    ],
    siBlocked: false, siEarned: 3,
    soMonths: [
      { month: "Апрель", plan: 960,  fact: 1168, pct: 122, isFuture: false },
      { month: "Май",    plan: 1600, fact: 1754, pct: 110, isFuture: false },
      { month: "Июнь",   plan: 2240, fact: 2038, pct: 91,  isFuture: false },
    ],
    soBlocked: false, soEarned: 7,
    siLines: [
      { name: "Эстелайт Астерия",   lim: 11,  fact: 8.2,  remaining: 140, ok: false },
      { name: "Universal Flow",      lim: 30,  fact: 27.9, remaining: 105, ok: false },
      { name: "Bulk Fill Flow",      lim: 2,   fact: 3.3,  remaining: 0,   ok: true  },
      { name: "Эстелайт Posterior",  lim: 3,   fact: 1.7,  remaining: 65,  ok: false },
      { name: "Bond Force",          lim: 2.5, fact: 10.2, remaining: 0,   ok: true  },
      { name: "Bond Universal II",   lim: 0,   fact: 0,    remaining: 0,   ok: true  },
    ],
    siLinesEarned: 2, siLinesRec: "Линейки Sell-In +2% начислено ✓", siLinesBlocked: false,
    soLines: [
      { name: "Эстелайт Астерия", lim: 11, plan: 458,  fact: 486,  remaining: 0, ok: true },
      { name: "Universal Flow",    lim: 30, plan: 1248, fact: 1264, remaining: 0, ok: true },
      { name: "Bulk Fill Flow",    lim: 2,  plan: 83,   fact: 90,   remaining: 0, ok: true },
    ],
    soLinesEarned: 3, soLinesRec: "Линейки Sell-Out +3% начислено ✓",
    reports: makeReports("ontime", "ontime", "ontime"),
    reportEarned: 1, reportNote: "0 просрочек из 12 → +1% начислено",
    b2c: 89, b2b: 8, phys: 3, channelsSt: "green", channelsNote: "Итог: непрямые 10,6% — информационно",
    stock: 4300, inTransit: 650, avgMo: 1759, coverage: 2.8, invSt: "norm",
    openBlocks: [1, 2, 4],
  },

  // ── С7: После квартала, итоговая 18% (done → closed_final) ───────────────
  {
    id: "s7", label: "С7 · Итоговая 18%", date: "16 июля 2026",
    monthIdx: 0, state: "closed_final", cislink: true,
    calcDiscount: 16, finalDiscount: 18, finalOverridden: true,
    partnerResult: "partner",
    criteria: {
      score:   { value: "280 баллов", color: "green" },
      sellout: { value: "103,3%",     color: "green" },
      soLines: { value: "выполнено",  color: "green" },
      cislink: { value: "подключена", color: "green" },
    },
    siMonths: [
      { month: "Апрель", plan: 1154, fact: 1485, pct: 129, isFuture: false },
      { month: "Май",    plan: 1923, fact: 2196, pct: 114, isFuture: false },
      { month: "Июнь",   plan: 1923, fact: 1450, pct: 75,  isFuture: false },
    ],
    siBlocked: false, siEarned: 3,
    soMonths: [
      { month: "Апрель", plan: 960,  fact: 1168, pct: 122, isFuture: false },
      { month: "Май",    plan: 1600, fact: 1754, pct: 110, isFuture: false },
      { month: "Июнь",   plan: 2240, fact: 2038, pct: 91,  isFuture: false },
    ],
    soBlocked: false, soEarned: 7,
    siLines: [
      { name: "Эстелайт Астерия",   lim: 11,  fact: 8.2,  remaining: 140, ok: false },
      { name: "Universal Flow",      lim: 30,  fact: 27.9, remaining: 105, ok: false },
      { name: "Bulk Fill Flow",      lim: 2,   fact: 3.3,  remaining: 0,   ok: true  },
      { name: "Эстелайт Posterior",  lim: 3,   fact: 1.7,  remaining: 65,  ok: false },
      { name: "Bond Force",          lim: 2.5, fact: 10.2, remaining: 0,   ok: true  },
      { name: "Bond Universal II",   lim: 0,   fact: 0,    remaining: 0,   ok: true  },
    ],
    siLinesEarned: 2, siLinesRec: "Расшифровка: Sell-In линейки +2%", siLinesBlocked: false,
    soLines: [
      { name: "Эстелайт Астерия", lim: 11, plan: 458,  fact: 486,  remaining: 0, ok: true },
      { name: "Universal Flow",    lim: 30, plan: 1248, fact: 1264, remaining: 0, ok: true },
      { name: "Bulk Fill Flow",    lim: 2,  plan: 83,   fact: 90,   remaining: 0, ok: true },
    ],
    soLinesEarned: 3, soLinesRec: "Расшифровка: Sell-Out линейки +3%",
    reports: makeReports("ontime", "ontime", "ontime"),
    reportEarned: 1, reportNote: "Итог: 0 просрочек из 12 → +1%",
    b2c: 89, b2b: 8, phys: 3, channelsSt: "green", channelsNote: "Информационный итог — без штрафа",
    stock: 4300, inTransit: 650, avgMo: 1759, coverage: 2.8, invSt: "norm",
    openBlocks: [1, 2, 3, 4],
  },
];

// ─── УТИЛИТЫ ─────────────────────────────────────────────────────────────────
function colorCls(c: StatusColor, variant: "bg" | "text" | "border" | "badge" = "badge") {
  const map: Record<StatusColor, Record<string, string>> = {
    green:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  badge: "bg-green-100 text-green-700 border border-green-200"  },
    yellow: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  badge: "bg-amber-100 text-amber-700 border border-amber-200"  },
    red:    { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    badge: "bg-red-100 text-red-700 border border-red-200"        },
    gray:   { bg: "bg-gray-50",   text: "text-gray-400",   border: "border-gray-200",   badge: "bg-gray-100 text-gray-500 border border-gray-200"     },
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700 border border-blue-200"     },
  };
  return map[c][variant];
}

function reportStBadge(st: ReportSt): { text: string; cls: string } {
  if (st === "ontime")  return { text: "Вовремя",   cls: "bg-green-100 text-green-700" };
  if (st === "late")    return { text: "Просрочен", cls: "bg-red-100 text-red-700"    };
  if (st === "missing") return { text: "Не сдан",   cls: "bg-red-100 text-red-700"    };
  return                       { text: "Ожидается", cls: "bg-gray-100 text-gray-500"  };
}

// ── Цвет % выполнения месяца для Sell-In ──────────────────────────────────
function siMonthColor(pct: number, isFuture: boolean): string {
  if (isFuture) return "text-gray-300";
  if (pct >= 100) return "text-green-700";
  if (pct >= 70)  return "text-amber-600";
  return "text-red-600";
}
// ── Цвет % выполнения месяца для Sell-Out ─────────────────────────────────
function soMonthColor(pct: number, isFuture: boolean): string {
  if (isFuture) return "text-gray-300";
  if (pct >= 100) return "text-green-700";
  if (pct >= 90)  return "text-amber-600";
  return "text-red-600";
}
// ── Цвет строки «Итого» (фон) для Sell-In ─────────────────────────────────
function siTotalRowBg(pct: number, blocked: boolean): string {
  if (blocked) return "bg-red-50";
  if (pct >= 100) return "bg-green-50";
  if (pct >= 90)  return "bg-amber-50";
  return "bg-red-50";
}
// ── Цвет строки «Итого» для Sell-Out ──────────────────────────────────────
function soTotalRowBg(pct: number, blocked: boolean): string {
  if (blocked) return "bg-red-50";
  if (pct >= 100) return "bg-green-50";
  if (pct >= 90)  return "bg-amber-50";
  return "bg-red-50";
}
// ── Подсветка строки шкалы ────────────────────────────────────────────────
// threshold: 90 | 100 | 110 | 0 (0 = "<90%" row)
type ScaleHighlight = "achieved" | "current" | "next" | "normal";
function scaleRowHighlight(threshold: number, totalPct: number, blocked: boolean): ScaleHighlight {
  if (blocked) return "normal";
  if (threshold === 0) return totalPct < 90 ? "current" : "normal";
  if (totalPct >= threshold) return "achieved";
  // nearest unachieved
  if (threshold === 90  && totalPct < 90)               return "next";
  if (threshold === 100 && totalPct >= 90  && totalPct < 100) return "next";
  if (threshold === 110 && totalPct >= 100 && totalPct < 110) return "next";
  return "normal";
}
function scaleHighlightCls(h: ScaleHighlight): string {
  if (h === "achieved") return "bg-green-50";
  if (h === "current")  return "bg-blue-50";
  if (h === "next")     return "bg-amber-50";
  return "";
}
function scaleHighlightTextCls(h: ScaleHighlight): string {
  if (h === "achieved") return "text-green-700";
  if (h === "current")  return "text-blue-700";
  if (h === "next")     return "text-amber-700";
  return "text-gray-500";
}

// ── Вычисление «Осталось» для шкалы ──────────────────────────────────────
function remaining(threshold: number, totalFact: number, totalPlan: number): string {
  if (threshold === 0) return "текущий уровень";
  const target = Math.ceil(totalPlan * threshold / 100);
  const rem = target - totalFact;
  if (rem <= 0) return "✓ выполнен";
  return `${rem.toLocaleString()} шт`;
}

// ─── ДИНАМИЧЕСКИЕ РЕКОМЕНДАЦИИ ───────────────────────────────────────────────
interface Rec { type: "err" | "warn" | "star" | "ok" | "trophy" | "info"; text: string; }

function getSIRecs(monthIdx: number, months: MonthRow[], totalFact: number, totalPlan: number, blocked: boolean, scenarioId?: string, state?: PeriodState, earnedPct?: number, maxPct?: number): Rec[] {
  const apr = months[0]; const may = months[1];
  const totalPct = (totalFact / totalPlan) * 100;

  if (monthIdx === 1) {
    if (apr.pct < 70) {
      const rem = Math.max(0, Math.ceil(apr.plan * 0.7) - apr.fact);
      return [{ type: "warn", text: `⚠ Осталось ${rem} шт до 70% апреля. Иначе скидка Sell-In заблокируется` }];
    }
    if (apr.pct < 100) {
      return [{ type: "star", text: `⭐ Осталось ${apr.plan - apr.fact} шт до 100% плана апреля` }];
    }
    return [{ type: "ok", text: `✅ План апреля выполнен` }];
  }

  if (monthIdx === 2) {
    if (may.pct < 70) {
      const rem = Math.max(0, Math.ceil(may.plan * 0.7) - may.fact);
      return [{ type: "warn", text: `⚠ Осталось ${rem} шт до 70% мая. Иначе скидка Sell-In заблокируется` }];
    }
    if (apr.pct < 70) {
      return [{ type: "err",  text: `❌ Скидка Sell-In = 0%. Причина: апрель ниже 70%` }];
    }
    if (apr.pct >= 100 && may.pct >= 100) {
      return [{ type: "ok",   text: `✅ Два месяца выполнены. Можно идти на максимум квартала` }];
    }
    if (apr.pct < 100 && may.pct >= 100) {
      return [{ type: "ok",   text: `✅ План мая выполнен. В 3-м месяце нужен 100%+` }];
    }
    if (apr.pct < 100 && may.pct < 100) {
      return [{ type: "err",  text: `❌ Скидка Sell-In = 0%. Причина: 2 месяца ниже 100%` }];
    }
    return [{ type: "star", text: `⭐ Осталось ${may.plan - may.fact} шт до 100% плана мая` }];
  }

  if (monthIdx === 3) {
    if (blocked) {
      const reason = months.some(m => !m.isFuture && m.pct < 70) ? "есть месяц ниже 70%" : "2 месяца ниже 100%";
      return [{ type: "err", text: `❌ Скидка Sell-In = 0%. Причина: ${reason}` }];
    }
    if (totalPct >= 110) return [{ type: "trophy", text: `🏆 Максимальная скидка зафиксирована` }];
    if (totalPct >= 100) {
      const rem = Math.ceil(totalPlan * 1.1) - totalFact;
      return [{ type: "ok",    text: `✅ 🏆 Средняя скидка уже есть. Осталось ${rem} шт до максимума` }];
    }
    if (totalPct >= 90)  {
      const rem = totalPlan - totalFact;
      return [{ type: "ok",    text: `✅ ⭐ Минимальная скидка уже есть. Осталось ${rem} шт до следующей скидки` }];
    }
    const rem = Math.ceil(totalPlan * 0.9) - totalFact;
    return [{ type: "star",  text: `⭐ Осталось ${rem} шт до первой скидки (90% квартала)` }];
  }

  // after quarter
  const isEnhancedSI = scenarioId && ['s4','s5','s6','s7'].includes(scenarioId);
  if (isEnhancedSI) {
    if (blocked || totalPct < 90) {
      return [{ type: "err", text: `❌ План квартала выполнен менее 90%. Блок обнулён.` }];
    }
    const recs: Rec[] = [];
    if (totalPct >= 110) recs.push({ type: "star", text: `⭐ План выполнен более 110%.` });
    else if (totalPct >= 100) recs.push({ type: "star", text: `⭐ План выполнен более 100%.` });
    else recs.push({ type: "star", text: `⭐ План выполнен более 90%.` });
    if (state === 'closed_final' && earnedPct !== undefined && maxPct !== undefined) {
      recs.push({ type: "ok", text: `✅ Итоговая скидка по блоку установлена: ${earnedPct}% из ${maxPct}%.` });
    }
    return recs;
  }
  if (blocked) return [{ type: "err",  text: `❌ Скидка Sell-In = 0%. Квартал закрыт.` }];
  return [{ type: "ok", text: `✅ Квартал закрыт. Итоговый результат зафиксирован.` }];
}

function getSORecs(monthIdx: number, months: MonthRow[], totalFact: number, totalPlan: number, blocked: boolean, scenarioId?: string, state?: PeriodState, earnedPct?: number, maxPct?: number): Rec[] {
  const apr = months[0]; const may = months[1];
  const totalPct = (totalFact / totalPlan) * 100;

  if (monthIdx === 1) {
    if (apr.pct < 100) {
      return [{ type: "star", text: `⭐ Осталось ${apr.plan - apr.fact} шт до 100% плана апреля` }];
    }
    const surplus = Math.ceil(totalPlan * 1.1) - totalFact;
    return [{ type: "ok", text: `✅ ⭐ План апреля выполнен. Ещё ${surplus > 0 ? surplus : 0} шт создадут запас на квартал` }];
  }

  if (monthIdx === 2) {
    const twoMonthsBad = apr.pct < 100 && may.pct < 100;
    if (twoMonthsBad) {
      return [{ type: "err",  text: `❌ Скидка Sell-Out = 0%. Причина: 2 месяца ниже 100%` }];
    }
    if (apr.pct >= 100 && may.pct >= 100) {
      return [{ type: "ok",   text: `✅ Два месяца выполнены. Можно идти на максимум квартала` }];
    }
    if (apr.pct < 100 && may.pct >= 100) {
      return [{ type: "ok",   text: `✅ План мая выполнен. В 3-м месяце нужен 100%+` }];
    }
    return [{ type: "star", text: `⭐ Осталось ${may.plan - may.fact} шт до 100% плана мая` }];
  }

  if (monthIdx === 3) {
    if (blocked) {
      return [{ type: "err",   text: `❌ Скидка Sell-Out = 0%. Причина: 2 месяца ниже 100%` }];
    }
    if (totalPct >= 110) return [{ type: "trophy", text: `🏆 Максимальная скидка зафиксирована` }];
    if (totalPct >= 100) {
      const rem = Math.ceil(totalPlan * 1.1) - totalFact;
      return [{ type: "ok",    text: `✅ 🏆 Средняя скидка уже есть. Осталось ${rem} шт до максимума` }];
    }
    if (totalPct >= 90) {
      const rem = totalPlan - totalFact;
      return [{ type: "ok",    text: `✅ ⭐ Минимальная скидка уже есть. Осталось ${rem} шт до следующей скидки` }];
    }
    const rem = Math.ceil(totalPlan * 0.9) - totalFact;
    return [{ type: "star",  text: `⭐ Осталось ${rem} шт до минимальной скидки (90% квартала)` }];
  }

  const isEnhancedSO = scenarioId && ['s4','s5','s6','s7'].includes(scenarioId);
  if (isEnhancedSO) {
    if (blocked || totalPct < 90) {
      return [{ type: "err", text: `❌ План квартала выполнен менее 90%. Блок обнулён.` }];
    }
    const recs: Rec[] = [];
    if (totalPct >= 110) recs.push({ type: "star", text: `⭐ План выполнен более 110%.` });
    else if (totalPct >= 100) recs.push({ type: "star", text: `⭐ План выполнен более 100%.` });
    else recs.push({ type: "star", text: `⭐ План выполнен более 90%.` });
    if (state === 'closed_final' && earnedPct !== undefined && maxPct !== undefined) {
      recs.push({ type: "ok", text: `✅ Итоговая скидка по блоку установлена: ${earnedPct}% из ${maxPct}%.` });
    }
    return recs;
  }
  if (blocked) return [{ type: "err",  text: `❌ Скидка Sell-Out = 0%. Квартал закрыт.` }];
  return [{ type: "ok", text: `✅ Квартал закрыт. Итоговый результат зафиксирован.` }];
}

// ─── КОМПОНЕНТ РЕКОМЕНДАЦИИ ───────────────────────────────────────────────────
function RecRow({ rec }: { rec: Rec }) {
  const cls = {
    err:    "bg-red-50 border-red-200 text-red-800",
    warn:   "bg-amber-50 border-amber-200 text-amber-800",
    star:   "bg-blue-50 border-blue-200 text-blue-800",
    ok:     "bg-green-50 border-green-200 text-green-800",
    trophy: "bg-blue-50 border-blue-200 text-blue-900",
    info:   "bg-gray-50 border-gray-200 text-gray-700",
  }[rec.type];
  return (
    <div className={`px-4 py-2.5 rounded-2xl border text-sm font-medium ${cls}`}>
      {rec.text}
    </div>
  );
}

// ─── БЛОК SELL-IN (Блок 1) ────────────────────────────────────────────────────
interface PlanBlockProps {
  scenarioId: string;
  type: "si" | "so";
  months: MonthRow[];
  totalPlan: number;
  monthIdx: number;
  isPartner: boolean;
  isBlocked: boolean;
  earnedPct: number;
  maxDistribPct: number;
  maxPartnerPct: number;
  state: PeriodState;
  isOpen: boolean;
  onToggle: () => void;
}

function PlanBlock({ scenarioId, type, months, totalPlan, monthIdx, isPartner, isBlocked, earnedPct, maxDistribPct, maxPartnerPct, state, isOpen, onToggle }: PlanBlockProps) {
  const isSI = type === "si";
  const totalFact = months.reduce((s, m) => s + m.fact, 0);
  const totalPct  = totalPlan > 0 ? (totalFact / totalPlan) * 100 : 0;

  // Header data
  const activeMos = months.filter(m => !m.isFuture).length;
  const maxPct     = isPartner ? maxPartnerPct : maxDistribPct;
  const lostPct    = isBlocked ? maxPct : 0;
  const displayedDiscount = isBlocked ? 0 : earnedPct;

  // Status badge
  const isInProgress = state === "in_progress";
  let headerBadgeText = "";
  let headerBadgeColor: StatusColor = "gray";
  if (isBlocked) { headerBadgeText = "Заблокирован"; headerBadgeColor = "red"; }
  else if (displayedDiscount >= maxPct && maxPct > 0) { headerBadgeText = "Максимум"; headerBadgeColor = "green"; }
  else if (displayedDiscount > 0) { headerBadgeText = `+${displayedDiscount}%`; headerBadgeColor = isInProgress ? "yellow" : "green"; }
  else { headerBadgeText = "0%"; headerBadgeColor = "gray"; }

  // Рекомендации
  const recs = isSI
    ? getSIRecs(monthIdx, months, totalFact, totalPlan, isBlocked, scenarioId, state, displayedDiscount, maxPct)
    : getSORecs(monthIdx, months, totalFact, totalPlan, isBlocked, scenarioId, state, displayedDiscount, maxPct);

  // Scale rows [threshold, distrib%, partner%]
  const siScale = [[110, 3, 4], [100, 2, 3], [90, 0, 2], [0, 0, 0]];
  const soScale = [[110, 8, 10], [100, 6, 7], [90, 0, 3], [0, 0, 0]];
  const scaleRows = isSI ? siScale : soScale;

  // Color helpers
  const monthPctColor = (m: MonthRow) =>
    isSI ? siMonthColor(m.pct, m.isFuture) : soMonthColor(m.pct, m.isFuture);
  const totBg = isSI ? siTotalRowBg(totalPct, isBlocked) : soTotalRowBg(totalPct, isBlocked);
  const totColor = isBlocked || totalPct < 90 ? "text-red-700" : totalPct < 100 ? "text-amber-700" : "text-green-700";

  // Left accent + border color
  const accentCls = isBlocked ? "bg-red-300" : displayedDiscount >= maxPct && maxPct > 0 ? "bg-green-300" : displayedDiscount > 0 ? "bg-amber-300" : "bg-gray-200";
  const numBgCls  = isBlocked ? "bg-red-500" : displayedDiscount >= maxPct && maxPct > 0 ? "bg-green-600" : displayedDiscount > 0 ? "bg-amber-500" : "bg-gray-400";
  const borderCls = isBlocked ? "border-red-200" : displayedDiscount >= maxPct && maxPct > 0 ? "border-green-200" : "border-gray-200";

  // Discount badge label
  const discountLabel = state === "closed_final" ? "Начислено" : state === "closed_calc" ? "Расчётно" : "Прогноз";
  const discountBadge = isBlocked ? `${discountLabel} 0% из ${maxPct}%` : `${discountLabel} ${displayedDiscount}% из ${maxPct}%`;
  const discountBadgeColor: StatusColor = isBlocked ? "red" : displayedDiscount > 0 ? (state === "in_progress" ? "yellow" : "green") : "gray";

  // Rec text for header
  const recText = recs[0]?.text ?? "";

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden relative ${borderCls}`}>
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${accentCls}`} />

      {/* ── Заголовок ── */}
      <button onClick={onToggle} className="w-full flex items-center gap-3 pl-6 pr-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className={`w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${numBgCls}`}>
          {isSI ? "2" : "3"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              {isSI ? "Выполнение плана закупок (Sell-In)" : "Выполнение плана сбыта (Sell-Out)"}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorCls(headerBadgeColor, "badge")}`}>{headerBadgeText}</span>
          </div>
          {recText && <div className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">{recText}</div>}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0 hidden sm:block ${colorCls(discountBadgeColor, "badge")}`}>
          {discountBadge}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {/* ── Развёрнутое ── */}
      {isOpen && (
        <div className="pl-6 pr-4 pb-5 pt-1 border-t border-gray-100">

          {/* Два столбца: по месяцам + шкала */}
          <div className="flex gap-6 flex-wrap mt-3">
            {/* По месяцам */}
            <div className="flex-1 min-w-52 overflow-x-auto">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">По месяцам</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500">
                    <th className="text-left pb-2 pr-3 font-semibold">Месяц</th>
                    <th className="text-right pb-2 px-2 font-semibold">План, шт</th>
                    <th className="text-right pb-2 px-2 font-semibold">Факт, шт</th>
                    <th className="text-right pb-2 font-semibold">%</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((m, i) => (
                    <tr key={i} className={`border-t border-gray-50 ${m.isFuture ? "opacity-40" : ""}`}>
                      <td className="py-2.5 pr-3 text-gray-700 text-xs">{m.month}</td>
                      <td className="py-2.5 px-2 text-right text-gray-500 text-xs">{m.plan.toLocaleString("ru")}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-gray-900 text-xs">
                        {m.isFuture ? "—" : m.fact.toLocaleString("ru")}
                      </td>
                      <td className={`py-2.5 text-right font-bold text-xs ${monthPctColor(m)}`}>
                        {m.isFuture ? "—" : `${m.pct}%`}
                      </td>
                    </tr>
                  ))}
                  <tr className={`border-t-2 border-gray-200 ${totBg}`}>
                    <td className="py-2.5 pr-3 font-bold text-xs text-gray-900">Итого</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-xs text-gray-700">{totalPlan.toLocaleString("ru")}</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-xs text-gray-900">{totalFact.toLocaleString("ru")}</td>
                    <td className={`py-2.5 text-right font-black text-xs ${totColor}`}>{totalPct.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex flex-wrap gap-2 mt-2">
                {isSI ? (
                  <>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />≥ 100%</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />70–99%</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />&#60; 70%</span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />≥ 100%</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />90–99%</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />&#60; 90%</span>
                  </>
                )}
              </div>
            </div>

            {/* Шкала скидок */}
            <div className="min-w-44 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Шкала скидок</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500">
                    <th className="text-left pb-2 pr-2 font-semibold">Выполнение</th>
                    <th className={`text-center pb-2 px-2 font-semibold ${isPartner ? "text-gray-300" : ""}`}>Дистр.</th>
                    <th className={`text-center pb-2 px-2 font-semibold ${isPartner ? "text-green-700" : "text-gray-300"}`}>Партнёр</th>
                    <th className="text-right pb-2 font-semibold">Осталось</th>
                  </tr>
                </thead>
                <tbody>
                  {scaleRows.map(([thr, dist, part], i) => {
                    const h = scaleRowHighlight(thr, totalPct, isBlocked);
                    const rem = remaining(thr, totalFact, totalPlan);
                    const labels = ["≥ 110%", "≥ 100%", "≥ 90%", "< 90%"];
                    return (
                      <tr key={i} className={`border-t border-gray-50 ${scaleHighlightCls(h)}`}>
                        <td className={`py-2 pr-2 text-xs font-semibold ${scaleHighlightTextCls(h) || "text-gray-600"}`}>
                          <div className="flex items-center gap-1">
                            {labels[i]}
                            {h === "current"  && <span className="text-[10px] font-normal text-blue-600 bg-blue-100 px-1 py-0.5 rounded">сейчас</span>}
                            {h === "next"     && <span className="text-[10px] font-normal text-amber-600 bg-amber-100 px-1 py-0.5 rounded">цель</span>}
                            {h === "achieved" && <span className="text-green-600 text-[10px]">✓</span>}
                          </div>
                        </td>
                        <td className={`py-2 px-2 text-center text-xs font-bold ${isPartner ? "text-gray-300" : scaleHighlightTextCls(h) || "text-gray-600"}`}>{dist}%</td>
                        <td className={`py-2 px-2 text-center text-xs font-bold ${isPartner ? scaleHighlightTextCls(h) || "text-green-700" : "text-gray-300"}`}>{part}%</td>
                        <td className={`py-2 text-right text-xs ${rem === "✓ выполнен" ? "text-green-600 font-semibold" : rem === "текущий уровень" ? "text-blue-600 font-semibold" : "text-gray-600"}`}>{rem}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-green-400" />Достигнут</span>
                <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-blue-400" />Текущий</span>
                <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-400" />Цель</span>
              </div>
            </div>
          </div>

          {/* Рекомендации */}
          <div className="mt-4 space-y-1.5">
            {recs.map((r, i) => <RecRow key={i} rec={r} />)}
          </div>

          {/* Правило */}
          <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-2xl mt-3">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              {isSI
                ? "Правило: 1 мес. < 70% ИЛИ 2+ мес. < 100% → скидка Sell-In = 0%."
                : "Правило: 2+ мес. < 100% плана → скидка Sell-Out = 0%."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── БЛОК 5: ОТЧЁТНОСТЬ ─────────────────────────────────────────────────────
function getMonthCardStatus(reports: ReportEntry5[]): MonthCardStatus {
  const ss = reports.map(r => r.status);
  if (ss.every(s => s === "pending")) return "pending";
  if (ss.some(s => s === "missing")) return "missing";
  if (ss.some(s => s === "late")) return "late";
  if (ss.every(s => s === "ontime")) return "ontime";
  return "partial";
}
function monthCardBadge(st: MonthCardStatus): { text: string; bg: string; textCls: string } {
  if (st === "ontime")  return { text: "Вовремя",        bg: "bg-green-100", textCls: "text-green-700" };
  if (st === "late")    return { text: "Есть просрочка", bg: "bg-amber-100", textCls: "text-amber-700" };
  if (st === "missing") return { text: "Не сдан",        bg: "bg-red-100",   textCls: "text-red-700"   };
  if (st === "partial") return { text: "Частично сдано", bg: "bg-blue-100",  textCls: "text-blue-700"  };
  return                       { text: "Ожидается",      bg: "bg-gray-100",  textCls: "text-gray-500"  };
}
function reportEntryBadge(st: ReportStatus5): { text: string; cls: string } {
  if (st === "ontime")  return { text: "Вовремя",   cls: "bg-green-100 text-green-700" };
  if (st === "late")    return { text: "Просрочен", cls: "bg-amber-100 text-amber-700" };
  if (st === "missing") return { text: "Не сдан",   cls: "bg-red-100 text-red-700"    };
  return                       { text: "Ожидается", cls: "bg-gray-100 text-gray-500"  };
}

function ReportingBlock5({
  scenarioId, cislink, state, isOpen, onToggle,
}: {
  scenarioId: string; cislink: boolean; state: PeriodState; isOpen: boolean; onToggle: () => void;
}) {
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});
  const monthData = REPORT_BLOCK_DATA[scenarioId] ?? [];

  const allReports   = monthData.flatMap(m => m.reports);
  const onTimeCount  = allReports.filter(r => r.status === "ontime").length;
  const lateCount    = allReports.filter(r => r.status === "late").length;
  const missingCount = allReports.filter(r => r.status === "missing").length;
  const pendingCount = allReports.filter(r => r.status === "pending").length;

  const isClosed  = state !== "in_progress";
  const wouldEarn = cislink && missingCount === 0 && lateCount <= 2;
  const earnedPct = wouldEarn ? 1 : 0;

  // Ближайший дедлайн
  const nextPendingReport   = allReports.find(r => r.status === "pending");
  const nextDeadline        = nextPendingReport?.deadline ?? null;
  const pendingAtNext       = nextDeadline ? allReports.filter(r => r.status === "pending" && r.deadline === nextDeadline).length : 0;

  // Бейдж блока
  let blockBadgeText = ""; let blockBadgeColor: StatusColor = "gray";
  if (!cislink) { blockBadgeText = "CISLink откл."; blockBadgeColor = "red"; }
  else if (isClosed) {
    blockBadgeText = wouldEarn ? "Начислено +1%" : "0% — не начислено";
    blockBadgeColor = wouldEarn ? "green" : "red";
  } else {
    if (lateCount > 2 || missingCount > 0) { blockBadgeText = "Риск"; blockBadgeColor = lateCount > 2 ? "red" : "yellow"; }
    else if (onTimeCount > 0) { blockBadgeText = "В порядке"; blockBadgeColor = "green"; }
    else { blockBadgeText = "Ожидается"; blockBadgeColor = "gray"; }
  }

  // Приоритетный баннер (логика по ТЗ раздел 15)
  type BType = { type: "err" | "warn" | "ok" | "info"; text: string };
  let banner: BType;
  if (!cislink) {
    banner = { type: "err", text: "CISLink не подключён. Скидка +1% за отчётность недоступна." };
  } else if (isClosed && !wouldEarn && missingCount > 0) {
    banner = { type: "err", text: "Скидка за отчётность не начислена: не все отчёты сданы." };
  } else if (isClosed && !wouldEarn && lateCount > 2) {
    banner = { type: "err", text: "Скидка за отчётность не начислена: превышен лимит просрочек." };
  } else if (isClosed && wouldEarn) {
    banner = { type: "ok",  text: "Все отчёты сданы. Начислено +1% за отчётность." };
  } else if (lateCount > 2) {
    banner = { type: "err",  text: "Лимит просрочек превышен. Скидка за отчётность = 0%." };
  } else if (missingCount > 0) {
    banner = { type: "err",  text: "Есть несданные отчёты. Перейдите во вкладку «Отчётность», чтобы отправить данные." };
  } else if (lateCount === 2) {
    banner = { type: "warn", text: "Использовано 2 из 2 допустимых просрочек. Следующая просрочка приведёт к потере скидки." };
  } else if (lateCount === 1) {
    banner = { type: "warn", text: "Использовано 1 из 2 допустимых просрочек. Следующая просрочка повышает риск потери скидки." };
  } else if (nextDeadline) {
    banner = { type: "info", text: `CISLink подключён. Ближайший дедлайн: ${nextDeadline}. Осталось сдать ${pendingAtNext} отчёт${pendingAtNext > 1 ? "а" : ""}.` };
  } else {
    banner = { type: "ok",   text: "Блок в безопасной зоне." };
  }

  const bannerCls = { err: "bg-red-50 border-red-200 text-red-800", warn: "bg-amber-50 border-amber-200 text-amber-800", ok: "bg-green-50 border-green-200 text-green-800", info: "bg-blue-50 border-blue-200 text-blue-800" }[banner.type];
  const zoneText = lateCount > 2 ? "Лимит просрочек превышен" : missingCount > 0 ? "Требуется действие" : onTimeCount === 12 ? "Все отчёты сданы" : onTimeCount > 0 ? "Блок в безопасной зоне" : "Ожидается первый отчёт";
  const zoneCls  = lateCount > 2 || missingCount > 0 ? "bg-red-50 border-red-200 text-red-700" : onTimeCount > 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500";
  const borderCls = !cislink || blockBadgeColor === "red" ? "border-red-200" : blockBadgeColor === "yellow" ? "border-amber-200" : "border-gray-200";
  const numBg = blockBadgeColor === "green" ? "bg-green-600" : blockBadgeColor === "red" ? "bg-red-500" : blockBadgeColor === "yellow" ? "bg-amber-500" : "bg-gray-400";

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden ${borderCls}`}>

      {/* ── Кнопка-заголовок ── */}
      <button onClick={onToggle} className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${numBg}`}>6</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">Отчётность</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorCls(blockBadgeColor, "badge")}`}>{blockBadgeText}</span>
          </div>

        </div>
        {/* Метрики справа */}
        <div className="hidden lg:flex items-center gap-5 flex-shrink-0 mr-2">
          <div className="text-right">
            <p className="text-xs text-gray-400">{isClosed ? "Начислено" : "Прогноз"}</p>
            <p className={`text-sm font-black ${earnedPct > 0 ? "text-green-700" : "text-gray-400"}`}>
              {earnedPct}% <span className="font-normal text-xs text-gray-400">из 1%</span>
            </p>
          </div>
          {!cislink && <span className="text-xs font-bold text-red-600">−1% упущено</span>}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
      </button>

      {/* ── Свёрнутое: 4 KPI-чипа + баннер ── */}
      {!isOpen && (
        <div className="px-5 pb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${lateCount > 2 ? "bg-red-100 text-red-700 border-red-200" : lateCount > 0 ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200"}`}>
              Просрочек: {lateCount} из 2
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${missingCount > 0 ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
              Не сдано: {missingCount}
            </span>
            {pendingCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl border bg-gray-100 text-gray-600 border-gray-200">
                Осталось сдать: {pendingCount}
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl border bg-gray-100 text-gray-500 border-gray-200">
              {nextDeadline ? `Дедлайн: ${nextDeadline}` : "Все дедлайны прошли"}
            </span>
          </div>
          <div className={`px-3 py-2.5 rounded-2xl border text-xs font-medium ${bannerCls}`}>{banner.text}</div>
        </div>
      )}

      {/* ── Раскрытое содержимое ── */}
      {isOpen && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">

          {/* CISLink баннер */}
          {cislink ? (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl">
              <Wifi className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-green-800">CISLink подключё�� — автовыгрузка активна</span>
            </div>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
              <WifiOff className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">CISLink не подключён. Скидка +1% за отчётность недоступна.</p>
                <p className="text-xs text-red-600 mt-0.5">Перейдите во вкладку «Отчётность», чтобы подключить CISLink.</p>
                {onTimeCount > 0 && <p className="text-xs text-red-500 mt-1">Ручные отчёты отображаются для контроля. Для начисления скидки подключите CISLink.</p>}
              </div>
            </div>
          )}

          {/* Приоритетный баннер */}
          <div className={`flex items-start gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium ${bannerCls}`}>
            {banner.type === "err"  && <AlertCircle   className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600"   />}
            {banner.type === "warn" && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />}
            {banner.type === "ok"   && <CheckCircle   className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />}
            {banner.type === "info" && <Info          className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600"  />}
            <span>{banner.text}</span>
          </div>

          {/* Сводка квартала */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Сводка квартала</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { label: "Вовремя",   val: onTimeCount,  tot: "из 12", bg: onTimeCount > 0 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200", textCls: onTimeCount > 0 ? "text-green-700" : "text-gray-300" },
                { label: "Просрочено", val: lateCount,   tot: `лимит: 2`, bg: lateCount > 2 ? "bg-red-50 border-red-200" : lateCount > 0 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200", textCls: lateCount > 2 ? "text-red-700" : lateCount > 0 ? "text-amber-700" : "text-gray-300" },
                { label: "Ожидается", val: pendingCount, tot: "отчётов", bg: "bg-gray-50 border-gray-200", textCls: pendingCount > 0 ? "text-gray-700" : "text-gray-300" },
              ].map(c => (
                <div key={c.label} className={`rounded-2xl border p-3 ${c.bg}`}>
                  <p className="text-xs text-gray-400 mb-0.5">{c.label}</p>
                  <p className={`text-2xl font-black ${c.textCls}`}>{c.val}</p>
                  <p className="text-xs text-gray-400">{c.tot}</p>
                </div>
              ))}
            </div>
            <div className={`mt-2.5 px-4 py-2.5 rounded-2xl border text-xs font-semibold ${zoneCls}`}>
              {zoneText}{cislink ? " · Допустимый лимит просрочек: 2" : ""}
            </div>
          </div>

          {/* Карточки месяцев */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Отчёты по месяцам</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {monthData.map((md) => {
                const mst   = getMonthCardStatus(md.reports);
                const badge = monthCardBadge(mst);
                const isMonthOpen = !!openMonths[md.month];
                const mborder = mst === "missing" ? "border-red-200" : mst === "late" ? "border-amber-200" : mst === "ontime" ? "border-green-200" : "border-gray-200";
                const mheader = mst === "missing" ? "bg-red-50" : mst === "late" ? "bg-amber-50" : mst === "ontime" ? "bg-green-50" : "bg-gray-50";
                const doneCount = md.reports.filter(r => r.status !== "pending").length;
                return (
                  <div key={md.month} className={`rounded-2xl border overflow-hidden ${mborder}`}>
                    <button onClick={() => setOpenMonths(p => ({ ...p, [md.month]: !p[md.month] }))}
                      className={`w-full flex items-center justify-between px-3.5 py-3 ${mheader} hover:opacity-90 transition-opacity`}>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">{md.month} 2026</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${badge.bg} ${badge.textCls}`}>{badge.text}</span>
                      </div>
                      {isMonthOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {!isMonthOpen && (
                      <div className="px-3.5 py-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{doneCount} / 4 обработано</span>
                        <span className="text-xs text-blue-600 font-medium cursor-pointer"
                          onClick={() => setOpenMonths(p => ({ ...p, [md.month]: true }))}>
                          Показать отчёты ↓
                        </span>
                      </div>
                    )}

                    {isMonthOpen && (
                      <div className="divide-y divide-gray-100">
                        {md.reports.map((r, i) => {
                          const rb = reportEntryBadge(r.status);
                          return (
                            <div key={i} className={`px-3.5 py-2.5 ${r.status === "missing" ? "bg-red-50/40" : r.status === "late" ? "bg-amber-50/40" : ""}`}>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="text-xs text-gray-800 font-medium flex-1 leading-snug">{r.name}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 ${rb.cls}`}>{rb.text}</span>
                              </div>
                              <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5">
                                <span className="text-xs text-gray-400">Дедлайн: {r.deadline}</span>
                                {r.submittedDate && <span className="text-xs text-gray-500">Сдан: {r.submittedDate}</span>}
                                {r.status === "missing" && (
                                  <button className="text-xs font-semibold text-red-600 hover:text-red-700 ml-auto"
                                    onClick={() => alert("Переход во вкладку Отчётность")}>
                                    Сдать →
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex items-start gap-3 pt-1 border-t border-gray-100">
            <button onClick={() => alert("Переход во вкладку Отчётность")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-colors flex-shrink-0 ${!cislink ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
              Перейти в отчётность
            </button>
            {!cislink && (
              <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-2xl flex-1">
                <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Ручная загрузка отображается для контроля, но скидка +1% начисляется только при подключённом CISLink.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ─── БЛОК 4: СООТНОШЕНИЕ ЛИНЕЕК ЗАКУПОК (Sell-In) ────────────────────────────
type SIPeriod = "quarter" | "april" | "may" | "june";

function SILinesBlock({ s, isPartner, isOpen, onToggle }: { s: Scenario; isPartner: boolean; isOpen: boolean; onToggle: () => void }) {
  const state = s.state;
  const isBlocked = s.siLinesBlocked;
  const earned = s.siLinesEarned;
  const maxPct = isPartner ? 2 : 1;

  const [period, setPeriod] = useState<SIPeriod>("quarter");
  const [threshold, setThreshold] = useState<90 | 100 | 110>(100);

  // Current quarterly SI fulfilment %
  const totalSIFact = s.siMonths.filter(m => !m.isFuture).reduce((sum, m) => sum + m.fact, 0);
  const currentSIPct = totalSIFact / SI_TOTAL * 100;

  // Threshold options — hide already-achieved levels
  const thresholdOptions: Array<{ label: string; value: 90 | 100 | 110 }> = [
    ...(currentSIPct < 90  ? [{ label: "90%",  value: 90  as const }] : []),
    ...(currentSIPct < 100 ? [{ label: "100%", value: 100 as const }] : []),
    { label: "110%", value: 110 as const },
  ];
  const effectiveThreshold: 90 | 100 | 110 = thresholdOptions.find(o => o.value === threshold)?.value ?? thresholdOptions[thresholdOptions.length - 1].value;

  // Period plan total (base for per-line targets)
  const aprilPlan = s.siMonths[0]?.plan ?? SI_TOTAL;
  const mayPlan   = (s.siMonths[0]?.plan ?? 0) + (s.siMonths[1]?.plan ?? 0);
  const periodPlan = period === "april" ? aprilPlan : period === "may" ? mayPlan : SI_TOTAL;
  const thrFactor  = effectiveThreshold / 100;

  // Build rows using period-adjusted targets, single "До X%" column
  const rows = s.siLines.map(l => {
    const bought  = Math.round(l.fact / 100 * SI_TOTAL);
    const target  = l.lim / 100 * periodPlan;
    const toThr   = Math.max(Math.ceil(target * thrFactor) - bought, 0);
    const okMin   = !l.na && target > 0 && bought >= Math.ceil(target * 0.9);
    const okMax   = !l.na && target > 0 && bought >= Math.ceil(target * 1.1);
    return { name: l.name, lim: l.lim, na: l.na, bought, toThr, okMin, okMax, isOther: false };
  });

  const otherLimPct   = Math.max(0, 100 - s.siLines.reduce((sum, l) => sum + l.lim, 0));
  const sumLineBought = rows.reduce((sum, r) => sum + r.bought, 0);
  const otherBought   = Math.max(totalSIFact - sumLineBought, 0);
  const otherTarget   = otherLimPct / 100 * periodPlan;
  const otherToThr    = Math.max(Math.ceil(otherTarget * thrFactor) - otherBought, 0);
  const otherRow = {
    name: "Остальное", lim: otherLimPct, na: false, bought: otherBought, toThr: otherToThr,
    okMin: otherBought >= Math.ceil(otherTarget * 0.9), okMax: otherBought >= Math.ceil(otherTarget * 1.1), isOther: true,
  };

  const allRows  = [...rows, otherRow];
  const totBought = allRows.reduce((s, r) => s + r.bought, 0);
  const totToThr  = allRows.reduce((s, r) => s + r.toThr,  0);

  // Header badges
  const discountLabel = state === "closed_final" ? "Начислено" : state === "closed_calc" ? "Расчётно" : "Прогноз";
  const discountBadge = isBlocked ? `${discountLabel} 0% из ${maxPct}%` : `${discountLabel} ${earned}% из ${maxPct}%`;
  const discountBadgeColor: StatusColor = isBlocked ? "red" : earned > 0 ? (state === "in_progress" ? "yellow" : "green") : "gray";

  let statusText = ""; let statusColor: StatusColor = "gray";
  if (isBlocked)                          { statusText = "Заблокирован"; statusColor = "red"; }
  else if (earned >= maxPct && maxPct > 0) { statusText = "Максимум";    statusColor = "green"; }
  else if (earned > 0)                    { statusText = `+${earned}%`;  statusColor = state === "in_progress" ? "yellow" : "green"; }
  else                                    { statusText = "0%";           statusColor = "gray"; }

  const accentCls = isBlocked ? "bg-red-300" : earned >= maxPct && maxPct > 0 ? "bg-green-300" : earned > 0 ? "bg-amber-300" : "bg-gray-200";
  const numBgCls  = isBlocked ? "bg-red-500" : earned >= maxPct && maxPct > 0 ? "bg-green-600" : earned > 0 ? "bg-amber-500" : "bg-gray-400";
  const borderCls = isBlocked ? "border-red-200" : earned >= maxPct && maxPct > 0 ? "border-green-200" : "border-gray-200";

  const recType: Rec["type"] = isBlocked ? "err" : earned > 0 ? "ok" : "star";
  const rec: Rec = { type: recType, text: s.siLinesRec };

  const dotCls = (r: { okMax: boolean; okMin: boolean; na?: boolean; lim: number }) => {
    if (r.na || r.lim === 0) return "text-gray-300";
    if (r.okMax) return "text-green-600";
    if (r.okMin) return "text-amber-500";
    return "text-red-600";
  };

  // Column header: "До 100% · 5 000 шт"
  const thrTotal = Math.round(periodPlan * thrFactor);
  const thrColLabel = `До ${effectiveThreshold}% · ${thrTotal.toLocaleString("ru")} шт`;

  const selectCls = "px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400 appearance-none pr-7";

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden relative ${borderCls}`}>
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${accentCls}`} />

      <button onClick={onToggle} className="w-full flex items-center gap-3 pl-6 pr-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className={`w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${numBgCls}`}>4</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">Соотношение линеек закупок (Sell-In)</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorCls(statusColor, "badge")}`}>{statusText}</span>
          </div>
          {s.siLinesRec && <div className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">{s.siLinesRec}</div>}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0 hidden sm:block ${colorCls(discountBadgeColor, "badge")}`}>{discountBadge}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {isOpen && (
        <div className="pl-6 pr-4 pb-5 pt-1 border-t border-gray-100">
          {isBlocked && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl mt-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-xs text-red-800 font-medium">Квартальный Sell-In &lt;90% — скидка за линейки недоступна.</p>
            </div>
          )}

          {/* ── Фильтры ──────────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Выберите период</span>
              <div className="relative">
                <select value={period} onChange={e => setPeriod(e.target.value as SIPeriod)}
                  onClick={e => e.stopPropagation()} className={selectCls}>
                  <option value="quarter">Квартал</option>
                  <option value="april">Апрель</option>
                  <option value="may">Май</option>
                  <option value="june">Июнь</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Установить целевой порог</span>
              <div className="relative">
                <select value={effectiveThreshold}
                  onChange={e => setThreshold(Number(e.target.value) as 90 | 100 | 110)}
                  onClick={e => e.stopPropagation()} className={selectCls}>
                  {thresholdOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Таблица ───────────────────────────────────────────────────── */}
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs" style={{ minWidth: 380 }}>
              <thead>
                <tr className="border-b border-gray-200 text-gray-400">
                  <th className="text-left pb-2 pr-3 font-semibold">Линейка</th>
                  <th className="text-right pb-2 px-2 font-semibold">Цель, %</th>
                  <th className="text-right pb-2 px-2 font-semibold">Закуплено, шт</th>
                  <th className="text-right pb-2 font-semibold whitespace-nowrap">{thrColLabel}</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((r, i) => (
                  <tr key={i} className={`border-t border-gray-50 ${r.isOther ? "bg-gray-50 font-semibold" : ""}`}>
                    <td className="py-2 pr-3 text-gray-900">
                      <span className={`mr-1.5 ${dotCls(r)}`}>●</span>
                      {r.name}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-500">{r.lim > 0 ? `${r.lim.toFixed(1)}%` : "—"}</td>
                    <td className="py-2 px-2 text-right font-semibold text-gray-900">{r.bought.toLocaleString("ru")}</td>
                    <td className={`py-2 text-right ${r.toThr > 0 ? "text-amber-700 font-bold" : "text-green-600 font-bold"}`}>
                      {r.toThr > 0 ? r.toThr.toLocaleString("ru") : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 bg-gray-100 font-bold">
                  <td className="py-2.5 pr-3 text-gray-900">Итого</td>
                  <td className="py-2.5 px-2 text-right text-gray-500">100%</td>
                  <td className="py-2.5 px-2 text-right text-gray-900">{totBought.toLocaleString("ru")}</td>
                  <td className={`py-2.5 text-right ${totToThr > 0 ? "text-amber-700" : "text-green-600"}`}>
                    {totToThr > 0 ? totToThr.toLocaleString("ru") : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-xs text-gray-500">Размер скидки: 1% для статуса дистрибьютор, 2% для статуса партнёр</p>
          </div>
          <div className="mt-3 space-y-1.5">
            <RecRow rec={rec} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── БЛОК 5: СООТНОШЕНИЕ ЛИНЕЕК СБЫТА (Sell-Out) ─────────────────────────────
function SOLinesBlock({ s, isPartner, isOpen, onToggle }: { s: Scenario; isPartner: boolean; isOpen: boolean; onToggle: () => void }) {
  const state = s.state;
  const earned = s.soLinesEarned;
  const maxPct = isPartner ? 3 : 2;
  const isClosedFinal = state === "closed_final";

  const allOk    = s.soLines.every(l => l.ok);
  const failLines = s.soLines.filter(l => !l.ok);

  const discountLabel = state === "closed_final" ? "Начислено" : state === "closed_calc" ? "Расчётно" : "Прогноз";
  const discountBadge = `${discountLabel} ${earned}% из ${maxPct}%`;
  const discountBadgeColor: StatusColor = earned >= maxPct && maxPct > 0 ? (state === "in_progress" ? "yellow" : "green") : earned > 0 ? "yellow" : "gray";

  let statusText = ""; let statusColor: StatusColor = "gray";
  if (isClosedFinal && allOk)  { statusText = "Начислено"; statusColor = "green"; }
  else if (isClosedFinal)      { statusText = "Обнулён"; statusColor = "red"; }
  else if (allOk)              { statusText = "Выполнено"; statusColor = "green"; }
  else                         { statusText = failLines.length > 0 ? `${failLines.length} не вып.` : "Не выполнено"; statusColor = "yellow"; }

  const accentCls = isClosedFinal && !allOk ? "bg-red-300" : allOk ? "bg-green-300" : "bg-amber-200";
  const numBgCls  = isClosedFinal && !allOk ? "bg-red-500" : allOk ? "bg-green-600" : "bg-amber-500";
  const borderCls = isClosedFinal && !allOk ? "border-red-200" : allOk ? "border-green-200" : "border-gray-200";

  const recType: Rec["type"] = isClosedFinal && !allOk ? "err" : allOk ? "ok" : "star";
  const rec: Rec = { type: recType, text: s.soLinesRec };

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden relative ${borderCls}`}>
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${accentCls}`} />

      <button onClick={onToggle} className="w-full flex items-center gap-3 pl-6 pr-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className={`w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${numBgCls}`}>5</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">Соотношение линеек сбыта (Sell-Out)</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorCls(statusColor, "badge")}`}>{statusText}</span>
          </div>
          {s.soLinesRec && <div className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">{s.soLinesRec}</div>}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0 hidden sm:block ${colorCls(discountBadgeColor, "badge")}`}>{discountBadge}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {isOpen && (
        <div className="pl-6 pr-4 pb-5 pt-1 border-t border-gray-100">
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400">
                  <th className="text-left pb-2 pr-3 font-semibold">Линейка</th>
                  <th className="text-right pb-2 px-2 font-semibold">Цель</th>
                  <th className="text-right pb-2 px-2 font-semibold">Факт</th>
                  <th className="text-right pb-2 font-semibold">Осталось продать</th>
                </tr>
              </thead>
              <tbody>
                {s.soLines.map((l, i) => {
                  const factPct = SO_TOTAL > 0 ? (l.fact / SO_TOTAL * 100) : 0;
                  const rowBg = !l.ok ? (isClosedFinal ? "bg-red-50" : "bg-amber-50/50") : "";
                  return (
                    <tr key={i} className={`border-t border-gray-50 ${rowBg}`}>
                      <td className="py-2.5 pr-3 text-gray-900 font-medium">
                        <span className={`mr-1.5 ${l.ok ? "text-green-600" : "text-amber-500"}`}>●</span>
                        {l.name}
                      </td>
                      <td className="py-2.5 px-2 text-right text-gray-500">{l.lim}% / {l.plan.toLocaleString("ru")} шт</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-gray-900">{factPct.toFixed(1)}% / {l.fact.toLocaleString("ru")} шт</td>
                      <td className={`py-2.5 text-right font-bold ${l.remaining > 0 ? (isClosedFinal ? "text-red-600" : "text-amber-700") : "text-gray-300"}`}>
                        {l.remaining > 0 ? l.remaining.toLocaleString("ru") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-xs text-gray-500">Размер скидки: 2% для статуса дистрибьютор, 3% для статуса партнёр</p>
          </div>
          <div className="mt-3 space-y-1.5">
            <RecRow rec={rec} />
          </div>
          <div className="mt-3 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 border border-blue-200 text-xs font-semibold rounded-xl hover:bg-blue-50 transition-colors">
              <BarChart2 className="w-3.5 h-3.5" />
              Подробнее
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COLLAPSIBLE BLOCK (для блоков 3–7) ──────────────────────────────────────
interface CollapsibleBlockProps {
  num: number; title: string; subtitle: string;
  statusBadge: { text: string; color: StatusColor };
  discountBadge?: { text: string; color: StatusColor };
  earned: number | null; maxEarned: number;
  recommendation: string; recType: "ok" | "warn" | "err" | "trophy" | "info";
  isOpen: boolean; onToggle: () => void;
  isInfoBlock?: boolean;
  children: React.ReactNode;
}

function CollapsibleBlock({ num, title, subtitle, statusBadge, discountBadge, earned, maxEarned, recommendation, recType, isOpen, onToggle, isInfoBlock, children }: CollapsibleBlockProps) {
  const recCls = { ok: "bg-green-50 border-green-200 text-green-800", warn: "bg-amber-50 border-amber-200 text-amber-800", err: "bg-red-50 border-red-200 text-red-800", trophy: "bg-blue-50 border-blue-200 text-blue-900", info: "bg-gray-50 border-gray-200 text-gray-700" }[recType];
  const borderColor = statusBadge.color === "red" ? "border-red-200" : statusBadge.color === "yellow" ? "border-amber-200" : "border-gray-200";
  return (
    <div className={`bg-white rounded-3xl border overflow-hidden ${borderColor}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${statusBadge.color === "green" ? "bg-green-600" : statusBadge.color === "red" ? "bg-red-500" : statusBadge.color === "yellow" ? "bg-amber-500" : statusBadge.color === "blue" ? "bg-blue-500" : "bg-gray-400"}`}>{num}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{title}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorCls(statusBadge.color, "badge")}`}>{statusBadge.text}</span>
            {discountBadge && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-auto hidden sm:block ${colorCls(discountBadge.color, "badge")}`}>{discountBadge.text}</span>
            )}
            {!discountBadge && !isInfoBlock && earned !== null && <span className="text-xs text-gray-400 ml-auto hidden sm:block">Начислено: <span className={`font-bold ${earned > 0 ? "text-green-700" : "text-gray-400"}`}>{earned}%</span> из {maxEarned}%</span>}
            {isInfoBlock && !discountBadge && <span className="text-xs text-gray-400 ml-auto hidden sm:block">Информационный блок</span>}
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {!isOpen && <div className={`mx-4 mb-4 px-3 py-2 rounded-2xl border text-xs ${recCls}`}>{recommendation}</div>}
      {isOpen && <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">{children}</div>}
    </div>
  );
}

// ─── PARTNER BLOCK 1 SUB-COMPONENTS ─────────────────────────────────────────
type SubTone = "green" | "yellow" | "red" | "gray";

function subPal(tone: SubTone) {
  return {
    green:  { bg: "bg-green-50",  border: "border-green-200", text: "text-green-700" },
    yellow: { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-700" },
    red:    { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-700"   },
    gray:   { bg: "bg-gray-50",   border: "border-gray-200",  text: "text-gray-500"  },
  }[tone];
}

function PartnerSubBlock({
  num, title, status, tone, updatedAt, children,
}: {
  num: number; title: string; status: string; tone: SubTone; updatedAt?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const p = subPal(tone);
  return (
    <div className={`rounded-2xl border overflow-hidden ${p.bg} ${p.border}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <span className={`w-5 h-5 rounded-md border bg-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${p.border} ${p.text}`}>
          {num}
        </span>
        <span className="flex-1 text-sm font-semibold text-gray-900 min-w-0">{title}</span>
        {updatedAt && (
          <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">Обновлено: {updatedAt}</span>
        )}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white border flex-shrink-0 whitespace-nowrap ${p.border} ${p.text}`}>
          {status}
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className={`px-4 pb-4 pt-2 border-t ${p.border}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function ScoreScaleViz({ score, avgScore }: { score: number | null; avgScore: number }) {
  const display = score ?? avgScore;
  const markerPct = Math.min(display / 355 * 100, 100);
  const threshPct = 250 / 355 * 100; // ≈70.4%
  return (
    <div className="relative pt-9 pb-6 select-none">
      <div
        className="absolute top-0 text-xs text-gray-500 whitespace-nowrap"
        style={{ left: `${Math.min(Math.max(markerPct, 8), 85)}%`, transform: "translateX(-50%)" }}
      >
        {score === null
          ? <>Ср. за 4 кв. — <strong className="text-gray-900">{avgScore}</strong></>
          : <>Оценка квартала — <strong className="text-gray-900">{score}</strong></>}
      </div>
      <div className="relative h-12">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />
        {([{ pct: 0, label: "0" }, { pct: threshPct, label: "250" }, { pct: 100, label: "355" }] as const).map((t, i) => (
          <div key={i} className="absolute" style={{ left: `${t.pct}%`, transform: "translateX(-50%)" }}>
            <div className="w-px h-3.5 bg-orange-400 mt-1.5" />
            <div className="text-xs text-gray-500 font-semibold mt-1 text-center whitespace-nowrap">{t.label}</div>
          </div>
        ))}
        <div
          className="absolute top-1.5 w-4 h-4 rounded-full bg-white border-2 border-orange-400 shadow z-10"
          style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <div className="relative h-4 mt-1">
        <span className="absolute left-0 text-xs text-gray-400">дистрибьютор</span>
        <span className="absolute text-xs text-gray-400" style={{ left: `${threshPct}%` }}>партнёр</span>
      </div>
    </div>
  );
}

function SellOutBarViz({ fact, plan, pct }: { fact: number; plan: number; pct: number }) {
  const BAR_MAX = 110;
  const barW = Math.min(pct, BAR_MAX) / BAR_MAX * 100;
  const m90 = 90 / BAR_MAX * 100;
  const col = pct >= 90 ? "#16A34A" : "#DC2626";
  const need = Math.max(Math.round(plan * 0.9) - fact, 0);
  return (
    <div className="pt-1">
      <div className="relative h-5 mb-1">
        <span
          className="absolute text-xs font-bold whitespace-nowrap"
          style={{ left: `${Math.max(barW, 12)}%`, transform: "translateX(-50%)", color: col }}
        >
          {fact.toLocaleString("ru")} шт ({pct.toFixed(1).replace(".", ",")}%)
        </span>
        <span
          className="absolute text-xs text-gray-400 whitespace-nowrap"
          style={{ left: `${m90}%`, transform: "translateX(-50%)" }}
        >
          {Math.round(plan * 0.9).toLocaleString("ru")} шт (90%)
        </span>
      </div>
      <div className="relative h-3.5 mb-2">
        <div className="absolute inset-0 bg-gray-200 rounded-full" />
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ width: `${barW}%`, backgroundColor: col }}
        />
        <div
          className="absolute top-0 w-3.5 h-3.5 rounded-full bg-gray-700 border-2 border-white shadow z-10"
          style={{ left: `${m90}%`, transform: "translateX(-50%)" }}
        />
      </div>
      {need > 0 && (
        <p className="text-xs text-gray-600 mt-2">⭐ Осталось продать {need.toLocaleString("ru")} шт до 90% плана</p>
      )}
    </div>
  );
}

function SellOutLinesBarsViz({ lines }: { lines: Array<{ name: string; plan: number; fact: number }> }) {
  const BAR_MAX = 110;
  const m90 = 90 / BAR_MAX * 100;
  const failed = lines.filter(l => l.fact < Math.round(l.plan * 0.9));
  return (
    <div className="space-y-4 pt-1">
      {lines.map((line, i) => {
        const t90 = Math.round(line.plan * 0.9);
        const ok = line.fact >= t90;
        const pctOfPlan = line.plan > 0 ? line.fact / line.plan * 100 : 0;
        const barW = Math.min(pctOfPlan, BAR_MAX) / BAR_MAX * 100;
        const col = ok ? "#16A34A" : "#DC2626";
        const leftShort = Math.max(t90 - line.fact, 0);
        return (
          <div key={i}>
            <div className="text-sm font-bold text-gray-900 mb-2">{line.name}</div>
            <div className="relative h-5 mb-1">
              <span
                className="absolute text-xs font-bold whitespace-nowrap"
                style={{ left: `${Math.max(barW, 12)}%`, transform: "translateX(-50%)", color: col }}
              >
                {line.fact.toLocaleString("ru")} шт ({Math.round(pctOfPlan)}%)
              </span>
              <span
                className="absolute text-xs text-gray-400 whitespace-nowrap"
                style={{ left: `${m90}%`, transform: "translateX(-50%)" }}
              >
                {t90.toLocaleString("ru")} шт (90%)
              </span>
            </div>
            <div className="relative h-3.5 mb-1">
              <div className="absolute inset-0 bg-gray-200 rounded-full" />
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ width: `${barW}%`, backgroundColor: col }}
              />
              <div
                className="absolute top-0 w-3.5 h-3.5 rounded-full bg-gray-700 border-2 border-white shadow z-10"
                style={{ left: `${m90}%`, transform: "translateX(-50%)" }}
              />
            </div>
            <div className={`text-xs ${ok ? "text-green-700" : "text-red-600"}`}>
              {ok
                ? "Линейка выполнена"
                : `Не хватает до 90% · осталось ${leftShort.toLocaleString("ru")} шт`}
            </div>
          </div>
        );
      })}
      {failed.length > 0 && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <span className="text-sm flex-shrink-0">⭐</span>
          <span className="text-xs text-gray-700 leading-relaxed">
            Необходимо продать: {failed.map(l => `${l.name} — ${Math.max(Math.round(l.plan * 0.9) - l.fact, 0).toLocaleString("ru")} шт`).join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

function CISLinkCountersViz({
  onTime, total, deviations, waiting, cislinkStatus,
}: {
  onTime: number; total: number; deviations: number; waiting: number;
  cislinkStatus: "Подключён" | "Не подключён" | "Отклонение";
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
      <div className="p-3 rounded-xl bg-white border border-green-200">
        <div className="text-xs font-bold text-green-700 mb-1">Вовремя</div>
        <div className="text-2xl font-black text-green-700 leading-none">{onTime}</div>
        <div className="text-xs text-gray-400 mt-1">из {total}</div>
      </div>
      <div className="p-3 rounded-xl bg-white border border-gray-200">
        <div className={`text-xs font-bold mb-1 ${deviations > 0 ? "text-red-600" : "text-gray-500"}`}>Отклонений</div>
        <div className={`text-2xl font-black leading-none ${deviations > 0 ? "text-red-600" : "text-gray-800"}`}>{deviations}</div>
        <div className="text-xs text-gray-400 mt-1">лимит: 2</div>
      </div>
      <div className="p-3 rounded-xl bg-white border border-gray-200">
        <div className="text-xs font-bold text-gray-500 mb-1">Ожидается</div>
        <div className="text-2xl font-black text-gray-800 leading-none">{waiting}</div>
        <div className="text-xs text-gray-400 mt-1">отчётов</div>
      </div>
      <div className="p-3 rounded-xl bg-white border border-gray-200 flex flex-col gap-1.5">
        <div className="text-xs font-bold text-gray-500">Статус CISLink</div>
        <span className={`self-start inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold ${
          cislinkStatus === "Подключён"    ? "bg-green-100 text-green-700" :
          cislinkStatus === "Не подключён" ? "bg-red-100 text-red-700"   :
                                             "bg-amber-100 text-amber-700"
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
          {cislinkStatus}
        </span>
      </div>
    </div>
  );
}

function PartnerBlock1({ s, isOpen, onToggle }: { s: Scenario; isOpen: boolean; onToggle: () => void }) {
  const isClosed = s.state !== "in_progress";

  // Sub 1 — Лист оценки
  const scoreIsNull = s.criteria.score.color === "gray";
  const scoreNum    = parseInt(s.criteria.score.value); // "270 баллов (ср.)" → 270
  const scoreOk     = !scoreIsNull && scoreNum >= 250;
  const scoreTone: SubTone  = scoreIsNull ? "gray" : scoreOk ? "green" : "red";
  const scoreStatus = scoreIsNull ? "ожидается" : scoreOk ? "выполнен" : "не выполнен";

  // Sub 2 — Sell-Out BDO
  const soFact = s.soMonths.filter(m => !m.isFuture).reduce((sum, m) => sum + m.fact, 0);
  const soPct  = soFact / SO_TOTAL * 100;
  let soStatus: string; let soTone: SubTone;
  if (soPct >= 90)  { soStatus = "выполнен";    soTone = "green";  }
  else if (isClosed){ soStatus = "не выполнен"; soTone = "red";    }
  else               { soStatus = "в процессе"; soTone = "yellow"; }

  // Sub 3 — Линейки сбыта (90% partner threshold)
  const earlyData  = s.monthIdx === 1;
  const linesOk90  = !earlyData && s.soLines.every(l => l.fact >= Math.round(l.plan * 0.9));
  let linesStatus: string; let linesTone: SubTone;
  if (earlyData)     { linesStatus = "мало данных";  linesTone = "gray";   }
  else if (linesOk90){ linesStatus = "выполнен";     linesTone = "green";  }
  else if (isClosed) { linesStatus = "не выполнен";  linesTone = "red";    }
  else               { linesStatus = "в процессе";   linesTone = "yellow"; }

  // Sub 4 — CISLink / отчётность
  const allReports    = REPORT_BLOCK_DATA[s.id]?.flatMap(m => m.reports) ?? [];
  const onTimeCount   = allReports.filter(r => r.status === "ontime").length;
  const deviations    = allReports.filter(r => r.status === "late" || r.status === "missing").length;
  const waitingCount  = allReports.filter(r => r.status === "pending").length;
  const cislinkOk     = s.cislink && deviations <= 2;
  const cislinkStatus = (!s.cislink ? "Не подключён" : deviations > 2 ? "Отклонение" : "Подключён") as "Подключён" | "Не подключён" | "Отклонение";
  const cislinkTone: SubTone  = cislinkOk ? "green" : "red";
  const cislinkSubSt  = cislinkOk ? "в порядке" : !s.cislink ? "не подключён" : "отклонение";

  // Header
  const issueCount   = [scoreTone, soTone, linesTone, cislinkTone].filter(t => t !== "green").length;
  const statusLabel  = { partner: "Партнёр", distributor: "Дистрибьютор", preliminary: "Предварительно" }[s.partnerResult];
  const partnerColor: StatusColor = s.partnerResult === "partner" ? "green" : s.partnerResult === "preliminary" ? "gray" : "red";
  const recText = s.partnerResult === "partner"
    ? "✅ Статус «Партнёр» подтверждён — повышенные ставки во всех блоках"
    : `Условий до статуса «Партнёр»: ${issueCount} из 4. Доступны базовые ставки`;
  const recCls = s.partnerResult === "partner"
    ? "bg-green-50 border-green-200 text-green-800"
    : s.partnerResult === "preliminary"
    ? "bg-blue-50 border-blue-200 text-blue-800"
    : "bg-red-50 border-red-200 text-red-800";
  const borderCls  = partnerColor === "green" ? "border-green-200" : partnerColor === "red" ? "border-red-200" : "border-gray-200";
  const accentCls  = partnerColor === "green" ? "bg-green-300"   : partnerColor === "red" ? "bg-red-300"   : "bg-gray-200";
  const numBg      = partnerColor === "green" ? "bg-green-600"   : partnerColor === "red" ? "bg-red-500"   : "bg-gray-400";

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden relative ${borderCls}`}>
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${accentCls}`} />

      <button onClick={onToggle} className="w-full flex items-center gap-3 pl-6 pr-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${numBg}`}>1</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">Статус партнёр/дистрибьютор</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorCls(partnerColor, "badge")}`}>{statusLabel}</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">{recText}</div>
        </div>
        {s.partnerResult === "partner" && (
          <span className="text-xs font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0 hidden sm:block bg-green-100 text-green-700 border border-green-200">
            Множитель скидок
          </span>
        )}
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {isOpen && (
        <div className="pl-6 pr-4 pb-5 pt-1 border-t border-gray-100 space-y-2">
          <PartnerSubBlock num={1} title="Лист оценки" status={scoreStatus} tone={scoreTone}
            updatedAt={["s6", "s7"].includes(s.id) ? "03.07.2026 15:13" : undefined}>
            <ScoreScaleViz score={scoreIsNull ? null : scoreNum} avgScore={270} />
          </PartnerSubBlock>

          <PartnerSubBlock num={2} title="Выполнение плана сбыта (Sell-Out)" status={soStatus} tone={soTone}>
            <SellOutBarViz fact={soFact} plan={SO_TOTAL} pct={soPct} />
          </PartnerSubBlock>

          <PartnerSubBlock num={3} title="Соотношение линеек сбыта (Sell-Out)" status={linesStatus} tone={linesTone}>
            {earlyData
              ? <p className="text-xs text-gray-400 py-2">Недостаточно данных для оценки линеек.</p>
              : <SellOutLinesBarsViz lines={s.soLines} />}
          </PartnerSubBlock>

          <PartnerSubBlock num={4} title="Автоматическая отчётность CISLink" status={cislinkSubSt} tone={cislinkTone}>
            <CISLinkCountersViz
              onTime={onTimeCount} total={12}
              deviations={deviations} waiting={waitingCount}
              cislinkStatus={cislinkStatus}
            />
          </PartnerSubBlock>
        </div>
      )}
    </div>
  );
}

// ─── ДАННЫЕ КВАРТАЛОВ ────────────────────────────────────────────────────────
const QUARTERS_LIST = [
  { id: "q2_2026", label: "Q2 2026", sublabel: "май",  isCurrent: true,  finalDiscount: null },
  { id: "q1_2026", label: "Q1 2026", sublabel: "17%",  isCurrent: false, finalDiscount: 17   },
  { id: "q4_2025", label: "Q4 2025", sublabel: "15%",  isCurrent: false, finalDiscount: 15   },
  { id: "q3_2025", label: "Q3 2025", sublabel: "12%",  isCurrent: false, finalDiscount: 12   },
];

// ─── ГЛАВНЫЙ КОМПОНЕНТ ───────────────────────────────────────────────────────
export function QuarterlyDiscount() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [openBlocks, setOpenBlocks] = useState<Record<number, boolean>>({});
  const [prevScenId, setPrevScenId] = useState<string>("");
  const [quarterIdx, setQuarterIdx] = useState(0);

  const s = SCENARIOS[scenarioIdx];
  const activeQuarter = QUARTERS_LIST[quarterIdx];

  // При смене сценария — все блоки закрыты
  if (s.id !== prevScenId) {
    setOpenBlocks({});
    setPrevScenId(s.id);
  }
  const toggleBlock = (n: number) => setOpenBlocks(prev => ({ ...prev, [n]: !prev[n] }));

  const isInProgress  = s.state === "in_progress";
  const isClosedCalc  = s.state === "closed_calc";
  const isClosedFinal = s.state === "closed_final";
  const isPartner     = s.partnerResult === "partner";

  const totalEarned = s.siEarned + s.soEarned + s.siLinesEarned + s.soLinesEarned + s.reportEarned;


  return (
    <div className="space-y-5">

      {/* ── Заголовок ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200 px-5 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Квартальная скидка</h1>
    
      </div>

      {/* ── Переключатель кварталов ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {QUARTERS_LIST.map((q, qi) => (
            <button key={q.id}
              onClick={() => { setQuarterIdx(qi); if (!q.isCurrent) setScenarioIdx(5); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold transition-all border ${
                quarterIdx === qi
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700"
              }`}>
              <span>{q.label}</span>
              <span className={`text-xs font-normal ${quarterIdx === qi ? "text-blue-100" : q.isCurrent ? "text-gray-400" : "text-green-600 font-semibold"}`}>
                · {q.sublabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Исторический квартал — итоговая скидка ─────────────────────── */}
      {!activeQuarter.isCurrent && (
        <div className="bg-blue-600 rounded-3xl p-5 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <p className="text-blue-100 text-xs font-medium mb-1">{activeQuarter.label} — итоговая скидка</p>
          <div className="text-5xl font-black">{activeQuarter.finalDiscount}%</div>
          <p className="text-blue-200 text-xs mt-2">Квартал завершён. Итоговая скидка зафиксирована.</p>
        </div>
      )}

      {/* ── Переключатель сценариев (только для текущего квартала) ───────── */}
      {activeQuarter.isCurrent && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex-shrink-0">Прототип · сценарии:</span>
            {SCENARIOS.map((sc, idx) => (
              <button key={sc.id} onClick={() => setScenarioIdx(idx)}
                className={`px-3 py-1 rounded-2xl text-xs font-semibold transition-all ${scenarioIdx === idx ? "bg-indigo-600 text-white" : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100"}`}>
                {sc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ТЕКУЩИЙ КВАРТАЛ — все блоки видны только для activeQuarter.isCurrent
      ═══════════════════════════════════════════════════════════════ */}
      {activeQuarter.isCurrent && <>

      {/* ── KPI: во время квартала ─────────────────────────────────────── */}
      {isInProgress && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-600 rounded-3xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <p className="text-blue-100 text-xs font-medium mb-1">Прогноз скидки</p>
            <div className="text-5xl font-black">{s.forecastDiscount}%</div>
            {totalEarned > 0 && <p className="text-blue-200 text-xs mt-2">SI {s.siEarned}% + SO {s.soEarned}% + Лин.SI {s.siLinesEarned}% + Лин.SO {s.soLinesEarned}% + Отч. {s.reportEarned}%</p>}
            {totalEarned === 0 && <p className="text-blue-200 text-xs mt-2">Недостаточно данных для прогноза</p>}
          </div>
          <div className={`rounded-3xl p-5 border ${(s.growthPotential ?? 0) > 0 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
            <p className="text-xs text-gray-400 font-medium mb-1">Потенциал роста</p>
            <div className={`text-5xl font-black ${(s.growthPotential ?? 0) > 0 ? "text-amber-600" : "text-gray-300"}`}>+{s.growthPotential}%</div>
            <p className="text-xs text-gray-400 mt-2">До максимума 20% (Партнёр)</p>
          </div>
        </div>
      )}

      {/* ── KPI: по��ле квартала ────────────────────────────────────────── */}
      {(isClosedCalc || isClosedFinal) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5">
            <p className="text-xs text-gray-400 font-medium mb-1">Расчётная скидка</p>
            <div className="text-5xl font-black text-gray-700">{s.calcDiscount}%</div>
            <p className="text-xs text-gray-400 mt-2">{isClosedCalc ? "Ожидается подтверждение отделом продаж." : "Расчётная скидка зафиксирована."}</p>
          </div>
          <div className={`rounded-3xl p-5 border relative overflow-hidden ${isClosedFinal && s.finalDiscount ? "bg-blue-600 border-blue-700" : "bg-white border-gray-200"}`}>
            {isClosedFinal && s.finalDiscount && <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />}
            <p className={`text-xs font-medium mb-1 ${isClosedFinal && s.finalDiscount ? "text-blue-100" : "text-gray-400"}`}>Итоговая скидка</p>
            <div className={`text-5xl font-black ${isClosedFinal && s.finalDiscount ? "text-white" : "text-gray-300"}`}>{isClosedCalc ? "⌛" : s.finalDiscount ? `${s.finalDiscount}%` : "⌛"}</div>
            {isClosedFinal && s.finalOverridden && <p className="text-blue-100 text-xs mt-2">Скорректирована отделом продаж</p>}
            {s.id === "s6" && <p className="text-gray-400 text-xs mt-2">Ожидается 09.07.2026</p>}
            {s.id === "s7" && <p className="text-blue-200 text-xs mt-2">Обновлено: 09.07.2026 15:12</p>}
          </div>
        </div>
      )}

      {/* ── Блок 1: Статус партнёр/дистрибьютор ───────────────────────── */}
      <PartnerBlock1 s={s} isOpen={!!openBlocks[1]} onToggle={() => toggleBlock(1)} />

      {/* ── Блок 2: Выполнение плана закупок (Sell-In) ─────────────────── */}
      <PlanBlock
        scenarioId={s.id}
        type="si"
        months={s.siMonths}
        totalPlan={SI_TOTAL}
        monthIdx={s.monthIdx}
        isPartner={isPartner}
        isBlocked={s.siBlocked}
        earnedPct={s.siEarned}
        maxDistribPct={3}
        maxPartnerPct={4}
        state={s.state}
        isOpen={!!openBlocks[2]}
        onToggle={() => toggleBlock(2)}
      />

      {/* ── Блок 3: Выполнение плана сбыта (Sell-Out) ──────────────────── */}
      <PlanBlock
        scenarioId={s.id}
        type="so"
        months={s.soMonths}
        totalPlan={SO_TOTAL}
        monthIdx={s.monthIdx}
        isPartner={isPartner}
        isBlocked={s.soBlocked}
        earnedPct={s.soEarned}
        maxDistribPct={8}
        maxPartnerPct={10}
        state={s.state}
        isOpen={!!openBlocks[3]}
        onToggle={() => toggleBlock(3)}
      />

      {/* ── Блок 4: Соотношение линеек закупок (Sell-In) ───────────────── */}
      <SILinesBlock s={s} isPartner={isPartner} isOpen={!!openBlocks[4]} onToggle={() => toggleBlock(4)} />

      {/* ── Блок 5: Соотношение линеек сбыта (Sell-Out) ────────────────── */}
      <SOLinesBlock s={s} isPartner={isPartner} isOpen={!!openBlocks[5]} onToggle={() => toggleBlock(5)} />

      {/* ── Блок 6: Отчётность ─────────────────────────────────────────── */}
      <ReportingBlock5
        scenarioId={s.id}
        cislink={s.cislink}
        state={s.state}
        isOpen={!!openBlocks[6]}
        onToggle={() => toggleBlock(6)}
      />

      {/* ── Блок 7: Мониторинг каналов сбыта ───────────────────────────── */}
      <CollapsibleBlock num={7} title="Мониторинг каналов сбыта" subtitle=""
        statusBadge={{ text: s.channelsSt === "green" ? "Норма" : s.channelsSt === "red" ? "Риск штрафа" : "Нет данных", color: s.channelsSt }}
        earned={null} maxEarned={0}
        recommendation={s.channelsNote} recType={s.channelsSt === "green" ? "ok" : s.channelsSt === "red" ? "warn" : "info"}
        isOpen={!!openBlocks[7]} onToggle={() => toggleBlock(7)} isInfoBlock>
        {s.b2c > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[{ label: "B2C (клиники)", value: s.b2c, color: "green" as StatusColor }, { label: "B2B (прочие юрлица)", value: s.b2b, color: "yellow" as StatusColor }, { label: "Физлица / без ИНН", value: s.phys, color: (s.phys > 10 ? "red" : "gray") as StatusColor }].map(ch => (
                <div key={ch.label} className={`rounded-2xl border p-4 ${colorCls(ch.color, "bg")} ${colorCls(ch.color, "border")}`}>
                  <p className="text-xs text-gray-400 mb-1">{ch.label}</p>
                  <p className={`text-2xl font-black ${colorCls(ch.color, "text")}`}>{ch.value}%</p>
                  <div className="h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden"><div className={`h-full rounded-full ${ch.color === "green" ? "bg-green-500" : ch.color === "yellow" ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${ch.value}%` }} /></div>
                </div>
              ))}
            </div>
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${colorCls(s.channelsSt, "bg")} ${colorCls(s.channelsSt, "border")}`}>
              {s.channelsSt === "green" ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
              <p className={`text-sm font-semibold ${colorCls(s.channelsSt, "text")}`}>Непрямые (B2B + физлица): {s.b2b + s.phys}%{s.channelsSt === "green" ? " — норма (≤ 35%)" : " — риск штрафа (> 40%)"}</p>
            </div>
          </div>
        ) : <div className="p-4 bg-gray-50 rounded-2xl text-center text-gray-400 text-sm">Недостаточно данных</div>}
      </CollapsibleBlock>

      {/* ── Блок 8: Мониторинг складских запасов ───────────────────────── */}
      {/* Обёртка-IIFE для локальных вычислений */}
      {(() => {
        const blockCoverage = parseFloat((s.stock / s.avgMo).toFixed(1));
        const isDeficit8    = blockCoverage < 2;
        const deficitQty    = isDeficit8 ? Math.ceil(2 * s.avgMo - s.stock) : 0;
        const SCALE_MAX8    = 5;
        const markerPct8    = `${(Math.min(blockCoverage / SCALE_MAX8, 0.97) * 100).toFixed(1)}%`;
        const t1pct8        = (2 / SCALE_MAX8 * 100).toFixed(1); // 40%
        return (
        <CollapsibleBlock num={8} title="Мониторинг складских запасов" subtitle=""
          statusBadge={{ text: isDeficit8 ? `${blockCoverage} мес. — дефицит` : `${blockCoverage} мес. — норма`, color: isDeficit8 ? "red" : "green" }}
          earned={null} maxEarned={0}
          recommendation={isDeficit8 ? `Покрытие ${blockCoverage} мес. — не хватает ${deficitQty.toLocaleString()} шт. до нормы` : `Покрытие ${blockCoverage} мес. — запас в норме`}
          recType={isDeficit8 ? "warn" : "ok"}
          isOpen={!!openBlocks[8]} onToggle={() => toggleBlock(8)} isInfoBlock>
        {/* 3 KPI-карточки */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">Остаток на складе</p>
            <p className="text-xl font-bold text-gray-900">{s.stock.toLocaleString()}</p>
            <p className="text-xs text-gray-400">шт.</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">Среднемесячные продажи за 3 мес.</p>
            <p className="text-xl font-bold text-gray-900">{s.avgMo.toLocaleString()}</p>
            <p className="text-xs text-gray-400">шт./мес.</p>
          </div>
          <div className={`rounded-2xl p-4 border ${isDeficit8 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <p className="text-xs text-gray-400 mb-1">Покрытие</p>
            <p className={`text-xl font-bold ${isDeficit8 ? "text-red-700" : "text-green-700"}`}>{blockCoverage} мес.</p>
            <p className={`text-xs font-semibold ${isDeficit8 ? "text-red-600" : "text-green-600"}`}>{isDeficit8 ? "Дефицит" : "Норма"}</p>
          </div>
        </div>

        {/* Алерт дефицита */}
        {isDeficit8 && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">До нормы не хватает {deficitQty.toLocaleString()} шт.</p>
              <p className="text-xs text-red-600 mt-0.5">
                Для покрытия ≥ 2 мес. необходимо иметь на складе не менее {(2 * s.avgMo).toLocaleString()} шт.
              </p>
            </div>
          </div>
        )}

        {/* Визуальная шкала — 2 зоны */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Шкала покрытия склада</p>
            <span className="text-xs text-gray-400 hidden sm:block">Остаток ÷ ср. продажи за 3 мес.</span>
          </div>

          {/* Бабл над маркером */}
          <div className="relative h-9">
            <div
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: markerPct8, transform: "translateX(-50%)" }}
            >
              <div className={`px-2.5 py-1 rounded-xl text-xs font-black text-white shadow-sm whitespace-nowrap ${isDeficit8 ? "bg-red-500" : "bg-green-500"}`}>
                {blockCoverage} мес.
              </div>
              <div className={`w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent ${isDeficit8 ? "border-t-red-500" : "border-t-green-500"}`} />
            </div>
          </div>

          {/* Полоса шкалы */}
          <div className="relative">
            <div className="flex h-8 rounded-2xl overflow-hidden">
              <div
                className={`flex items-center justify-center transition-colors ${isDeficit8 ? "bg-red-400" : "bg-red-100"}`}
                style={{ width: `${t1pct8}%` }}
              >
                <span className={`text-xs font-semibold px-2 truncate ${isDeficit8 ? "text-white" : "text-red-300"}`}>Дефицит</span>
              </div>
              <div className={`flex-1 flex items-center justify-center transition-colors ${isDeficit8 ? "bg-green-100" : "bg-green-400"}`}>
                <span className={`text-xs font-semibold px-2 truncate ${isDeficit8 ? "text-green-300" : "text-white"}`}>Норма</span>
              </div>
            </div>
            {/* Иголка-маркер */}
            <div
              className={`absolute top-0 bottom-0 w-0.5 rounded-full pointer-events-none ${isDeficit8 ? "bg-red-700" : "bg-green-700"}`}
              style={{ left: markerPct8, transform: "translateX(-50%)" }}
            />
            {/* Разделитель зон */}
            <div className="absolute top-0 bottom-0 w-px bg-white/80 pointer-events-none" style={{ left: `${t1pct8}%` }} />
          </div>

          {/* Ось значений */}
          <div className="relative h-4">
            <span className="absolute left-0 text-xs text-gray-400">0</span>
            <span className="absolute text-xs text-gray-600 font-semibold" style={{ left: `${t1pct8}%`, transform: "translateX(-50%)" }}>2 мес.</span>
            <span className="absolute right-0 text-xs text-gray-400">5+ мес.</span>
          </div>

          {/* Легенда зон */}
          <div className="flex gap-2 flex-wrap">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${isDeficit8 ? "bg-red-100 border-red-200 text-red-700 ring-2 ring-offset-1 ring-red-400" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isDeficit8 ? "bg-red-400" : "bg-gray-300"}`} />
              <span>Дефицит</span>
              <span className="opacity-60">&lt; 2 мес.</span>
              {isDeficit8 && <span className="font-bold">← сейчас</span>}
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${!isDeficit8 ? "bg-green-100 border-green-200 text-green-700 ring-2 ring-offset-1 ring-green-400" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${!isDeficit8 ? "bg-green-400" : "bg-gray-300"}`} />
              <span>Норма</span>
              <span className="opacity-60">≥ 2 мес.</span>
              {!isDeficit8 && <span className="font-bold">← сейчас</span>}
            </div>
          </div>

          {/* Итоговая строка */}
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border ${isDeficit8 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isDeficit8 ? "bg-red-500" : "bg-green-500"}`} />
            <span className={`text-sm font-semibold ${isDeficit8 ? "text-red-700" : "text-green-700"}`}>{isDeficit8 ? "Дефицит" : "Норма"}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">
              {isDeficit8 ? "Запас менее 2 месяцев — требуется пополнение" : "Запас соответствует норме (≥ 2 месяцев)"}
            </span>
          </div>
        </div>

      </CollapsibleBlock>
        );
      })()}

 

      </>}

    </div>
  );
}
