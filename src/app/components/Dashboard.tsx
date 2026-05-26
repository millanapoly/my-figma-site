import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, CheckCircle, Package, ShoppingCart,
  DollarSign, Newspaper, Star, ChevronRight,
  ArrowRight,
} from "lucide-react";
import { financeScenarios } from "../utils/financeScenarios";

// ─── Типы ────────────────────────────────────────────────────────────────────
type BlockStatus = "max" | "ok" | "risk" | "blocked" | "nodata";
type DiscountState = "forecast" | "calculated" | "final";
type ScenarioKey = "c3" | "c2" | "c4" | "c5";

interface BlockData {
  label: string;
  sublabel: string;
  earned: number;
  max: number;
  status: BlockStatus;
  badge: string;
}

interface MetricPeriod {
  sellOut: string; sellOutPct: number;
  sellIn: string;  sellInPct: number;
  sellOutLines: string;
  sellInLines: string;
}

interface ScenarioData {
  name: string;
  period: string;
  discountValue: number;
  discountState: DiscountState;
  potential: number;
  maxDiscount: number;
  isPartner: boolean;
  updatedAt: string;
  blocks: BlockData[];
  actionText: string;
  actionLink: string;
  recs: string[];
  metrics: { month: MetricPeriod; quarter: MetricPeriod };
}

// ─── Сценарии (для прототипа) ─────────────────────────────────────────────
const SCENARIOS: Record<ScenarioKey, ScenarioData> = {
  c3: {
    name: "М2 · всё хорошо",
    period: "Q2 2026 · май · прогноз",
    discountValue: 17,
    discountState: "forecast",
    potential: 3,
    maxDiscount: 20,
    isPartner: true,
    updatedAt: "20.05.2026 14:30",
    blocks: [
      { label: "Sell-In план", sublabel: "БДО · закупки", earned: 3, max: 4, status: "ok", badge: "норма" },
      { label: "Линейки SI", sublabel: "структура закупок", earned: 2, max: 2, status: "max", badge: "максимум" },
      { label: "Sell-Out план", sublabel: "БДО · сбыт", earned: 6, max: 10, status: "ok", badge: "норма" },
      { label: "Линейки SO", sublabel: "структура сбыта", earned: 3, max: 3, status: "max", badge: "максимум" },
      { label: "Отчётность", sublabel: "CISLink", earned: 1, max: 1, status: "max", badge: "сдано" },
    ],
    actionText: "Sell-In Май: 86% — нужно ещё 210 шт. до конца месяца для +4%",
    actionLink: "/analytics",
    recs: [
      "Нарастить Sell-Out до 100% (+210 шт.) — разблокирует +3% к скидке",
      "Закрыть Sell-In до плана квартала (+90 шт.)",
      "Выполнить 3-ю линейку Sell-Out до конца квартала",
      "Промежуточный отчёт за май — дедлайн 21 мая",
      "Проверить актуальность остатков перед закрытием периода",
    ],
    metrics: {
      month:   { sellOut: "310 / 430", sellOutPct: 72, sellIn: "220 / 300", sellInPct: 73, sellOutLines: "2 из 3", sellInLines: "3 из 5" },
      quarter: { sellOut: "910 / 1 300", sellOutPct: 70, sellIn: "720 / 900", sellInPct: 80, sellOutLines: "2 из 3", sellInLines: "3 из 5" },
    },
  },
  c2: {
    name: "М2 · всё плохо",
    period: "Q2 2026 · май · прогноз",
    discountValue: 6,
    discountState: "forecast",
    potential: 14,
    maxDiscount: 20,
    isPartner: false,
    updatedAt: "15.05.2026 09:10",
    blocks: [
      { label: "Sell-In план", sublabel: "БДО · закупки", earned: 1, max: 4, status: "risk", badge: "риск" },
      { label: "Линейки SI", sublabel: "структура закупок", earned: 0, max: 2, status: "risk", badge: "риск" },
      { label: "Sell-Out план", sublabel: "БДО · сбыт", earned: 4, max: 10, status: "risk", badge: "риск" },
      { label: "Линейки SO", sublabel: "структура сбыта", earned: 0, max: 3, status: "risk", badge: "риск" },
      { label: "Отчётность", sublabel: "CISLink", earned: 1, max: 1, status: "ok", badge: "1 просрочка" },
    ],
    actionText: "Sell-In Май: 34% — ниже 70%! Блок 1 будет заблокирован безвозвратно",
    actionLink: "/analytics",
    recs: [
      "Срочно нарастить Sell-In — риск блокировки",
      "Закупить фокусные линейки",
      "Продать 295 шт. до 100% сбыта",
      "Наладить структуру линеек SO",
    ],
    metrics: {
      month:   { sellOut: "135 / 430", sellOutPct: 31, sellIn: "102 / 300", sellInPct: 34, sellOutLines: "1 из 3", sellInLines: "1 из 5" },
      quarter: { sellOut: "390 / 1 300", sellOutPct: 30, sellIn: "280 / 900", sellInPct: 31, sellOutLines: "1 из 3", sellInLines: "1 из 5" },
    },
  },
  c4: {
    name: "М3 · блоки заблокированы",
    period: "Q2 2026 · июнь · прогноз",
    discountValue: 4,
    discountState: "forecast",
    potential: 5,
    maxDiscount: 20,
    isPartner: false,
    updatedAt: "20.06.2026 11:00",
    blocks: [
      { label: "Sell-In план", sublabel: "БДО · закупки", earned: 0, max: 4, status: "blocked", badge: "заблокирован" },
      { label: "Линейки SI", sublabel: "структура закупок", earned: 1, max: 2, status: "risk", badge: "1 линейка" },
      { label: "Sell-Out план", sublabel: "БДО · сбыт", earned: 0, max: 10, status: "blocked", badge: "заблокирован" },
      { label: "Линейки SO", sublabel: "структура сбыта", earned: 2, max: 3, status: "risk", badge: "1 линейка" },
      { label: "Отчётность", sublabel: "CISLink", earned: 1, max: 1, status: "max", badge: "сдано" },
    ],
    actionText: "Блоки 1 и 3 заблокированы. Фокус: линейки SI (+180 шт. Астериа) и SO (+90 шт. Бонд Форс)",
    actionLink: "/analytics",
    recs: [
      "Закупить +180 шт. Астериа (Линейки SI)",
      "Продать +90 шт. Бонд Форс (Линейки SO)",
    ],
    metrics: {
      month:   { sellOut: "105 / 430", sellOutPct: 24, sellIn: "65 / 300", sellInPct: 22, sellOutLines: "2 из 3", sellInLines: "1 из 5" },
      quarter: { sellOut: "620 / 1 300", sellOutPct: 48, sellIn: "390 / 900", sellInPct: 43, sellOutLines: "2 из 3", sellInLines: "1 из 5" },
    },
  },
  c5: {
    name: "М3 · до максимума",
    period: "Q2 2026 · июнь · прогноз",
    discountValue: 18,
    discountState: "forecast",
    potential: 2,
    maxDiscount: 20,
    isPartner: true,
    updatedAt: "20.06.2026 08:40",
    blocks: [
      { label: "Sell-In план", sublabel: "БДО · закупки", earned: 4, max: 4, status: "max", badge: "максимум" },
      { label: "Линейки SI", sublabel: "структура закупок", earned: 2, max: 2, status: "max", badge: "максимум" },
      { label: "Sell-Out план", sublabel: "БДО · сбыт", earned: 7, max: 10, status: "ok", badge: "до 10%" },
      { label: "Линейки SO", sublabel: "структура сбыта", earned: 3, max: 3, status: "max", badge: "максимум" },
      { label: "Отчётность", sublabel: "CISLink", earned: 1, max: 1, status: "max", badge: "сдано" },
    ],
    actionText: "+244 шт. Sell-Out → квартал ≥ 110% → 10% вместо 7% (Партнёр)",
    actionLink: "/analytics",
    recs: [
      "Продать +244 шт. Sell-Out → 10% вместо 7%",
      "Выполнить Sell-Out план квартала 110%",
    ],
    metrics: {
      month:   { sellOut: "376 / 430", sellOutPct: 87, sellIn: "290 / 300", sellInPct: 97, sellOutLines: "3 из 3", sellInLines: "5 из 5" },
      quarter: { sellOut: "1 180 / 1 300", sellOutPct: 91, sellIn: "880 / 900", sellInPct: 98, sellOutLines: "3 из 3", sellInLines: "5 из 5" },
    },
  },
};

// ─── Утилиты ─────────────────────────────────────────────────────────────────
function getBlockColors(status: BlockStatus) {
  switch (status) {
    case "max":      return { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  num: "text-green-700" };
    case "ok":       return { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700",    num: "text-blue-700"  };
    case "risk":     return { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700",  num: "text-amber-700" };
    case "blocked":  return { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700",      num: "text-red-700"   };
    default:         return { bg: "bg-gray-50",   border: "border-gray-200",   text: "text-gray-500",   badge: "bg-gray-100 text-gray-500",    num: "text-gray-400"  };
  }
}

function getDiscountBadge(state: DiscountState) {
  switch (state) {
    case "forecast":   return { label: "прогноз",   cls: "bg-blue-100 text-blue-700 border border-blue-200" };
    case "calculated": return { label: "расчётная", cls: "bg-amber-100 text-amber-700 border border-amber-200" };
    case "final":      return { label: "итоговая",  cls: "bg-green-100 text-green-700 border border-green-200" };
  }
}

// ─── Цветовая полоска прогресса метрики ─────────────────────────────────────
function pctBarColor(pct: number) {
  if (pct >= 90) return "bg-green-500";
  if (pct >= 70) return "bg-blue-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}
function pctTextColor(pct: number) {
  if (pct >= 90) return "text-green-600";
  if (pct >= 70) return "text-blue-600";
  if (pct >= 50) return "text-amber-600";
  return "text-red-600";
}

// ═══════════════════════════════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ
// ═══════════════════════════════════════════════════════════════════════════

export function Dashboard() {
  const [period, setPeriod] = useState<"month" | "quarter">("month");
  const s = SCENARIOS["c3"];
  const badge = getDiscountBadge(s.discountState);
  const m = s.metrics[period];
  const hasBlockedBlock = s.blocks.some(b => b.status === "blocked");
  const hasRiskBlock = s.blocks.some(b => b.status === "risk");

  // ── Финансовые данные (существующая логика) ───────────────────────────
  const currentScenarioKey = "scenario1";
  const finScenario = financeScenarios[currentScenarioKey];
  const financialDocs = finScenario.docs;
  const creditLimit = finScenario.creditLimit;
  const creditDepth = finScenario.creditDepth;
  const balance = finScenario.balance;
  const totalDebt = financialDocs.reduce((sum, doc) => sum + doc.debtAmount, 0);
  const shippedWithoutPayment = totalDebt;
  const availableCredit = creditLimit - totalDebt;

  const nearestDeadline = financialDocs.length > 0
    ? financialDocs
        .filter(doc => doc.payDueDate !== null)
        .map(doc => doc.payDueDate as string)
        .sort((a, b) => {
          const dateA = new Date(a.split('.').reverse().join('-'));
          const dateB = new Date(b.split('.').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        })[0] ?? null
    : null;

  const getFinancialStatus = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const hasOverdue = financialDocs.some(doc => {
      if (!doc.payDueDate) return false;
      const dueDate = new Date(doc.payDueDate.split('.').reverse().join('-'));
      return dueDate < today;
    });
    if (hasOverdue) return { type: 'critical', message: 'Отгрузка заблокирована из-за просрочки' };
    if (availableCredit < 0) return { type: 'critical', message: 'Превышен кредитный лимит' };
    if (nearestDeadline) {
      const d = new Date(nearestDeadline.split('.').reverse().join('-'));
      const days = Math.ceil((d.getTime() - today.getTime()) / 86400000);
      if (days > 0 && days <= 7) return { type: 'warning', message: `До стоп-отгрузки ${days} ${days === 1 ? 'день' : days <= 4 ? 'дня' : 'дней'}` };
    }
    return { type: 'normal', message: 'Просроченных платежей нет' };
  };
  const financialStatus = getFinancialStatus();

  // ── Новости ───────────────────────────────────────────────────────────
  const newsItems = [
    { id: 1, date: "25.04.2026", title: "Новый продукт: Эстелайт Грейс", summary: "С апреля 2026 в ассортименте новая линейка Эстелайт Грейс с улучшенными эстетическими свойствами.", isNew: true },
    { id: 2, date: "22.04.2026", title: "Изменение условий оплаты", summary: "Введены новые условия предоплаты для заказов с дополнительной скидкой 3% при оплате до отгрузки.", isNew: true },
    { id: 3, date: "18.04.2026", title: "Акция на Бонд Форс II", summary: "До конца квартала действует специальное предложение на линейку адгезивов Бонд Форс II Токуяма.", isNew: false },
  ];

  const recentShipments = [
    { id: 1, number: "ОТГ-2026-00234", date: "26.04.2026", amount: 234700, isNew: true },
    { id: 2, number: "ОТГ-2026-00233", date: "25.04.2026", amount: 156800, isNew: true },
    { id: 3, number: "ОТГ-2026-00232", date: "24.04.2026", amount: 189200, isNew: false },
  ];

  const recentOrders = [
    { id: 1, number: "СЧ-2026-00145", date: "24.04.2026", status: "Готов к отгрузке", amount: 156800, isNew: true },
    { id: 2, number: "СЧ-2026-00144", date: "23.04.2026", status: "В процессе отгрузки", amount: 234700, isNew: true },
    { id: 3, number: "СЧ-2026-00143", date: "23.04.2026", status: "Ожидается оплата", amount: 89500, isNew: false },
  ];

  return (
    <div className="space-y-5 lg:space-y-6">

      {/* ══════════════════════════════════════════════════════════════════
          БЛОК: МОНИТОРИНГ СОГЛАШЕНИЯ — двухколонный макет
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* ── Левая колонка: скидка + рекомендации ──────────────────── */}
        <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 space-y-3">

          {/* Карточка прогноза скидки */}
          <Link
            to="/quarter-discount"
            className={`flex items-center gap-4 bg-white rounded-3xl border p-5 hover:shadow-md transition-shadow group ${
              hasBlockedBlock ? "border-red-200" : hasRiskBlock ? "border-amber-200" : "border-gray-200"
            }`}
          >
            {/* Donut chart — r=28, C=2π×28≈175.93 */}
            <svg className="flex-shrink-0" width="84" height="84" viewBox="0 0 80 80">
              {/* background ring */}
              <circle cx="40" cy="40" r="28" fill="none" stroke="#f3f4f6" strokeWidth="10" />
              {/* earned arc */}
              {s.discountValue > 0 && (
                <circle
                  cx="40" cy="40" r="28" fill="none"
                  stroke={hasBlockedBlock ? "#ef4444" : hasRiskBlock ? "#f59e0b" : "#2563eb"}
                  strokeWidth="10"
                  strokeDasharray={`${(Math.min(s.discountValue / s.maxDiscount, 0.9999) * 175.93).toFixed(1)} 175.93`}
                  strokeDashoffset="0"
                  transform="rotate(-90 40 40)"
                />
              )}
              {/* potential arc — starts where earned ends: dashoffset = C − earnedLen */}
              {s.potential > 0 && s.discountValue < s.maxDiscount && (
                <circle
                  cx="40" cy="40" r="28" fill="none"
                  stroke={hasBlockedBlock ? "#fca5a5" : hasRiskBlock ? "#fde68a" : "#93c5fd"}
                  strokeWidth="10"
                  strokeDasharray={`${((s.potential / s.maxDiscount) * 175.93).toFixed(1)} ${(175.93 - (s.potential / s.maxDiscount) * 175.93).toFixed(1)}`}
                  strokeDashoffset={`${(175.93 * (1 - s.discountValue / s.maxDiscount)).toFixed(1)}`}
                  transform="rotate(-90 40 40)"
                />
              )}
              <text x="40" y="37" textAnchor="middle" fill="#111827"
                style={{ fontSize: "14px", fontWeight: "800", fontFamily: "Inter, sans-serif" }}>
                {s.discountValue}%
              </text>
              <text x="40" y="52" textAnchor="middle" fill="#9ca3af"
                style={{ fontSize: "9px", fontFamily: "Inter, sans-serif" }}>
                из {s.maxDiscount}%
              </text>
            </svg>

            {/* Legend */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="text-xs font-semibold text-gray-400 mb-1">Прогноз квартальной скидки</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: hasBlockedBlock ? "#ef4444" : hasRiskBlock ? "#f59e0b" : "#2563eb" }} />
                <span className="text-xs text-gray-700">Прогноз: <span className="font-bold text-gray-900">{s.discountValue}%</span></span>
              </div>
              {s.potential > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: hasBlockedBlock ? "#fca5a5" : hasRiskBlock ? "#fde68a" : "#93c5fd" }} />
                  <span className="text-xs text-gray-700">
                    Потенциал: <span className={`font-bold ${hasBlockedBlock ? "text-red-500" : hasRiskBlock ? "text-amber-500" : "text-blue-500"}`}>+{s.potential}%</span>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-gray-200" />
                <span className="text-xs text-gray-400">Максимум: {s.maxDiscount}%</span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 self-center" />
          </Link>

          {/* Блок рекомендаций */}
          {s.recs.length > 0 && (
            <div className={`bg-white rounded-3xl border p-4 ${
              hasBlockedBlock ? "border-red-200" : hasRiskBlock ? "border-amber-200" : "border-gray-200"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">Обратите внимание</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  hasBlockedBlock ? "bg-red-100 text-red-700" : hasRiskBlock ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {s.recs.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {s.recs.map((rec, i) => (
                  <Link
                    key={i}
                    to="/quarter-discount"
                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-medium transition-colors group ${
                      hasBlockedBlock
                        ? "bg-red-50 text-red-900 hover:bg-red-100"
                        : hasRiskBlock
                        ? "bg-amber-50 text-amber-900 hover:bg-amber-100"
                        : "bg-blue-50 text-blue-900 hover:bg-blue-100"
                    }`}
                  >
                    <Star className={`w-3 h-3 flex-shrink-0 ${hasBlockedBlock ? "text-red-500" : hasRiskBlock ? "text-amber-500" : "text-blue-500"}`} />
                    <span className="flex-1 truncate">{rec}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Правая колонка: метрики ────────────────────────────────── */}
        <div className="flex-1 min-w-0 bg-white rounded-3xl border border-gray-200">
          {/* Шапка с переключателем */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-end gap-3">
            <div className="inline-flex rounded-2xl bg-gray-100 p-0.5">
              <button
                type="button"
                onClick={() => setPeriod("month")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  period === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Май
              </button>
              <button
                type="button"
                onClick={() => setPeriod("quarter")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  period === "quarter" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                2 квартал
              </button>
            </div>
          </div>

          {/* Карточки метрик 2×2 */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: "План сбыта / Sell-Out",
                value: m.sellOut,
                pct: m.sellOutPct,
                discountBlock: "Выполнение плана сбыта",
              },
              {
                title: "План закупок / Sell-In",
                value: m.sellIn,
                pct: m.sellInPct,
                discountBlock: "Выполнение плана закупок",
              },
              {
                title: "Линейки сбыта / Sell-Out",
                value: m.sellOutLines,
                pct: null,
                discountBlock: "Соотношение линеек сбыта",
              },
              {
                title: "Линейки закупок / Sell-In",
                value: m.sellInLines,
                pct: null,
                discountBlock: "Соотношение линеек закупок",
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div className="text-xs font-semibold text-gray-500 mb-1">{card.title}</div>
                <div className="flex items-end justify-between gap-2 mb-2">
                  <span className="text-xl font-black text-gray-900">{card.value}</span>
                  {card.pct !== null && (
                    <span className={`text-sm font-bold pb-0.5 ${pctTextColor(card.pct)}`}>{card.pct}%</span>
                  )}
                </div>
                {card.pct !== null ? (
                  <div className="mb-2.5">
                    {/* Полоса прогресса — шкала растянута до 110% плана */}
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${pctBarColor(card.pct)}`}
                        style={{ width: `${Math.min(card.pct, 110) / 110 * 100}%` }}
                      />
                    </div>
                    {/* Отметки 90 / 100 / 110 % */}
                    <div className="relative mt-1" style={{ height: 18 }}>
                      {([90, 100, 110] as const).map((ms) => (
                        <div
                          key={ms}
                          className="absolute flex flex-col items-center"
                          style={{ left: `${(ms / 110) * 100}%`, transform: "translateX(-50%)" }}
                        >
                          <div className="w-px h-1.5 bg-gray-300" />
                          <span className="text-[9px] leading-none text-gray-400 mt-0.5 whitespace-nowrap">
                            {ms}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-2" />
                )}
                <div className="flex items-center gap-3">
                  <Link
                    to="/quarter-discount"
                    className="text-xs font-medium text-gray-400 hover:text-blue-600 hover:underline underline-offset-2 transition-colors"
                  >
                    Влияние на скидку
                  </Link>
                  <Link
                    to="/analytics"
                    className="text-xs font-medium text-gray-400 hover:text-blue-600 hover:underline underline-offset-2 transition-colors"
                  >
                    Аналитика
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════
          НИЖНИЙ КОНТЕНТ: Новости / Финансы / Отгрузки / Заказы
      ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">

        {/* Новости */}
        <div className="bg-white rounded-3xl border border-gray-200">
          <div className="px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Новости</h2>
            </div>
            <Link to="/news" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Все →
            </Link>
          </div>
          <div className="p-4 lg:p-5 space-y-3">
            {newsItems.map((news) => (
              <div key={news.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs text-gray-400">{news.date}</span>
                  {news.isNew && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Новое</span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm">{news.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{news.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Финансы */}
        <div className="bg-white rounded-3xl border border-gray-200">
          <div className="px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Финансы</h2>
            </div>
            <Link to="/finances" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Подробнее →
            </Link>
          </div>
          <div className="p-4 lg:p-5 space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              {shippedWithoutPayment > 0 && (
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="text-xs text-gray-400 font-medium block mb-1">Ближайший дедлайн</span>
                  <span className="font-semibold text-sm text-gray-900">{nearestDeadline}</span>
                </div>
              )}
              {shippedWithoutPayment > 0 && (
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="text-xs text-gray-400 font-medium block mb-1">Отгружено без оплаты</span>
                  <span className="font-semibold text-sm text-gray-900">{shippedWithoutPayment.toLocaleString()} ₽</span>
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="text-xs text-gray-400 font-medium block mb-1">Кредитный лимит</span>
                <span className="font-semibold text-sm text-gray-900">{creditLimit.toLocaleString()} ₽</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="text-xs text-gray-400 font-medium block mb-1">Глубина кредита</span>
                <span className="font-semibold text-sm text-gray-900">{creditDepth} дней</span>
              </div>
              {balance > 0 && (
                <div className="p-3 bg-blue-50 rounded-2xl col-span-2">
                  <span className="text-xs text-gray-400 font-medium block mb-1">Сальдо</span>
                  <span className="font-semibold text-sm text-blue-600">Переплата {balance.toLocaleString()} ₽</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              financialStatus.type === 'critical' ? 'bg-red-50 border-red-200' :
              financialStatus.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              'bg-green-50 border-green-200'
            }`}>
              {financialStatus.type === 'critical' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
              {financialStatus.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
              {financialStatus.type === 'normal' && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
              <span className={`text-xs font-medium ${
                financialStatus.type === 'critical' ? 'text-red-800' :
                financialStatus.type === 'warning' ? 'text-amber-800' : 'text-green-800'
              }`}>{financialStatus.message}</span>
            </div>
          </div>
        </div>

        {/* Последние отгрузки */}
        <div className="bg-white rounded-3xl border border-gray-200">
          <div className="px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Последние отгрузки</h2>
            </div>
            <Link to="/shipments" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Все →</Link>
          </div>
          <div className="p-4 lg:p-5 space-y-2">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-xs text-gray-900">{shipment.number}</span>
                    {shipment.isNew && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Новая</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{shipment.date}</span>
                </div>
                <span className="font-semibold text-xs text-gray-900">{shipment.amount.toLocaleString()} ₽</span>
              </div>
            ))}
          </div>
        </div>

        {/* Последние заказы */}
        <div className="bg-white rounded-3xl border border-gray-200">
          <div className="px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Последние заказы</h2>
            </div>
            <Link to="/new-orders" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Все →</Link>
          </div>
          <div className="p-4 lg:p-5 space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-gray-900">{order.number}</span>
                    {order.isNew && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Новый</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{order.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{order.status}</span>
                  <span className="font-semibold text-xs text-gray-900">{order.amount.toLocaleString()} ₽</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
