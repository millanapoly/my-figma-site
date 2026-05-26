import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function DiscountDetails() {
  const currentConditions = [
    { name: "БДО (Sell-In)", target: "110%", current: "57,14%", status: "warning", description: "Необходимо закупить еще 740 шт" },
    { name: "Продажи по линейкам", target: "Все линейки > 0%", current: "5 линеек = 0%", status: "critical", description: "Критично: нет закупок по 5 линейкам" },
    { name: "Минимальный объем заказа", target: "≥ 50 000₽", current: "Выполнено", status: "success", description: "Все заказы соответствуют минимуму" },
    { name: "Регулярность заказов", target: "Минимум 1 раз в месяц", current: "Выполнено", status: "success", description: "Заказы оформляются регулярно" },
  ];

  const forecastScenarios = [
    { level: "24%", conditions: "БДО 90% + все линейки > 0%", gap: "Текущий уровень" },
    { level: "26,5%", conditions: "БДО 100% + все линейки > 0%", gap: "Ваш текущий уровень" },
    { level: "28%", conditions: "БДО 110% + все линейки > 0%", gap: "Не хватает: 740 шт + 5 линеек" },
    { level: "30%", conditions: "БДО 120% + все линейки > 0% + бонусные условия", gap: "Не хватает: 1020 шт + 5 линеек + бонус" },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Вернуться на главную
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Скидка и выполнение дистрибьюторского соглашения</h1>
        <p className="text-gray-600">
          Детализация условий получения текущей скидки и прогноз на следующий квартал
        </p>
      </div>

      {/* Current Discount Status */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Текущая скидка</h2>
            <div className="text-5xl font-bold text-blue-600">26,5%</div>
            <div className="text-sm text-gray-500 mt-2">Действует с 01.04.2025 по 30.06.2025</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-2">Статус выполнения</div>
            <div className="inline-flex items-center px-4 py-2 rounded-3xl bg-yellow-100 text-yellow-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-semibold">Требуется внимание</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">Условия для текущего уровня скидки:</h3>
          {currentConditions.map((condition, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-3xl border-2 ${
                condition.status === "success"
                  ? "border-green-200 bg-green-50"
                  : condition.status === "warning"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {condition.status === "success" ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                ) : condition.status === "warning" ? (
                  <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{condition.name}</div>
                  <div className="flex items-center gap-4 text-sm mb-2">
                    <span className="text-gray-600">Требуется: <strong>{condition.target}</strong></span>
                    <span className="text-gray-600">Текущее: <strong>{condition.current}</strong></span>
                  </div>
                  <div className="text-sm text-gray-700">{condition.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast for Next Quarter */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Прогноз скидки на Q2 2025</h2>
        <p className="text-gray-600 mb-6">
          При сохранении текущих показателей ваша скидка в следующем квартале может составить:
        </p>

        <div className="space-y-3">
          {forecastScenarios.map((scenario, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-3xl border-2 ${
                scenario.level === "26,5%"
                  ? "border-blue-300 bg-blue-50"
                  : scenario.level === "28%"
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-gray-900">{scenario.level}</div>
                  <div>
                    <div className="font-medium text-gray-900">{scenario.conditions}</div>
                    <div className="text-sm text-gray-600 mt-1">{scenario.gap}</div>
                  </div>
                </div>
                {scenario.level === "26,5%" && (
                  <div className="px-3 py-1 rounded bg-blue-200 text-blue-800 text-sm font-semibold">
                    Текущий уровень
                  </div>
                )}
                {scenario.level === "28%" && (
                  <div className="px-3 py-1 rounded bg-blue-200 text-blue-800 text-sm font-semibold">
                    Рекомендуемая цель
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-3xl border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Важно:</strong> В конце квартала показатели могут многократно пересчитываться 
              из-за тендеров, срочных заказов и смещения сплитов. Следите за обновлениями в кабинете.
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl shadow-sm border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Рекомендуемые действия</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Закупить еще <strong>740 шт</strong> для достижения цели БДО 110%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Оформить заказы по <strong>5 критическим линейкам</strong> с нулевым выполнением</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Проверить рекомендации к закупке для оптимизации заказа</span>
          </li>
        </ul>
        <Link
          to="/recommendations"
          className="inline-flex items-center mt-4 px-6 py-3 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors font-semibold"
        >
          Перейти к рекомендациям
        </Link>
      </div>
    </div>
  );
}
