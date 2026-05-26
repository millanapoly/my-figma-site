import { useState } from "react";
import { Download, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

// ─── Типы ─────────────────────────────────────────────────────────────────────
type ScenarioKey = "c5" | "c3" | "c2";

interface MonthData { month: string; plan: number; fact: number; pct: number; status: "ok" | "risk" | "blocked" | "nodata"; }
interface LineData  { name: string; limitPct: number; minQty: number; fact: number; share: number; status: "ok" | "fail"; remaining: number; }
interface SoLineData { name: string; limitPct: number; partnerThreshold: number; fact: number; share: number; status: "ok" | "fail"; }

// ─── Данные сценариев ─────────────────────────────────────────────────────────
const QUARTER_PLANS = { sellIn: 4617, sellOut: 5000 };

interface ScenarioData {
  name: string;
  month: string;
  siMonths: MonthData[];
  siFact: number;
  siEarned: number;
  siMax: number;
  soMonths: MonthData[];
  soFact: number;
  soEarned: number;
  soMax: number;
  siLines: LineData[];
  siLinesEarned: number;
  soLines: SoLineData[];
  soLinesEarned: number;
  channelB2C: number;
  channelB2B: number;
  channelPhys: number;
  warehouseQty: number;
  warehouseInTransit: number;
  avgSoPerMonth: number;
}

const SCENARIOS: Record<ScenarioKey, ScenarioData> = {
  c5: {
    name: "М3 · всё хорошо",
    month: "Июнь 2026",
    siMonths: [
      { month: "Апрель", plan: 1500, fact: 1545, pct: 103, status: "ok" },
      { month: "Май",    plan: 1500, fact: 1515, pct: 101, status: "ok" },
      { month: "Июнь",  plan: 1617, fact: 1713, pct: 106, status: "ok" },
    ],
    siFact: 4773, siEarned: 4, siMax: 4,
    soMonths: [
      { month: "Апрель", plan: 1600, fact: 1712, pct: 107, status: "ok" },
      { month: "Май",    plan: 1600, fact: 1728, pct: 108, status: "ok" },
      { month: "Июнь",  plan: 1800, fact: 1836, pct: 102, status: "ok" },
    ],
    soFact: 5276, soEarned: 7, soMax: 10,
    siLines: [
      { name: "Эстелайт Астериа",   limitPct: 11,  minQty: 509,  fact: 681,  share: 14.3, status: "ok",   remaining: 0  },
      { name: "Юниверсал Флоу",     limitPct: 30,  minQty: 1385, fact: 1813, share: 38.0, status: "ok",   remaining: 0  },
      { name: "Балк Филл Флоу",     limitPct: 2,   minQty: 95,   fact: 100,  share: 2.1,  status: "ok",   remaining: 0  },
      { name: "Эстелайт Постериор", limitPct: 3,   minQty: 143,  fact: 155,  share: 3.2,  status: "ok",   remaining: 0  },
      { name: "Бонд Форс II",       limitPct: 2.5, minQty: 119,  fact: 127,  share: 2.7,  status: "ok",   remaining: 0  },
      { name: "Юниверсал Бонд II",  limitPct: 0.8, minQty: 38,   fact: 55,   share: 1.2,  status: "ok",   remaining: 0  },
    ],
    siLinesEarned: 2,
    soLines: [
      { name: "Эстелайт Астериа", limitPct: 11, partnerThreshold: 9.9, fact: 601, share: 11.4, status: "ok"  },
      { name: "Юниверсал Флоу",   limitPct: 30, partnerThreshold: 27,  fact: 1899,share: 36.0, status: "ok"  },
      { name: "Балк Филл Флоу",   limitPct: 2,  partnerThreshold: 1.8, fact: 106, share: 2.0,  status: "ok"  },
    ],
    soLinesEarned: 3,
    channelB2C: 72, channelB2B: 21, channelPhys: 7,
    warehouseQty: 4200, warehouseInTransit: 500, avgSoPerMonth: 1759,
  },
  c3: {
    name: "М2 · норма",
    month: "Май 2026",
    siMonths: [
      { month: "Апрель", plan: 1500, fact: 1545, pct: 103, status: "ok"     },
      { month: "Май",    plan: 1500, fact: 1290, pct: 86,  status: "risk"   },
      { month: "Июнь",  plan: 1617, fact: 0,    pct: 0,   status: "nodata" },
    ],
    siFact: 2835, siEarned: 3, siMax: 4,
    soMonths: [
      { month: "Апрель", plan: 1600, fact: 1712, pct: 107, status: "ok"     },
      { month: "Май",    plan: 1600, fact: 1490, pct: 93,  status: "risk"   },
      { month: "Июнь",  plan: 1800, fact: 0,    pct: 0,   status: "nodata" },
    ],
    soFact: 3202, soEarned: 6, soMax: 10,
    siLines: [
      { name: "Эстелайт Астериа",   limitPct: 11,  minQty: 509,  fact: 402,  share: 14.2, status: "ok",   remaining: 0   },
      { name: "Юниверсал Флоу",     limitPct: 30,  minQty: 1385, fact: 1089, share: 38.4, status: "ok",   remaining: 296 },
      { name: "Балк Филл Флоу",     limitPct: 2,   minQty: 95,   fact: 62,   share: 2.2,  status: "ok",   remaining: 33  },
      { name: "Эстелайт Постериор", limitPct: 3,   minQty: 143,  fact: 94,   share: 3.3,  status: "ok",   remaining: 49  },
      { name: "Бонд Форс II",       limitPct: 2.5, minQty: 119,  fact: 77,   share: 2.7,  status: "ok",   remaining: 42  },
      { name: "Юниверсал Бонд II",  limitPct: 0.8, minQty: 38,   fact: 33,   share: 1.2,  status: "ok",   remaining: 5   },
    ],
    siLinesEarned: 2,
    soLines: [
      { name: "Эстелайт Астериа", limitPct: 11, partnerThreshold: 9.9, fact: 388, share: 12.1, status: "ok"  },
      { name: "Юниверсал Флоу",   limitPct: 30, partnerThreshold: 27,  fact: 1217,share: 38.0, status: "ok"  },
      { name: "Балк Филл Флоу",   limitPct: 2,  partnerThreshold: 1.8, fact: 74,  share: 2.3,  status: "ok"  },
    ],
    soLinesEarned: 3,
    channelB2C: 74, channelB2B: 19, channelPhys: 7,
    warehouseQty: 3800, warehouseInTransit: 300, avgSoPerMonth: 1601,
  },
  c2: {
    name: "М2 · всё плохо",
    month: "Май 2026",
    siMonths: [
      { month: "Апрель", plan: 1500, fact: 885,  pct: 59, status: "risk"    },
      { month: "Май",    plan: 1500, fact: 510,  pct: 34, status: "blocked" },
      { month: "Июнь",  plan: 1617, fact: 0,    pct: 0,  status: "nodata"  },
    ],
    siFact: 1395, siEarned: 1, siMax: 4,
    soMonths: [
      { month: "Апрель", plan: 1600, fact: 1088, pct: 68, status: "risk"    },
      { month: "Май",    plan: 1600, fact: 1136, pct: 71, status: "blocked" },
      { month: "Июнь",  plan: 1800, fact: 0,    pct: 0,  status: "nodata"  },
    ],
    soFact: 2224, soEarned: 4, soMax: 10,
    siLines: [
      { name: "Эстелайт Астериа",   limitPct: 11,  minQty: 509,  fact: 113, share: 8.1,  status: "fail", remaining: 396 },
      { name: "Юниверсал Флоу",     limitPct: 30,  minQty: 1385, fact: 530, share: 38.0, status: "ok",   remaining: 855 },
      { name: "Балк Филл Флоу",     limitPct: 2,   minQty: 95,   fact: 31,  share: 2.2,  status: "ok",   remaining: 64  },
      { name: "Эстелайт Постериор", limitPct: 3,   minQty: 143,  fact: 45,  share: 3.2,  status: "ok",   remaining: 98  },
      { name: "Бонд Форс II",       limitPct: 2.5, minQty: 119,  fact: 25,  share: 1.8,  status: "fail", remaining: 94  },
      { name: "Юниверсал Бонд II",  limitPct: 0.8, minQty: 38,   fact: 17,  share: 1.2,  status: "ok",   remaining: 21  },
    ],
    siLinesEarned: 0,
    soLines: [
      { name: "Эстелайт Астериа", limitPct: 11, partnerThreshold: 9.9, fact: 160, share: 7.2, status: "fail" },
      { name: "Юниверсал Флоу",   limitPct: 30, partnerThreshold: 27,  fact: 845, share: 38.0,status: "ok"  },
      { name: "Балк Филл Флоу",   limitPct: 2,  partnerThreshold: 1.8, fact: 31,  share: 1.4, status: "fail" },
    ],
    soLinesEarned: 0,
    channelB2C: 68, channelB2B: 20, channelPhys: 12,
    warehouseQty: 2800, warehouseInTransit: 0, avgSoPerMonth: 1112,
  },
};

// ─── Утилиты ──────────────────────────────────────────────────────────────────
function pctColor(pct: number, isBlocked = false) {
  if (isBlocked) return "text-red-600";
  if (pct >= 100) return "text-green-700";
  if (pct >= 70) return "text-amber-600";
  return "text-red-600";
}
function rowBg(status: MonthData["status"]) {
  if (status === "ok") return "bg-green-50";
  if (status === "risk") return "bg-amber-50";
  if (status === "blocked") return "bg-red-50";
  return "bg-gray-50";
}
function barColor(pct: number) {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-red-500";
}

function ProgressBar({ pct, blocked }: { pct: number; blocked?: boolean }) {
  const w = Math.min(100, pct);
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
      <div
        className={`h-full rounded-full transition-all duration-500 ${blocked ? "bg-red-400" : barColor(pct)}`}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

function SectionHeader({ number, title, subtitle, expanded, onToggle }: {
  number: number; title: string; subtitle: string; expanded: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
    >
      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-gray-900 text-sm block">{title}</span>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>
      {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  );
}

function ScoreChip({ earned, max, color = "blue" }: { earned: number; max: number; color?: string }) {
  const cls = color === "green"
    ? "bg-green-600 text-white"
    : color === "amber"
    ? "bg-amber-100 text-amber-800 border border-amber-200"
    : color === "red"
    ? "bg-red-100 text-red-800 border border-red-200"
    : "bg-blue-600 text-white";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-sm font-black ${cls}`}>
      {earned}% <span className="font-normal opacity-70 text-xs">из {max}%</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ
// ═══════════════════════════════════════════════════════════════════════════
export function SalesStatus() {
  const [scenario, setScenario] = useState<ScenarioKey>("c5");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true, 5: false, 6: false });
  const s = SCENARIOS[scenario];

  const toggle = (n: number) => setExpanded(prev => ({ ...prev, [n]: !prev[n] }));

  // ── Вычисления ────────────────────────────────────────────────────────
  const siPct    = Math.round((s.siFact / QUARTER_PLANS.sellIn) * 100);
  const soPct    = Math.round((s.soFact / QUARTER_PLANS.sellOut) * 100);
  const siRemain = Math.max(0, QUARTER_PLANS.sellIn - s.siFact);
  const soRemain = Math.max(0, QUARTER_PLANS.sellOut - s.soFact);

  const siBlocked  = s.siMonths.some(m => m.status === "blocked");
  const soBlocked  = s.soMonths.some(m => m.status === "blocked");

  const indirectPct = s.channelB2B + s.channelPhys;
  const channelOk   = indirectPct <= 40;

  const warehouseCoverage = ((s.warehouseQty + s.warehouseInTransit) / s.avgSoPerMonth);
  const warehouseStatus = warehouseCoverage < 2 ? "deficit" : warehouseCoverage > 3.5 ? "excess" : "norm";

  return (
    <div className="space-y-5">

      {/* ── Заголовок ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200 px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Аналитика</h1>
            <p className="text-xs text-gray-400 mt-0.5">Детализация выполнения Sell-In / Sell-Out · Q2 2026</p>
          </div>
          <button
            onClick={() => alert("Экспорт в Excel")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-2xl text-sm font-semibold hover:bg-green-700 transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            Скачать Excel
          </button>
        </div>
      </div>

      {/* ── Прototип · сценарий ───────────────────────────────────── */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Прotoтип · Сценарий:</span>
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map(key => (
          <button
            key={key}
            onClick={() => setScenario(key)}
            className={`px-3 py-1 rounded-2xl text-xs font-semibold transition-all ${
              scenario === key ? "bg-indigo-600 text-white" : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            {SCENARIOS[key].name}
          </button>
        ))}
        <span className="text-xs text-indigo-500 ml-auto hidden sm:block">Данные: {s.month} · ООО Дентал-Плюс</span>
      </div>

      {/* ── Сводные плашки ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`rounded-3xl border p-4 ${siBlocked ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-400 mb-1">Sell-In · квартал</p>
          <p className={`text-2xl font-black ${pctColor(siPct, siBlocked)}`}>{siPct}%</p>
          <p className="text-xs text-gray-400 mt-1">{s.siFact.toLocaleString()} / {QUARTER_PLANS.sellIn.toLocaleString()} шт.</p>
          <ScoreChip earned={s.siEarned} max={s.siMax} color={siBlocked ? "red" : s.siEarned === s.siMax ? "green" : "blue"} />
        </div>
        <div className={`rounded-3xl border p-4 ${soBlocked ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-400 mb-1">Sell-Out · квартал</p>
          <p className={`text-2xl font-black ${pctColor(soPct, soBlocked)}`}>{soPct}%</p>
          <p className="text-xs text-gray-400 mt-1">{s.soFact.toLocaleString()} / {QUARTER_PLANS.sellOut.toLocaleString()} шт.</p>
          <ScoreChip earned={s.soEarned} max={s.soMax} color={soBlocked ? "red" : s.soEarned === s.soMax ? "green" : "blue"} />
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-4">
          <p className="text-xs text-gray-400 mb-1">Линейки SI</p>
          <p className={`text-2xl font-black ${s.siLinesEarned > 0 ? "text-green-700" : "text-red-600"}`}>
            {s.siLines.filter(l => l.status === "ok").length}/{s.siLines.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">линеек выполнено</p>
          <ScoreChip earned={s.siLinesEarned} max={2} color={s.siLinesEarned === 2 ? "green" : "amber"} />
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-4">
          <p className="text-xs text-gray-400 mb-1">Линейки SO</p>
          <p className={`text-2xl font-black ${s.soLinesEarned > 0 ? "text-green-700" : "text-amber-600"}`}>
            {s.soLines.filter(l => l.status === "ok").length}/{s.soLines.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">линеек выполнено</p>
          <ScoreChip earned={s.soLinesEarned} max={3} color={s.soLinesEarned === 3 ? "green" : "amber"} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          РАЗДЕЛ 1: Sell-In план
      ════════════════════════════════════════════════════════════ */}
      <div className={`bg-white rounded-3xl border overflow-hidden ${siBlocked ? "border-red-300" : "border-gray-200"}`}>
        <SectionHeader number={1} title="Выполнение плана закупок (Sell-In)" subtitle={`БДО · квартал Q2 2026 · план ${QUARTER_PLANS.sellIn.toLocaleString()} шт.`} expanded={expanded[1]} onToggle={() => toggle(1)} />

        {expanded[1] && (
          <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">

            {siBlocked && (
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Блок заблокирован — июнь уже не влияет</p>
                  <p className="text-xs text-red-600 mt-0.5">2+ месяца ниже 100% плана. Скидка за Sell-In: 0%. Фокус — следующий квартал.</p>
                </div>
              </div>
            )}

            {/* Ключевые метрики */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400">Общий план</p>
                <p className="font-bold text-gray-900 text-lg">{QUARTER_PLANS.sellIn.toLocaleString()}</p>
                <p className="text-xs text-gray-400">шт. за квартал</p>
              </div>
              <div className={`rounded-2xl p-3 ${siBlocked ? "bg-red-50" : siPct >= 100 ? "bg-green-50" : "bg-amber-50"}`}>
                <p className="text-xs text-gray-400">Закуплено</p>
                <p className={`font-bold text-lg ${pctColor(siPct, siBlocked)}`}>{s.siFact.toLocaleString()}</p>
                <p className="text-xs text-gray-400">{siPct}% выполнения</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400">Осталось закупить</p>
                <p className="font-bold text-blue-700 text-lg">{siRemain > 0 ? siRemain.toLocaleString() : "✓"}</p>
                <p className="text-xs text-gray-400">{siRemain > 0 ? "шт. до плана" : "план выполнен"}</p>
              </div>
              <div className={`rounded-2xl p-3 ${s.siEarned === s.siMax ? "bg-green-50" : siBlocked ? "bg-red-50" : "bg-gray-50"}`}>
                <p className="text-xs text-gray-400">Начислено</p>
                <p className={`font-bold text-lg ${s.siEarned === s.siMax ? "text-green-700" : siBlocked ? "text-red-600" : "text-gray-700"}`}>{s.siEarned}%</p>
                <p className="text-xs text-gray-400">из {s.siMax}% макс.</p>
              </div>
            </div>

            {/* Общий прогресс */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-gray-500">Прогресс квартала</span>
                <span className={`text-xs font-semibold ${pctColor(siPct, siBlocked)}`}>{siPct}%</span>
              </div>
              <ProgressBar pct={siPct} blocked={siBlocked} />
            </div>

            {/* Таблица по месяцам */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">По месяцам</p>
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Месяц</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">План, шт.</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Факт, шт.</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">%</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.siMonths.map((m, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${rowBg(m.status)}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{m.month}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{m.plan.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {m.fact > 0 ? m.fact.toLocaleString() : <span className="text-gray-300">—</span>}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${m.status === "nodata" ? "text-gray-300" : pctColor(m.pct, m.status === "blocked")}`}>
                          {m.pct > 0 ? `${m.pct}%` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {m.status === "ok"      && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-lg">✓ Выполнен</span>}
                          {m.status === "risk"    && <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">⚠ Риск</span>}
                          {m.status === "blocked" && <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-lg">✗ &lt;70% — блокировка</span>}
                          {m.status === "nodata"  && <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">Нет данных</span>}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                      <td className="px-4 py-3 text-gray-900">Итого</td>
                      <td className="px-4 py-3 text-right text-gray-700">{QUARTER_PLANS.sellIn.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{s.siFact.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-black ${pctColor(siPct, siBlocked)}`}>{siPct}%</td>
                      <td className="px-4 py-3">
                        {siBlocked
                          ? <span className="text-xs font-bold text-red-700">Заблокирован → 0%</span>
                          : <span className="text-xs font-bold text-blue-700">→ {s.siEarned}% скидки</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Шкала скидок Sell-In */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Шкала скидок Sell-In</p>
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Выполнение</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Дистрибьютор</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Партнёр</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { range: "≥ 100%", distrib: "4%", partner: "4%", active: siPct >= 100 },
                      { range: "≥ 90%",  distrib: "2%", partner: "3%", active: siPct >= 90 && siPct < 100 },
                      { range: "≥ 70%",  distrib: "1%", partner: "2%", active: siPct >= 70 && siPct < 90  },
                      { range: "< 70% / правило 2 из 3", distrib: "0%", partner: "0%", active: siBlocked || siPct < 70 },
                    ].map((row, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${row.active && !siBlocked ? "bg-blue-50" : row.active && siBlocked ? "bg-red-50" : ""}`}>
                        <td className={`px-4 py-2.5 font-medium ${row.active && !siBlocked ? "text-blue-800" : row.active ? "text-red-700" : "text-gray-600"}`}>{row.range}</td>
                        <td className="px-4 py-2.5 text-center font-semibold text-gray-700">{row.distrib}</td>
                        <td className="px-4 py-2.5 text-center font-semibold text-gray-700">{row.partner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          РАЗДЕЛ 2: Линейки Sell-In
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <SectionHeader number={2} title="Структура закупок по линейкам (Sell-In)" subtitle={`Лимиты по Приложению №2 · ООО Дентал-Плюс (ПФО)`} expanded={expanded[2]} onToggle={() => toggle(2)} />

        {expanded[2] && (
          <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
            {s.siLines.filter(l => l.status === "fail").length > 0 && !siBlocked && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  {s.siLines.filter(l => l.status === "fail").length} {s.siLines.filter(l => l.status === "fail").length === 1 ? "линейка" : "линейки"} не выполнены — скидка за структуру: 0%.
                  {s.siLines.filter(l => l.status === "fail").map(l => ` +${l.remaining} шт. по ${l.name}`).join(",")} → 2%.
                </p>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Линейка</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Лимит %</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Мин. шт.</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Закуплено</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Доля %</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Статус</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Осталось</th>
                  </tr>
                </thead>
                <tbody>
                  {s.siLines.map((line, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${line.status === "fail" ? "bg-red-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-3 py-3 font-medium text-gray-900 text-xs">{line.name}</td>
                      <td className="px-3 py-3 text-center text-gray-600 text-xs">{line.limitPct}%</td>
                      <td className="px-3 py-3 text-right text-gray-600 text-xs">{line.minQty}</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900 text-xs">{line.fact}</td>
                      <td className={`px-3 py-3 text-right font-bold text-xs ${line.status === "ok" ? "text-green-700" : "text-red-600"}`}>
                        {line.share.toFixed(1)}%
                      </td>
                      <td className="px-3 py-3 text-center">
                        {line.status === "ok"
                          ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          : <XCircle className="w-4 h-4 text-red-600 mx-auto" />}
                      </td>
                      <td className={`px-3 py-3 text-right font-bold text-xs ${line.remaining > 0 ? "text-blue-600" : "text-green-600"}`}>
                        {line.remaining > 0 ? `+${line.remaining}` : "✓"}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                    <td className="px-3 py-2.5 text-xs text-gray-700 italic">Остальное (прочие артикулы)</td>
                    <td className="px-3 py-2.5 text-center text-xs text-gray-400">—</td>
                    <td className="px-3 py-2.5 text-right text-xs text-gray-400">—</td>
                    <td className="px-3 py-2.5 text-right text-xs text-gray-600">{Math.max(0, s.siFact - s.siLines.reduce((a, l) => a + l.fact, 0))}</td>
                    <td className="px-3 py-2.5 text-right text-xs text-gray-600">
                      {((Math.max(0, s.siFact - s.siLines.reduce((a, l) => a + l.fact, 0)) / s.siFact) * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-gray-400">—</td>
                    <td className="px-3 py-2.5 text-right text-xs text-blue-600">
                      {Math.max(0, QUARTER_PLANS.sellIn - s.siFact) > 0
                        ? `+${Math.max(0, QUARTER_PLANS.sellIn - s.siFact)}`
                        : "✓"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-2xl">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">Cap-механизм: знаменатель для расчёта долей = min(Факт SI; 110% × план). Строка «Остальное» = артикулы без лимита.</p>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          РАЗДЕЛ 3: Sell-Out план
      ════════════════════════════════════════════════════════════ */}
      <div className={`bg-white rounded-3xl border overflow-hidden ${soBlocked ? "border-red-300" : "border-gray-200"}`}>
        <SectionHeader number={3} title="Выполнение плана сбыта (Sell-Out)" subtitle={`БДО · квартал Q2 2026 · план ${QUARTER_PLANS.sellOut.toLocaleString()} шт.`} expanded={expanded[3]} onToggle={() => toggle(3)} />

        {expanded[3] && (
          <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">

            {soBlocked && (
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Блок заблокирован — июнь уже не влияет</p>
                  <p className="text-xs text-red-600 mt-0.5">2+ месяца ниже 100% плана. Скидка за Sell-Out: 0%.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400">Общий план</p>
                <p className="font-bold text-gray-900 text-lg">{QUARTER_PLANS.sellOut.toLocaleString()}</p>
                <p className="text-xs text-gray-400">шт. за квартал</p>
              </div>
              <div className={`rounded-2xl p-3 ${soBlocked ? "bg-red-50" : soPct >= 100 ? "bg-green-50" : "bg-amber-50"}`}>
                <p className="text-xs text-gray-400">Продано</p>
                <p className={`font-bold text-lg ${pctColor(soPct, soBlocked)}`}>{s.soFact.toLocaleString()}</p>
                <p className="text-xs text-gray-400">{soPct}% выполнения</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400">Осталось продать</p>
                <p className="font-bold text-blue-700 text-lg">{soRemain > 0 ? soRemain.toLocaleString() : "✓"}</p>
                <p className="text-xs text-gray-400">{soRemain > 0 ? "шт. до плана" : "план выполнен"}</p>
              </div>
              <div className={`rounded-2xl p-3 ${s.soEarned === s.soMax ? "bg-green-50" : soBlocked ? "bg-red-50" : "bg-gray-50"}`}>
                <p className="text-xs text-gray-400">Начислено</p>
                <p className={`font-bold text-lg ${s.soEarned === s.soMax ? "text-green-700" : soBlocked ? "text-red-600" : "text-gray-700"}`}>{s.soEarned}%</p>
                <p className="text-xs text-gray-400">из {s.soMax}% макс.</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-gray-500">Прогресс квартала</span>
                <span className={`text-xs font-semibold ${pctColor(soPct, soBlocked)}`}>{soPct}%</span>
              </div>
              <ProgressBar pct={soPct} blocked={soBlocked} />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">По месяцам</p>
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Месяц</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">План, шт.</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Факт, шт.</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">%</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.soMonths.map((m, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${rowBg(m.status)}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{m.month}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{m.plan.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {m.fact > 0 ? m.fact.toLocaleString() : <span className="text-gray-300">—</span>}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${m.status === "nodata" ? "text-gray-300" : pctColor(m.pct, m.status === "blocked")}`}>
                          {m.pct > 0 ? `${m.pct}%` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {m.status === "ok"      && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-lg">✓ Выполнен</span>}
                          {m.status === "risk"    && <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">⚠ Риск</span>}
                          {m.status === "blocked" && <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-lg">✗ &lt;100% → правило 2 из 3</span>}
                          {m.status === "nodata"  && <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">Нет данных</span>}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                      <td className="px-4 py-3 text-gray-900">Итого</td>
                      <td className="px-4 py-3 text-right text-gray-700">{QUARTER_PLANS.sellOut.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{s.soFact.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-black ${pctColor(soPct, soBlocked)}`}>{soPct}%</td>
                      <td className="px-4 py-3">
                        {soBlocked
                          ? <span className="text-xs font-bold text-red-700">Заблокирован → 0%</span>
                          : <span className="text-xs font-bold text-blue-700">→ {s.soEarned}% скидки</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Шкала скидок Sell-Out */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Шкала скидок Sell-Out</p>
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Выполнение</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Дистрибьютор</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Партнёр</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Условие</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { range: "≥ 110%", distrib: "8%",  partner: "10%", condition: "Все 3 мес. ≥ 100% + квартал ≥ 110%", active: soPct >= 110 },
                      { range: "≥ 100%", distrib: "6%",  partner: "7%",  condition: "Все 3 мес. ≥ 100% + квартал 100–109%", active: soPct >= 100 && soPct < 110 },
                      { range: "≥ 90%",  distrib: "0%",  partner: "3%",  condition: "Все 3 мес. ≥ 100% + квартал 90–99%", active: soPct >= 90 && soPct < 100 },
                      { range: "< 90% / правило 2 из 3", distrib: "0%", partner: "0%", condition: "2+ мес. < 100% ИЛИ 1 мес. < 70%", active: soBlocked || soPct < 90 },
                    ].map((row, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${row.active && !soBlocked ? "bg-blue-50" : row.active && soBlocked ? "bg-red-50" : ""}`}>
                        <td className={`px-4 py-2.5 font-medium ${row.active && !soBlocked ? "text-blue-800" : row.active ? "text-red-700" : "text-gray-600"}`}>{row.range}</td>
                        <td className="px-4 py-2.5 text-center font-semibold text-gray-700">{row.distrib}</td>
                        <td className="px-4 py-2.5 text-center font-semibold text-gray-700">{row.partner}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{row.condition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          РАЗДЕЛ 4: Линейки Sell-Out
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <SectionHeader number={4} title="Структура сбыта по линейкам (Sell-Out)" subtitle="Три фокусные линейки · Условие статуса Партнёр" expanded={expanded[4]} onToggle={() => toggle(4)} />

        {expanded[4] && (
          <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Линейка</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Лимит SO %</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Порог Партнёр</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Факт, шт.</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Доля %</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {s.soLines.map((line, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${line.status === "fail" ? "bg-red-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-3 py-3 font-medium text-gray-900 text-xs">{line.name}</td>
                      <td className="px-3 py-3 text-center text-gray-600 text-xs">{line.limitPct}%</td>
                      <td className="px-3 py-3 text-center text-amber-700 font-semibold text-xs">≥ {line.partnerThreshold}%</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900 text-xs">{line.fact.toLocaleString()}</td>
                      <td className={`px-3 py-3 text-right font-bold text-xs ${line.status === "ok" ? "text-green-700" : "text-red-600"}`}>
                        {line.share.toFixed(1)}%
                      </td>
                      <td className="px-3 py-3 text-center">
                        {line.status === "ok"
                          ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          : <XCircle className="w-4 h-4 text-red-600 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
              <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">Для статуса Партнёр все три линейки SO должны быть ≥ порогового значения. При невыполнении хотя бы одной — скидка за SO-линейки = 0%.</p>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          РАЗДЕЛ 5: Каналы сбыта
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <SectionHeader number={5} title="Мониторинг каналов сбыта" subtitle="B2C / B2B / Физлица · лимит непрямых ≤ 40%" expanded={expanded[5]} onToggle={() => toggle(5)} />

        {expanded[5] && (
          <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "B2C (клиники с ИНН)", value: s.channelB2C, color: "text-green-700", bg: "bg-green-50 border-green-200", bar: "bg-green-500", type: "Прямые" },
                { label: "B2B (прочие юрлица)", value: s.channelB2B, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", bar: "bg-amber-500", type: "Непрямые" },
                { label: "Физлица / без ИНН",  value: s.channelPhys, color: s.channelPhys > 10 ? "text-red-700" : "text-gray-700", bg: s.channelPhys > 10 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200", bar: s.channelPhys > 10 ? "bg-red-500" : "bg-gray-400", type: "Непрямые" },
              ].map((ch) => (
                <div key={ch.label} className={`rounded-2xl border p-4 ${ch.bg}`}>
                  <p className="text-xs text-gray-400 mb-0.5">{ch.label}</p>
                  <p className={`text-2xl font-black ${ch.color}`}>{ch.value}%</p>
                  <span className="text-xs text-gray-400 bg-white/70 px-1.5 py-0.5 rounded-lg">{ch.type}</span>
                  <div className="h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full ${ch.bar} rounded-full`} style={{ width: `${ch.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${!channelOk ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
              {channelOk
                ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
              <div>
                <p className={`text-sm font-semibold ${channelOk ? "text-green-800" : "text-amber-800"}`}>
                  Непрямые (B2B + физлица): {indirectPct}% из 40% допустимых
                </p>
                {!channelOk && (
                  <p className="text-xs text-amber-700 mt-0.5">Превышен лимит 40%. Возможно информационное предупреждение от Протеко.</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-2xl">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">Если ИНН покупателя не заполнен в отчёте Sell-Out — продажа автоматически попадает в категорию физлиц. Проверьте заполнение ИНН в ваших отчётах.</p>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          РАЗДЕЛ 6: Складские остатки
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <SectionHeader number={6} title="Мониторинг складских остатков" subtitle="Покрытие = (остаток + в пути) / avg SO за 3 мес." expanded={expanded[6]} onToggle={() => toggle(6)} />

        {expanded[6] && (
          <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Остаток на складе</p>
                <p className="text-xl font-bold text-gray-900">{s.warehouseQty.toLocaleString()}</p>
                <p className="text-xs text-gray-400">шт.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Товар в пути</p>
                <p className="text-xl font-bold text-blue-700">{s.warehouseInTransit.toLocaleString()}</p>
                <p className="text-xs text-gray-400">шт.</p>
              </div>
              <div className={`rounded-2xl p-4 border ${
                warehouseStatus === "deficit" ? "bg-red-50 border-red-200"
                : warehouseStatus === "excess" ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
              }`}>
                <p className="text-xs text-gray-400 mb-1">Покрытие</p>
                <p className={`text-xl font-bold ${
                  warehouseStatus === "deficit" ? "text-red-700" : warehouseStatus === "excess" ? "text-amber-700" : "text-green-700"
                }`}>{warehouseCoverage.toFixed(1)} мес.</p>
                <p className={`text-xs font-semibold ${
                  warehouseStatus === "deficit" ? "text-red-600" : warehouseStatus === "excess" ? "text-amber-600" : "text-green-600"
                }`}>
                  {warehouseStatus === "deficit" ? "Дефицит" : warehouseStatus === "excess" ? "Переполнение" : "Норма"}
                </p>
              </div>
            </div>

            {/* Зоны покрытия */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Зоны покрытия</p>
              <div className="flex gap-2">
                {[
                  { label: "Дефицит", range: "< 2 мес.", color: "bg-red-100 text-red-700 border-red-200", active: warehouseStatus === "deficit" },
                  { label: "Норма",   range: "2–3.5 мес.", color: "bg-green-100 text-green-700 border-green-200", active: warehouseStatus === "norm" },
                  { label: "Переполнение", range: "> 3.5 мес.", color: "bg-amber-100 text-amber-700 border-amber-200", active: warehouseStatus === "excess" },
                ].map((zone) => (
                  <div key={zone.label} className={`flex-1 border rounded-2xl px-3 py-2.5 text-center ${zone.active ? zone.color : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                    <p className="text-xs font-bold">{zone.label}</p>
                    <p className="text-xs">{zone.range}</p>
                    {zone.active && <p className="text-xs font-semibold mt-0.5">← текущий</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Формула покрытия:</span> ({s.warehouseQty.toLocaleString()} + {s.warehouseInTransit}) / {s.avgSoPerMonth.toLocaleString()} = {warehouseCoverage.toFixed(2)} мес.
                (avg SO за 3 мес. = {s.avgSoPerMonth.toLocaleString()} шт./мес.)
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}