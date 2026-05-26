import {
  ArrowUpDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  FileText,
} from "lucide-react";
import { useState, useMemo } from "react";
import { financeScenarios, type ScenarioType } from "../utils/financeScenarios";

type SortField = "payDue" | "debt" | "realization" | "createdDate";

export function Finances() {
  const [sortBy, setSortBy] = useState<SortField>("payDue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showScenarioSwitcher, setShowScenarioSwitcher] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>("scenario1");

  const scenarios = financeScenarios;
  const scenario = scenarios[currentScenario];
  const { creditLimit, creditDepth } = scenario;
  const financialDocs = scenario.docs;

  // Общая задолженность
  const totalDebt = financialDocs.reduce((sum, doc) => sum + doc.debtAmount, 0);

  // Доступно кредита
  const availableCredit =
    currentScenario === "scenario3" ? 0 : Math.max(0, creditLimit - totalDebt);

  // Ближайший срок оплаты (строки с «не установлен» не участвуют)
  const nearestDeadline =
    financialDocs
      .filter((doc) => doc.payDueDate !== null)
      .map((doc) => doc.payDueDate as string)
      .sort((a, b) => {
        const da = new Date(a.split(".").reverse().join("-"));
        const db = new Date(b.split(".").reverse().join("-"));
        return da.getTime() - db.getTime();
      })[0] ?? null;

  // ── Финансовый статус ──────────────────────────────────────────────────────
  const getFinancialStatus = () => {
    // Сценарий 3: блокировка из-за просрочки — всегда критический
    if (currentScenario === "scenario3") {
      return {
        type: "critical" as const,
        message: "Отгрузка заблокирована из-за просрочки",
        sub: "Для возобновления отгрузок необходимо погасить просроченную задолженность",
      };
    }

    // Сценарий 2: предупреждение «До стоп-отгрузки X дней»
    // X — минимальное значение из строк со статусом «До стопа N дней» (только с установленным сроком)
    if (currentScenario === "scenario2") {
      const stopDays = financialDocs
        .filter((doc) => doc.payDueDate !== null && doc.riskStatus.startsWith("До стопа"))
        .map((doc) => {
          const m = doc.riskStatus.match(/До стопа (\d+)/);
          return m ? parseInt(m[1]) : null;
        })
        .filter((d): d is number => d !== null);

      const x = stopDays.length > 0 ? Math.min(...stopDays) : 4;
      const label = x === 1 ? "день" : x <= 4 ? "дня" : "дней";

      return {
        type: "warning" as const,
        message: `До стоп-отгрузки ${x} ${label}`,
        sub: "Успейте погасить задолженность до дедлайна",
      };
    }

    // Сценарий 1: просроченных платежей нет
    return {
      type: "normal" as const,
      message: "Просроченных платежей нет",
      sub: null,
    };
  };

  const financialStatus = getFinancialStatus();
  const isOverdue =
    financialStatus.type === "critical" &&
    financialStatus.message.includes("просрочки");

  // ── Сортировка ─────────────────────────────────────────────────────────────
  const sortedDocs = useMemo(() => {
    const result = [...financialDocs];

    result.sort((a, b) => {
      // Сначала критичные строки
      const critOrder = ["Просрочено"];
      const aCrit = critOrder.includes(a.riskStatus);
      const bCrit = critOrder.includes(b.riskStatus);
      if (aCrit && !bCrit) return -1;
      if (!aCrit && bCrit) return 1;

      let cmp = 0;
      switch (sortBy) {
        case "payDue": {
          if (!a.payDueDate && !b.payDueDate) { cmp = 0; break; }
          if (!a.payDueDate) { cmp = 1; break; } // "не установлен" — в конец
          if (!b.payDueDate) { cmp = -1; break; }
          const da = new Date(a.payDueDate.split(".").reverse().join("-"));
          const db = new Date(b.payDueDate.split(".").reverse().join("-"));
          cmp = da.getTime() - db.getTime();
          break;
        }
        case "debt":
          cmp = a.debtAmount - b.debtAmount;
          break;
        case "realization":
          cmp = a.realization.localeCompare(b.realization, "ru");
          break;
        case "createdDate": {
          const da = new Date(a.createdDate.split(".").reverse().join("-"));
          const db = new Date(b.createdDate.split(".").reverse().join("-"));
          cmp = da.getTime() - db.getTime();
          break;
        }
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [financialDocs, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getRiskBadge = (status: string) => {
    if (status === "Норма") return "bg-green-100 text-green-800 border border-green-200";
    if (status.startsWith("До стопа")) return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    if (status === "Просрочено") return "bg-red-100 text-red-800 border border-red-200";
    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const SortTh = ({
    field,
    label,
    align = "left",
    className = "",
  }: {
    field: SortField;
    label: string;
    align?: "left" | "right";
    className?: string;
  }) => (
    <th
      className={`px-4 py-3.5 text-${align} text-sm font-semibold cursor-pointer hover:bg-blue-800 select-none ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
        {label}
        <ArrowUpDown
          className={`w-3.5 h-3.5 flex-shrink-0 ${sortBy === field ? "opacity-100" : "opacity-40"}`}
        />
      </div>
    </th>
  );

  return (
    <div className="space-y-7">

      {/* ── Заголовок + переключатель сценариев ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Финансы</h1>
          <p className="text-gray-500 text-sm mt-1">Кредитный лимит и задолженность</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowScenarioSwitcher(!showScenarioSwitcher)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            <Settings className="w-4 h-4" />
            Сценарий: {scenario.name}
          </button>

          {showScenarioSwitcher && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Демо-сценарии
                </p>
                <div className="space-y-1.5">
                  {(Object.keys(scenarios) as ScenarioType[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrentScenario(key);
                        setShowScenarioSwitcher(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                        currentScenario === key
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {scenarios[key].name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Алерт-баннер ── */}
      <div
        className={`rounded-3xl px-6 py-4 border flex items-start gap-3 ${
          financialStatus.type === "critical"
            ? "bg-red-50 border-red-200"
            : financialStatus.type === "warning"
            ? "bg-yellow-50 border-yellow-300"
            : "bg-green-50 border-green-200"
        }`}
      >
        {financialStatus.type === "critical" && (
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}
        {financialStatus.type === "warning" && (
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        )}
        {financialStatus.type === "normal" && (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <div
            className={`font-semibold text-sm ${
              financialStatus.type === "critical"
                ? "text-red-900"
                : financialStatus.type === "warning"
                ? "text-yellow-900"
                : "text-green-900"
            }`}
          >
            {financialStatus.message}
          </div>
          {financialStatus.sub && (
            <div
              className={`text-xs mt-0.5 ${
                financialStatus.type === "critical"
                  ? "text-red-700"
                  : "text-yellow-700"
              }`}
            >
              {financialStatus.type === "warning"
                ? "Успейте погасить задолженность до дедлайна"
                : financialStatus.sub}
            </div>
          )}
        </div>
      </div>

      {/* ── Карточки показателей ── */}
      <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
        {/* Кредитный лимит */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200">
          <div className="text-xs font-medium text-gray-500 mb-2 leading-tight">
            Кредитный лимит
          </div>
          <div className="text-xl font-bold text-gray-900">
            {creditLimit.toLocaleString()} ₽
          </div>
        </div>

        {/* Глубина кредита */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200">
          <div className="text-xs font-medium text-gray-500 mb-2 leading-tight">
            Глубина кредита
          </div>
          <div className="text-xl font-bold text-gray-900">{creditDepth} дней</div>
        </div>

        {/* Доступно кредита */}
        <div
          className={`rounded-3xl p-5 border ${
            availableCredit === 0
              ? "bg-red-50 border-red-200"
              : availableCredit < creditLimit * 0.2
              ? "bg-yellow-50 border-yellow-200"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="text-xs font-medium text-gray-500 mb-2 leading-tight">
            Доступно кредита
          </div>
          <div
            className={`text-xl font-bold ${
              availableCredit === 0
                ? "text-red-600"
                : availableCredit < creditLimit * 0.2
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {availableCredit.toLocaleString()} ₽
          </div>
        </div>

        {/* Отгружено без оплаты */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200">
          <div className="text-xs font-medium text-gray-500 mb-2 leading-tight">
            Отгружено без оплаты
          </div>
          <div className="text-xl font-bold text-gray-900">
            {totalDebt.toLocaleString()} ₽
          </div>
        </div>

        {/* Ближайший срок оплаты (только если есть задолженность и дата) */}
        {totalDebt > 0 && nearestDeadline && (
          <div
            className={`rounded-3xl p-5 border ${
              isOverdue ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
            }`}
          >
            <div className="text-xs font-medium text-gray-500 mb-2 leading-tight">
              Ближайший срок оплаты
            </div>
            <div
              className={`text-xl font-bold ${
                isOverdue ? "text-red-600" : "text-gray-900"
              }`}
            >
              {nearestDeadline}
            </div>
          </div>
        )}

        {/* Переплата / Сальдо — показывается только в сценарии «Просроченных платежей нет» если balance > 0 */}
        {scenario.balance > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5">
            <div className="text-xs font-medium text-gray-500 mb-2 leading-tight">
              Переплата (сальдо)
            </div>
            <div className="text-xl font-bold text-blue-600">
              +{scenario.balance.toLocaleString()} ₽
            </div>
          </div>
        )}
      </div>

      {/* ── Таблица задолженности ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-700 text-white">
              <tr>
                {/* 1. Реализация */}
                <SortTh field="realization" label="Реализация" className="min-w-72" />
                {/* 2. Счёт */}
                <th className="px-4 py-3.5 text-left text-sm font-semibold whitespace-nowrap">Скачать счёт</th>
                {/* 3. Дата возникновения */}
                <SortTh field="createdDate" label="Дата возникновения" className="whitespace-nowrap" />
                {/* 4. Срок оплаты (бывш. «Оплатить до») */}
                <SortTh field="payDue" label="Срок оплаты" className="whitespace-nowrap" />
                {/* 5. Сумма задолженности */}
                <SortTh field="debt" label="Сумма задолженности" align="right" className="whitespace-nowrap" />
                {/* 6. Статус риска */}
                <th className="px-4 py-3.5 text-left text-sm font-semibold whitespace-nowrap">
                  Статус риска
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Открытой задолженности нет
                  </td>
                </tr>
              ) : (
                sortedDocs.map((doc, index) => {
                  const isOverdueRow = doc.riskStatus === "Просрочено";
                  const isWarnRow = doc.riskStatus.startsWith("До стопа");
                  const isNoDate = doc.payDueDate === null;

                  return (
                    <tr
                      key={index}
                      className={`transition-colors hover:bg-gray-50/50 ${
                        isOverdueRow
                          ? "bg-red-50/60"
                          : isWarnRow
                          ? "bg-yellow-50/60"
                          : index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50/40"
                      }`}
                    >
                      {/* Реализация */}
                      <td className="px-4 py-3.5 text-sm text-gray-900 min-w-72">
                        {doc.realization}
                      </td>

                      {/* Счёт — скачивание PDF */}
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                        {doc.invoiceNumber ? (
                          <button
                            onClick={() =>
                              alert(`Скачать счёт PDF: ${doc.invoiceNumber}`)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 font-medium transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {doc.invoiceNumber}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Дата возникновения */}
                      <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                        {doc.createdDate}
                      </td>

                      {/* Срок оплаты */}
                      <td
                        className={`px-4 py-3.5 text-sm whitespace-nowrap font-medium ${
                          isOverdueRow
                            ? "text-red-700"
                            : isNoDate
                            ? "text-gray-400"
                            : "text-gray-900"
                        }`}
                      >
                        {isNoDate ? "не установлен" : doc.payDueDate}
                      </td>

                      {/* Сумма задолженности */}
                      <td className="px-4 py-3.5 text-sm text-right font-semibold text-gray-900 whitespace-nowrap">
                        {doc.debtAmount.toLocaleString()} ₽
                      </td>

                      {/* Статус риска */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-semibold ${getRiskBadge(
                            doc.riskStatus
                          )}`}
                        >
                          {doc.riskStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {sortedDocs.length > 0 && (
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div>
            Строк задолженности:{" "}
            <span className="font-medium text-gray-600">{sortedDocs.length}</span>
          </div>
          <div>
            Итого:{" "}
            <span className="font-medium text-gray-700">
              {totalDebt.toLocaleString()} ₽
            </span>
          </div>
        </div>
      )}
    </div>
  );
}