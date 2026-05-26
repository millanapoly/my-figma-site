import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ProductLine {
  name: string;
  limit: string;
  plan: number;
  fact: number;
  factPercent: number;
  deviation: number;
  remaining: number;
  status: "success" | "warning" | "critical";
  skus?: Array<{
    name: string;
    plan: number;
    fact: number;
  }>;
}

export function ProductLines() {
  const [expandedLine, setExpandedLine] = useState<string | null>(null);

  const productLines: ProductLine[] = [
    {
      name: "ЭСТЕЛАЙТ АСТЕРНА",
      limit: "11%",
      plan: 170,
      fact: 100,
      factPercent: 6.45,
      deviation: -4.51,
      remaining: 70,
      status: "warning",
      skus: [
        { name: "ESTELITE ASTERIA A1", plan: 50, fact: 30 },
        { name: "ESTELITE ASTERIA A2", plan: 60, fact: 40 },
        { name: "ESTELITE ASTERIA A3", plan: 60, fact: 30 },
      ],
    },
    {
      name: "ЮНИВЕРСАЛ ФЛОУ",
      limit: "30%",
      plan: 462,
      fact: 401,
      factPercent: 26.04,
      deviation: -3.96,
      remaining: 61,
      status: "warning",
      skus: [
        { name: "UNIVERSAL FLOW A1", plan: 150, fact: 140 },
        { name: "UNIVERSAL FLOW A2", plan: 162, fact: 141 },
        { name: "UNIVERSAL FLOW A3", plan: 150, fact: 120 },
      ],
    },
    {
      name: "БАЛК ФИЛЛ ФЛОУ",
      limit: "2%",
      plan: 31,
      fact: 0,
      factPercent: 0.0,
      deviation: -2.0,
      remaining: 31,
      status: "critical",
      skus: [
        { name: "BULK FILL FLOW A1", plan: 10, fact: 0 },
        { name: "BULK FILL FLOW A2", plan: 11, fact: 0 },
        { name: "BULK FILL FLOW A3", plan: 10, fact: 0 },
      ],
    },
    {
      name: "ЭСТЕЛАЙТ ПОСТЕРИОР",
      limit: "3%",
      plan: 47,
      fact: 0,
      factPercent: 0.0,
      deviation: -3.0,
      remaining: 47,
      status: "critical",
      skus: [
        { name: "ESTELITE POSTERIOR A1", plan: 15, fact: 0 },
        { name: "ESTELITE POSTERIOR A2", plan: 17, fact: 0 },
        { name: "ESTELITE POSTERIOR A3", plan: 15, fact: 0 },
      ],
    },
    {
      name: "БОНД ФОРС",
      limit: "2,50%",
      plan: 39,
      fact: 0,
      factPercent: 0.0,
      deviation: -2.5,
      remaining: 39,
      status: "critical",
    },
    {
      name: "БОНД ЮНИВЕРСАЛ II КЛЕЙМКС",
      limit: "0,80%",
      plan: 13,
      fact: 16,
      factPercent: 1.04,
      deviation: 0.24,
      remaining: -3,
      status: "success",
    },
  ];

  const toggleLine = (lineName: string) => {
    setExpandedLine(expandedLine === lineName ? null : lineName);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Вернуться на главную
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">БДО, фокусные линейки и SKU</h1>
        <p className="text-gray-600">
          Детализация выполнения плана по линейкам и конкретным артикулам
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Общий план</div>
            <div className="text-3xl font-bold text-gray-900">1540 шт</div>
            <div className="text-sm text-gray-500 mt-1">Цель: 110%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Факт</div>
            <div className="text-3xl font-bold text-blue-600">800 шт</div>
            <div className="text-sm text-gray-500 mt-1">52% от цели</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Остаток</div>
            <div className="text-3xl font-bold text-red-600">740 шт</div>
            <div className="text-sm text-gray-500 mt-1">Необходимо закупить</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Линеек с нулевым выполнением</div>
            <div className="text-3xl font-bold text-red-600">3</div>
            <div className="text-sm text-red-600 mt-1">Критическое состояние</div>
          </div>
        </div>
      </div>

      {/* Product Lines Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">ЛИНЕЙКА</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">ЛИМИТ %</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">ПЛАН, ШТ</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">ФАКТ, ШТ</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">ФАКТ % согласно цели</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">ОТКЛОНЕНИЕ %</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">ОСТАТОК закупить, ШТ</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">СТАТУС</th>
              </tr>
            </thead>
            <tbody>
              {productLines.map((line, idx) => (
                <>
                  <tr
                    className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                      line.status === "critical"
                        ? "bg-red-50"
                        : line.status === "warning"
                        ? "bg-yellow-50"
                        : "bg-green-50"
                    }`}
                    onClick={() => line.skus && toggleLine(line.name)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {line.skus && (
                          <div className="text-gray-400">
                            {expandedLine === line.name ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{line.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-gray-700">{line.limit}</td>
                    <td className="px-4 py-4 text-center font-semibold text-gray-700">{line.plan}</td>
                    <td className="px-4 py-4 text-center font-semibold text-gray-700">{line.fact}</td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`font-semibold ${
                          line.status === "critical"
                            ? "text-red-600"
                            : line.status === "warning"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {line.factPercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`font-semibold ${
                          line.deviation < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {line.deviation > 0 ? "+" : ""}
                        {line.deviation.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`font-semibold ${
                          line.remaining > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {line.remaining}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                          line.status === "critical"
                            ? "bg-red-200 text-red-800"
                            : line.status === "warning"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-green-200 text-green-800"
                        }`}
                      >
                        {line.status === "critical" ? "✕" : line.status === "warning" ? "!" : "✓"}
                      </span>
                    </td>
                  </tr>

                  {/* SKU Details */}
                  {expandedLine === line.name && line.skus && (
                    <tr>
                      <td colSpan={8} className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="ml-8">
                          <div className="text-sm font-semibold text-gray-700 mb-3">Детализация по SKU:</div>
                          <table className="w-full">
                            <thead>
                              <tr className="text-xs text-gray-500 border-b">
                                <th className="text-left pb-2 font-semibold">Артикул</th>
                                <th className="text-center pb-2 font-semibold">План</th>
                                <th className="text-center pb-2 font-semibold">Факт</th>
                                <th className="text-center pb-2 font-semibold">Выполнение</th>
                              </tr>
                            </thead>
                            <tbody>
                              {line.skus.map((sku, skuIdx) => (
                                <tr key={skuIdx} className="border-b border-gray-100 last:border-0">
                                  <td className="py-2 text-sm text-gray-900">{sku.name}</td>
                                  <td className="py-2 text-center text-sm text-gray-700">{sku.plan}</td>
                                  <td className="py-2 text-center text-sm text-gray-700">{sku.fact}</td>
                                  <td className="py-2 text-center text-sm font-semibold">
                                    <span
                                      className={
                                        sku.fact === 0
                                          ? "text-red-600"
                                          : sku.fact < sku.plan
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                      }
                                    >
                                      {((sku.fact / sku.plan) * 100).toFixed(1)}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {/* Total Row */}
              <tr className="bg-gray-100 font-semibold">
                <td className="px-6 py-4">Остальное</td>
                <td className="px-4 py-4 text-center">50,70%</td>
                <td className="px-4 py-4 text-center">781</td>
                <td className="px-4 py-4 text-center">283</td>
                <td className="px-4 py-4 text-center text-yellow-600">18,38%</td>
                <td className="px-4 py-4 text-center text-red-600">-32,32%</td>
                <td className="px-4 py-4 text-center text-red-600">498</td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-yellow-200 text-yellow-800">
                    !
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations Link */}
      <Link
        to="/recommendations"
        className="block bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Хотите понять, что именно закупить?</h3>
            <p className="text-sm text-blue-700">
              Перейдите в раздел рекомендаций для получения детальных советов по каждой линейке
            </p>
          </div>
          <div className="text-blue-600 font-semibold flex items-center">
            Перейти к рекомендациям
            <ChevronRight className="w-5 h-5 ml-1" />
          </div>
        </div>
      </Link>
    </div>
  );
}