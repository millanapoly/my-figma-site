import { useState, useRef, useEffect } from "react";
import {
  Info,
  ChevronDown,
  Check,
  Calendar,
  X,
} from "lucide-react";
import chartSellIn from "../../imports/chart_plan_fact_sell_in.png";
import chartSellOut from "../../imports/chart_plan_fact_sell_out.png";
import chartComparison from "../../imports/chart_sell_in_sell_out_comparison.png";

const QUICK_PERIODS = [
  {
    id: "curr_year",
    label: "Текущий год",
    range: "01.01.2026 – 31.12.2026",
  },
  {
    id: "prev_quarter",
    label: "Предыдущий квартал",
    range: "01.01.2026 – 31.03.2026",
  },
  {
    id: "curr_quarter",
    label: "Текущий квартал",
    range: "01.04.2026 – 30.06.2026",
  },
  {
    id: "last5",
    label: "Последние 5 кварталов",
    range: "01.04.2025 – 30.06.2026",
  },
];

const DETAIL_OPTIONS = ["Месяц", "Квартал"];

const LINEYKI = [
  "Все линейки",
  "🎯 ЭСТЕЛАЙТ АСТЕРИА",
  "🎯 ЮНИВЕРСАЛ ФЛОУ",
  "🎯 БАЛК ФИЛЛ ФЛОУ",
  "🎯 ЭСТЕЛАЙТ ПОСТЕРИОР",
  "🎯 БОНД ФОРС",
  "🎯 БОНД УНИВЕРСАЛ II ТОКУЯМА",
  "ЭСТЕЛАЙТ СИГМА КВИК"]
  
  function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      )
        onClose();
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));

  return (
    <div className="flex items-center gap-2 relative" ref={ref}>
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {label}
      </span>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 hover:border-gray-400 transition-colors min-w-[120px]"
      >
        <span className="flex-1 text-left truncate">
          {value}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px] py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-blue-50 transition-colors text-left"
            >
              <span className="w-4 flex-shrink-0">
                {opt === value && (
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                )}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DatePickerOverlay({
  value,
  onApply,
  onClose,
}: {
  value: string;
  onApply: (range: string) => void;
  onClose: () => void;
}) {
  const [from, setFrom] = useState(value.split(" – ")[0] ?? "");
  const [to, setTo] = useState(value.split(" – ")[1] ?? "");
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, onClose);

  return (
    <div
      className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-5 w-72"
      ref={ref}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-800">
          Выберите период
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Дата начала
          </label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="дд.мм.гггг"
            className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Дата окончания
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="дд.мм.гггг"
            className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setFrom("");
            setTo("");
          }}
          className="flex-1 h-9 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Сбросить
        </button>
        <button
          onClick={() => {
            if (from && to) onApply(`${from} – ${to}`);
            onClose();
          }}
          className="flex-1 h-9 bg-[#0B3D67] text-white rounded-lg text-sm hover:bg-[#0a3258] transition-colors"
        >
          Применить
        </button>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden flex flex-col">
      <div className="px-5 py-3 border-b border-[#E3E8EF]">
        <span className="text-sm font-medium text-[#1F2A44]">
          {title}
        </span>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

export function Analytics() {
  const [activePeriod, setActivePeriod] = useState("last5");
  const [periodText, setPeriodText] = useState(
    "01.04.2025 – 30.06.2026",
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [detail, setDetail] = useState("Квартал");
  const [lineyka, setLineyka] = useState("Все линейки");
  const [showTooltip, setShowTooltip] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  useOutsideClick(tooltipRef, () => setShowTooltip(false));

  const handleQuickPeriod = (id: string, range: string) => {
    setActivePeriod(id);
    setPeriodText(range);
    setShowDatePicker(false);
  };

  return (
    <div
      className="min-h-full"
      style={{ background: "#F6F8FA" }}
    >
      {/* Page title */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-[#1F2A44]">
          Аналитика продаж
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E3E8EF] rounded-xl px-5 py-3 mb-6 flex items-center gap-4 flex-wrap">
        {/* Period field */}
        <div
          className="flex items-center gap-2 relative"
          ref={periodRef}
        >
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Период
          </span>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 hover:border-gray-400 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{periodText}</span>
          </button>
          {showDatePicker && (
            <DatePickerOverlay
              value={periodText}
              onApply={(range) => {
                setPeriodText(range);
                setActivePeriod("");
              }}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

        {/* Quick period buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleQuickPeriod(p.id, p.range)}
              className={`h-9 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activePeriod === p.id
                  ? "bg-[#0B3D67] text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

        {/* Детализация */}
        <Dropdown
          label="Детализация"
          value={detail}
          options={DETAIL_OPTIONS}
          onChange={setDetail}
        />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

        {/* Линейка */}
        <Dropdown
          label="Линейка"
          value={lineyka}
          options={LINEYKI}
          onChange={setLineyka}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Info icon */}
        <div className="relative" ref={tooltipRef}>
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Info className="w-4.5 h-4.5 text-gray-400" />
          </button>
          {showTooltip && (
            <div className="absolute top-full mt-2 right-0 bg-[#1F2A44] text-white text-xs rounded-lg px-4 py-3 shadow-lg z-50 w-72">
              При выборе линейки графики пересчитываются по
              линейкам.
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="flex flex-col gap-5">
        {/* Top row: 2 cards */}
        <div className="grid grid-cols-2 gap-5">
          <ChartCard title="Выполнение закупок">
            <img
              src={chartSellIn}
              alt="План/Факт Sell-In"
              className="w-full h-full object-contain"
              style={{ minHeight: 280 }}
            />
          </ChartCard>
          <ChartCard title="Выполнение сбыта">
            <img
              src={chartSellOut}
              alt="План/Факт Sell-Out"
              className="w-full h-full object-contain"
              style={{ minHeight: 280 }}
            />
          </ChartCard>
        </div>

        {/* Bottom row: wide card */}
        <ChartCard title="Сравнение факта закупок и сбыта">
          <img
            src={chartComparison}
            alt="Сравнение Sell-In / Sell-Out"
            className="w-full h-full object-contain"
            style={{ minHeight: 280 }}
          />
        </ChartCard>
      </div>
    </div>
  );
}