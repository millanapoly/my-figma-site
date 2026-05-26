import { useState } from "react";
import { X, Download, Warehouse, Package, BarChart3 } from "lucide-react";

const SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/1P28HzcIOi5CVTaVA871QmC2gk7vI1hj0/edit?gid=1367378683#gid=1367378683";

interface Props {
  onClose: () => void;
}

export function OrderBlankModal({ onClose }: Props) {
  const [warehouses, setWarehouses] = useState<string[]>(["Москва"]);
  const [useStock, setUseStock] = useState<"yes" | "no">("yes");
  const [planMode, setPlanMode] = useState<"no-plan" | "plan">("no-plan");
  const [period, setPeriod] = useState<"quarter" | "month">("quarter");
  const [target, setTarget] = useState("100");

  const toggleWarehouse = (name: string) => {
    setWarehouses((cur) => {
      if (cur.includes(name)) {
        return cur.length === 1 ? cur : cur.filter((w) => w !== name);
      }
      return [...cur, name];
    });
  };

  const handleDownload = () => {
    window.open(SHEETS_URL, "_blank", "noopener,noreferrer");
  };

  const selectedBase =
    "border-blue-600 bg-blue-600 text-white shadow-sm";
  const unselectedBase =
    "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-7 py-5 border-b border-gray-100 bg-blue-50/40">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Download className="w-4 h-4" />
              </span>
              <h1 className="text-lg font-semibold text-gray-900">
                Параметры бланка заказа
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-gray-500 ml-12">
              Выберите параметры для формирования бланка заказа.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-7 max-h-[70vh] overflow-y-auto">

          {/* Section 1 — Склад */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Warehouse className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-sm font-semibold text-gray-900">
                С какого склада планируется отгрузка?
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Москва", "Санкт-Петербург", "Новосибирск"].map((name) => {
                const sel = warehouses.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleWarehouse(name)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${sel ? selectedBase : unselectedBase}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{name}</span>
                      <span
                        className={`h-4.5 w-4.5 rounded-lg border flex items-center justify-center text-xs flex-shrink-0 ${
                          sel
                            ? "border-white bg-white text-blue-600"
                            : "border-gray-300"
                        }`}
                        style={{ width: 18, height: 18 }}
                      >
                        {sel && "✓"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2 — Запасы */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Package className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-sm font-semibold text-gray-900">
                Учитывать запасы на вашем складе?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { val: "yes", label: "Да", sub: "Бланк заказа с учётом запасов" },
                  { val: "no", label: "Нет", sub: "Бланк заказа без учёта запасов" },
                ] as const
              ).map(({ val, label, sub }) => {
                const sel = useStock === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setUseStock(val)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${sel ? selectedBase : unselectedBase}`}
                  >
                    <div className="text-sm font-medium">{label}</div>
                    <div className={`mt-1 text-xs ${sel ? "text-blue-100" : "text-gray-500"}`}>
                      {sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3 — План закупок */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <BarChart3 className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-sm font-semibold text-gray-900">
                План закупок
              </h2>
            </div>
            <p className="text-xs text-gray-500 -mt-1">Учитывать план закупок?</p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { val: "no-plan", label: "Нет", sub: "Бланк заказа без учёта планов" },
                  { val: "plan", label: "Выполнять план", sub: "Добавить расчёт до цели" },
                ] as const
              ).map(({ val, label, sub }) => {
                const sel = planMode === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPlanMode(val)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${sel ? selectedBase : unselectedBase}`}
                  >
                    <div className="text-sm font-medium">{label}</div>
                    <div className={`mt-1 text-xs ${sel ? "text-blue-100" : "text-gray-500"}`}>
                      {sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 4 — Детали плана (conditional) */}
          {planMode === "plan" && (
            <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  За какой период выполнять план?
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(
                    [
                      { val: "quarter", label: "Квартал" },
                      { val: "month", label: "Месяц" },
                    ] as const
                  ).map(({ val, label }) => (
                    <label
                      key={val}
                      className={`cursor-pointer rounded-2xl border px-4 py-3 flex items-center gap-3 transition-all ${
                        period === val
                          ? "border-blue-600 bg-white shadow-sm"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="period"
                        value={val}
                        checked={period === val}
                        onChange={() => setPeriod(val)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  На сколько выполнить план?
                </h3>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {["70", "90", "100", "110"].map((val) => {
                    const sel = target === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTarget(val)}
                        className={`rounded-2xl border py-3 text-sm font-semibold transition-all ${
                          sel ? selectedBase : unselectedBase
                        }`}
                      >
                        {val}%
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-blue-100 px-4 py-3 text-xs text-gray-600">
                В бланк заказа будет добавлен блок:{" "}
                <span className="font-semibold text-gray-900">
                  «До {target}% плана {period === "quarter" ? "квартала" : "месяца"}, шт»
                </span>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-white hover:border-gray-300 transition-colors"
          >
            Отмена
          </button>
          <button
            disabled={warehouses.length === 0}
            onClick={handleDownload}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
              warehouses.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
          >
            <Download className="w-4 h-4" />
            Скачать
          </button>
        </div>
      </div>
    </div>
  );
}
