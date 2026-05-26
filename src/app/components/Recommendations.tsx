import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Download } from "lucide-react";

interface Recommendation {
  line: string;
  priority: "critical" | "high" | "medium";
  minQuantity: number;
  recommendedQuantity: number;
  reason: string;
  impact: string;
  suggestedSKUs: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export function Recommendations() {
  const recommendations: Recommendation[] = [
    {
      line: "БАЛК ФИЛЛ ФЛОУ",
      priority: "critical",
      minQuantity: 31,
      recommendedQuantity: 35,
      reason: "Нулевое выполнение по линейке. Без закупки потеряете скидку 2%",
      impact: "Критично для сохранения текущего уровня скидки",
      suggestedSKUs: [
        { name: "BULK FILL FLOW A1", quantity: 12, price: 2850 },
        { name: "BULK FILL FLOW A2", quantity: 12, price: 2850 },
        { name: "BULK FILL FLOW A3", quantity: 11, price: 2850 },
      ],
    },
    {
      line: "ЭСТЕЛАЙТ ПОСТЕРИОР",
      priority: "critical",
      minQuantity: 47,
      recommendedQuantity: 50,
      reason: "Нулевое выполнение по линейке. Без закупки потеряете скидку 3%",
      impact: "Критично для сохранения текущего уровня скидки",
      suggestedSKUs: [
        { name: "ESTELITE POSTERIOR A1", quantity: 17, price: 3200 },
        { name: "ESTELITE POSTERIOR A2", quantity: 17, price: 3200 },
        { name: "ESTELITE POSTERIOR A3", quantity: 16, price: 3200 },
      ],
    },
    {
      line: "БОНД ФОРС",
      priority: "critical",
      minQuantity: 39,
      recommendedQuantity: 40,
      reason: "Нулевое выполнение по линейке. Без закупки потеряете скидку 2,5%",
      impact: "Критично для сохранения текущего уровня скидки",
      suggestedSKUs: [
        { name: "BOND FORCE Kit", quantity: 40, price: 4500 },
      ],
    },
    {
      line: "ЭСТЕЛАЙТ АСТЕРНА",
      priority: "high",
      minQuantity: 70,
      recommendedQuantity: 80,
      reason: "Выполнение 58,8% (100 из 170). Нужно догнать план",
      impact: "Важно для улучшения общего показателя БДО",
      suggestedSKUs: [
        { name: "ESTELITE ASTERIA A1", quantity: 25, price: 3850 },
        { name: "ESTELITE ASTERIA A2", quantity: 30, price: 3850 },
        { name: "ESTELITE ASTERIA A3", quantity: 25, price: 3850 },
      ],
    },
    {
      line: "ЮНИВЕРСАЛ ФЛОУ",
      priority: "medium",
      minQuantity: 61,
      recommendedQuantity: 70,
      reason: "Выполнение 86,8% (401 из 462). Близко к цели",
      impact: "Поможет достичь целевого показателя по линейке",
      suggestedSKUs: [
        { name: "UNIVERSAL FLOW A1", quantity: 15, price: 2650 },
        { name: "UNIVERSAL FLOW A2", quantity: 25, price: 2650 },
        { name: "UNIVERSAL FLOW A3", quantity: 30, price: 2650 },
      ],
    },
  ];

  const totalRecommended = recommendations.reduce((sum, r) => sum + r.recommendedQuantity, 0);
  const totalCost = recommendations.reduce(
    (sum, r) => sum + r.suggestedSKUs.reduce((s, sku) => s + sku.quantity * sku.price, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Вернуться на главную
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Рекомендации к закупке</h1>
        <p className="text-gray-600">
          Персональные рекомендации по закупкам для выполнения условий дистрибьюторского соглашения
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-3xl shadow-sm border border-blue-200 p-6">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-blue-700 mb-1">Рекомендовано к закупке</div>
            <div className="text-4xl font-bold text-blue-900">{totalRecommended} шт</div>
          </div>
          <div>
            <div className="text-sm text-blue-700 mb-1">Ориентировочная стоимость</div>
            <div className="text-4xl font-bold text-blue-900">
              {totalCost.toLocaleString("ru-RU")} ₽
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-700 mb-1">Эффект</div>
            <div className="text-xl font-bold text-blue-900 mt-2">
              Сохранение скидки 26,5% + выполнение БДО на 110%
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-3xl shadow-sm border-2 overflow-hidden ${
              rec.priority === "critical"
                ? "border-red-300"
                : rec.priority === "high"
                ? "border-blue-300"
                : "border-yellow-300"
            }`}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 ${
                rec.priority === "critical"
                  ? "bg-red-50"
                  : rec.priority === "high"
                  ? "bg-blue-50"
                  : "bg-yellow-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-6 h-6 mt-0.5 ${
                      rec.priority === "critical"
                        ? "text-red-600"
                        : rec.priority === "high"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{rec.line}</h3>
                    <div className="text-sm text-gray-700 mb-2">{rec.reason}</div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${
                        rec.priority === "critical"
                          ? "bg-red-200 text-red-800"
                          : rec.priority === "high"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {rec.priority === "critical"
                        ? "КРИТИЧНО"
                        : rec.priority === "high"
                        ? "ВЫСОКИЙ ПРИОРИТЕТ"
                        : "СРЕДНИЙ ПРИОРИТЕТ"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Рекомендовано</div>
                  <div className="text-3xl font-bold text-gray-900">{rec.recommendedQuantity} шт</div>
                  <div className="text-sm text-gray-500">
                    (минимум: {rec.minQuantity} шт)
                  </div>
                </div>
              </div>
            </div>

            {/* Impact */}
            <div className="px-6 py-3 bg-blue-50 border-t border-gray-200">
              <div className="text-sm">
                <strong className="text-blue-900">Эффект:</strong>{" "}
                <span className="text-blue-800">{rec.impact}</span>
              </div>
            </div>

            {/* Suggested SKUs */}
            <div className="px-6 py-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">Рекомендуемые артикулы:</div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="text-left pb-2 font-semibold">Артикул</th>
                    <th className="text-center pb-2 font-semibold">Количество</th>
                    <th className="text-center pb-2 font-semibold">Цена за ед.</th>
                    <th className="text-right pb-2 font-semibold">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {rec.suggestedSKUs.map((sku, skuIdx) => (
                    <tr key={skuIdx} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 text-sm text-gray-900">{sku.name}</td>
                      <td className="py-2 text-center text-sm font-semibold text-gray-700">
                        {sku.quantity}
                      </td>
                      <td className="py-2 text-center text-sm text-gray-700">
                        {sku.price.toLocaleString("ru-RU")} ₽
                      </td>
                      <td className="py-2 text-right text-sm font-semibold text-gray-900">
                        {(sku.quantity * sku.price).toLocaleString("ru-RU")} ₽
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 font-semibold">
                    <td className="py-2 text-sm text-gray-900">Итого по линейке:</td>
                    <td className="py-2 text-center text-sm text-gray-900">
                      {rec.suggestedSKUs.reduce((sum, sku) => sum + sku.quantity, 0)}
                    </td>
                    <td></td>
                    <td className="py-2 text-right text-sm text-gray-900">
                      {rec.suggestedSKUs
                        .reduce((sum, sku) => sum + sku.quantity * sku.price, 0)
                        .toLocaleString("ru-RU")}{" "}
                      ₽
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Action Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl shadow-sm border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-4">Следующий шаг: оформление заказа</h3>
        <p className="text-sm text-blue-800 mb-4">
          Все рекомендации можно экспортировать в Excel-файл для формирования заказа. 
          В файле будут указаны актуальные остатки PROTECO, ваши остатки, цены с учетом скидки, 
          курс EUR и рекомендуемые объемы.
        </p>
        <div className="flex gap-4">
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors font-semibold">
            <Download className="w-5 h-5 mr-2" />
            Скачать Excel-шаблон заказа
          </button>
          <button className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-3xl hover:bg-blue-50 transition-colors font-semibold">
            Связаться с РМ
          </button>
        </div>
        <div className="mt-4 text-xs text-blue-700 bg-blue-100 p-3 rounded">
          <strong>Примечание:</strong> Excel-шаблон будет содержать все рекомендации с актуальными 
          данными на момент скачивания. Проверьте курс EUR и остатки перед финальным оформлением заказа.
        </div>
      </div>
    </div>
  );
}
