import { ArrowLeft, Download, Package, FileSpreadsheet, FileText, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Position {
  sku: string;
  name: string;
  packages: number;
  units: number;
  basePrice: number;
  additionalDiscount: number;
  priceWithDiscount: number;
  vat: number;
  lineTotal: number;
  status: "Отгрузка" | "Зарезервировано" | "Обрабатывается" | "Ожидает поступления" | "Отменено";
}

interface Shipment {
  id: string;
  updNumber: string;
  updDate: string;
  amount: number;
  deliveryAddress: string;
  carrier: string;
  deliveryMethod: string;
}

interface OrderData {
  orderNumber: string;
  orderDate: string;
  status: string;
  contractDiscount: number;
  paidPercent: number;
  totalPackages: number;
  totalUnits: number;
  totalAmount: number;
  positions: Position[];
  shipments: Shipment[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const getOrderData = (id: string): OrderData => {
  // Обрабатывается менеджером
  if (id === "ORD-2026-00132") {
    return {
      orderNumber: id,
      orderDate: "15.03.2026",
      status: "Обрабатывается менеджером",
      contractDiscount: 15,
      paidPercent: 0,
      totalPackages: 35,
      totalUnits: 140,
      totalAmount: 125300,
      positions: [
        {
          sku: "AST-POST-A3", name: "ЭСТЕЛАЙТ ПОСТЕРИОР шприц A3",
          packages: 15, units: 60, basePrice: 1450, additionalDiscount: 5,
          priceWithDiscount: 1172.13, vat: 20, lineTotal: 70327.50,
          status: "Обрабатывается",
        },
        {
          sku: "UNI-B1-3", name: "ЮНИВЕРСАЛ ФЛОУ шприц B1 3,0 г",
          packages: 20, units: 80, basePrice: 1200, additionalDiscount: 3,
          priceWithDiscount: 991.80, vat: 20, lineTotal: 79344,
          status: "Зарезервировано",
        },
      ],
      shipments: [],
    };
  }

  // Отгружен — с несколькими отгрузками и позицией «Отменено»
  if (id === "ORD-2026-00115") {
    return {
      orderNumber: id,
      orderDate: "05.03.2026",
      status: "Отгружен",
      contractDiscount: 15,
      paidPercent: 100,
      totalPackages: 50,
      totalUnits: 200,
      totalAmount: 320000,
      positions: [
        {
          sku: "AST-A2-4", name: "ЭСТЕЛАЙТ АСТЕРИА шприц A2 4,0 г",
          packages: 20, units: 80, basePrice: 1500, additionalDiscount: 0,
          priceWithDiscount: 1275, vat: 20, lineTotal: 102000,
          status: "Отгрузка",
        },
        {
          sku: "UNI-A3-3", name: "ЮНИВЕРСАЛ ФЛОУ шприц A3 3,0 г",
          packages: 15, units: 60, basePrice: 1200, additionalDiscount: 0,
          priceWithDiscount: 1020, vat: 20, lineTotal: 61200,
          status: "Отгрузка",
        },
        {
          sku: "PAL-B2-38", name: "ПАЛФИК LX5 шприц B2 3,8 г",
          packages: 10, units: 40, basePrice: 1800, additionalDiscount: 5,
          priceWithDiscount: 1453.50, vat: 20, lineTotal: 58140,
          status: "Отгрузка",
        },
        {
          sku: "BND-KIT", name: "БОНД ФОРС II Pen Kit",
          packages: 5, units: 20, basePrice: 1850, additionalDiscount: 0,
          priceWithDiscount: 1572.50, vat: 20, lineTotal: 31450,
          status: "Отгрузка",
        },
        {
          sku: "SIG-A1-5", name: "СИГМА КЕЙК A1 5,0 г",
          packages: 12, units: 48, basePrice: 1400, additionalDiscount: 0,
          priceWithDiscount: 1190, vat: 20, lineTotal: 57120,
          status: "Отменено",
        },
      ],
      shipments: [
        {
          id: "SHIP-001",
          updNumber: "УПД-2026-00234",
          updDate: "06.03.2026",
          amount: 163200,
          deliveryAddress: "г. Москва, ул. Ленина, 45",
          carrier: "СДЭК",
          deliveryMethod: "До адреса",
        },
        {
          id: "SHIP-002",
          updNumber: "УПД-2026-00241",
          updDate: "08.03.2026",
          amount: 89590,
          deliveryAddress: "г. Москва, ул. Ленина, 45",
          carrier: "Деловые Линии",
          deliveryMethod: "До терминала",
        },
      ],
    };
  }

  // Ожидается оплата
  if (id === "ORD-2026-00142") {
    return {
      orderNumber: id,
      orderDate: "22.03.2026",
      status: "Ожидается оплата",
      contractDiscount: 15,
      paidPercent: 0,
      totalPackages: 25,
      totalUnits: 100,
      totalAmount: 89500,
      positions: [
        {
          sku: "AST-A2-4", name: "ЭСТЕЛАЙТ АСТЕРИА шприц A2 4,0 г",
          packages: 15, units: 60, basePrice: 1500, additionalDiscount: 0,
          priceWithDiscount: 1275, vat: 20, lineTotal: 76500,
          status: "Зарезервировано",
        },
        {
          sku: "PAL-B2-38", name: "ПАЛФИК LX5 шприц B2 3,8 г",
          packages: 10, units: 40, basePrice: 1800, additionalDiscount: 5,
          priceWithDiscount: 1453.50, vat: 20, lineTotal: 58140,
          status: "Ожидает поступления",
        },
      ],
      shipments: [],
    };
  }

  // Отменён
  if (id === "ORD-2026-00101") {
    return {
      orderNumber: id,
      orderDate: "20.02.2026",
      status: "Отменён",
      contractDiscount: 15,
      paidPercent: 0,
      totalPackages: 12,
      totalUnits: 48,
      totalAmount: 74500,
      positions: [
        {
          sku: "AST-A3-4", name: "ЭСТЕЛАЙТ АСТЕРИА шприц A3 4,0 г",
          packages: 7, units: 28, basePrice: 1500, additionalDiscount: 0,
          priceWithDiscount: 1275, vat: 20, lineTotal: 35700,
          status: "Отменено",
        },
        {
          sku: "UNI-A2-3", name: "ЮНИВЕРСАЛ ФЛОУ шприц A2 3,0 г",
          packages: 5, units: 20, basePrice: 1200, additionalDiscount: 0,
          priceWithDiscount: 1020, vat: 20, lineTotal: 20400,
          status: "Отменено",
        },
      ],
      shipments: [],
    };
  }

  // Готов к отгрузке (default)
  return {
    orderNumber: id || "ORD-2026-00145",
    orderDate: "24.03.2026",
    status: "Готов к отгрузке",
    contractDiscount: 15,
    paidPercent: 50,
    totalPackages: 35,
    totalUnits: 140,
    totalAmount: 156800,
    positions: [
      {
        sku: "AST-A2-4", name: "ЭСТЕЛАЙТ АСТЕРИА шприц A2 4,0 г",
        packages: 20, units: 80, basePrice: 1500, additionalDiscount: 0,
        priceWithDiscount: 1275, vat: 20, lineTotal: 102000,
        status: "Зарезервировано",
      },
      {
        sku: "PAL-B2-38", name: "ПАЛФИК LX5 шприц B2 3,8 г",
        packages: 10, units: 40, basePrice: 1800, additionalDiscount: 5,
        priceWithDiscount: 1453.50, vat: 20, lineTotal: 58140,
        status: "Ожидает поступления",
      },
      {
        sku: "SIG-A1-5", name: "СИГМА КЕЙК A1 5,0 г",
        packages: 5, units: 20, basePrice: 1400, additionalDiscount: 0,
        priceWithDiscount: 1190, vat: 20, lineTotal: 23800,
        status: "Отменено",
      },
    ],
    shipments: [],
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GROUP_ORDER: Position["status"][] = [
  "Отгрузка",
  "Зарезервировано",
  "Обрабатывается",
  "Ожидает поступления",
  "Отменено",
];

const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case "Обрабатывается менеджером": return "bg-blue-100 text-blue-700 border border-blue-200";
    case "Ожидается оплата":
    case "Ожидается оплата до отгрузки": return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    case "Готов к отгрузке": return "bg-purple-100 text-purple-700 border border-purple-200";
    case "В процессе отгрузки": return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    case "Отгружен": return "bg-green-100 text-green-700 border border-green-200";
    case "Отменён": return "bg-red-100 text-red-700 border border-red-200";
    default: return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const getGroupStyle = (status: Position["status"]) => {
  switch (status) {
    case "Отгрузка": return { card: "border-green-200 bg-green-50/50", header: "bg-green-50 border-green-200", dot: "bg-green-500" };
    case "Зарезервировано": return { card: "border-blue-200 bg-blue-50/50", header: "bg-blue-50 border-blue-200", dot: "bg-blue-500" };
    case "Обрабатывается": return { card: "border-indigo-200 bg-indigo-50/50", header: "bg-indigo-50 border-indigo-200", dot: "bg-indigo-500" };
    case "Ожидает поступления": return { card: "border-yellow-200 bg-yellow-50/50", header: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-500" };
    case "Отменено": return { card: "border-red-200 bg-red-50/30", header: "bg-red-50 border-red-200", dot: "bg-red-400" };
    default: return { card: "border-gray-200 bg-gray-50", header: "bg-gray-50 border-gray-200", dot: "bg-gray-400" };
  }
};

const pluralPos = (n: number) =>
  n === 1 ? "позиция" : n >= 2 && n <= 4 ? "позиции" : "позиций";

const getGroupSummary = (positions: Position[]) => ({
  count: positions.length,
  packages: positions.reduce((s, p) => s + p.packages, 0),
  units: positions.reduce((s, p) => s + p.units, 0),
  total: positions.reduce((s, p) => s + p.lineTotal, 0),
});

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderDetail() {
  const { orderId } = useParams();
  const orderData = getOrderData(orderId || "ORD-2026-00145");

  const isCancelled = orderData.status === "Отменён";

  // Группировка позиций по статусам в нужном порядке
  const groupedPositions = GROUP_ORDER.map(status => ({
    status,
    positions: orderData.positions.filter(p => p.status === status),
  })).filter(g => g.positions.length > 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Back */}
      <Link
        to="/new-orders"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к списку заказов
      </Link>

      {/* Отменён banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-3xl px-6 py-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <strong>Заказ отменён.</strong> Все позиции переведены в статус «Отменено». Документы по данному заказу недоступны.
          </div>
        </div>
      )}

      {/* ── Блок 1: Общее по заказу ── */}
      <div className="bg-white rounded-3xl shadow-sm p-7 border border-gray-200">
        {/* Title + actions */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-gray-900">Заказ {orderData.orderNumber}</h1>
            <p className="text-gray-500 text-sm mt-1">от {orderData.orderDate}</p>
          </div>
          {!isCancelled && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Счёт Excel: ${orderData.orderNumber}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-sm font-semibold transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Счёт Excel
              </button>
              {orderData.status !== "Обрабатывается менеджером" && (
                <button
                  onClick={() => alert(`Счёт PDF: ${orderData.orderNumber}`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Счёт PDF
                </button>
              )}
            </div>
          )}
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="text-xs text-gray-500 font-medium mb-1.5">Статус заказа</div>
            <span className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-semibold ${getOrderStatusBadge(orderData.status)}`}>
              {orderData.status}
            </span>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="text-xs text-gray-500 font-medium mb-1.5">Скидка по договору</div>
            <div className="text-lg font-bold text-blue-600">{orderData.contractDiscount}%</div>
          </div>
          <div className="grid grid-rows-2 gap-2">
            <div className="bg-gray-50 rounded-2xl px-4 py-2.5">
              <div className="text-xs text-gray-500 font-medium">Количество в упаковках</div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">{isCancelled ? "—" : orderData.totalPackages}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl px-4 py-2.5">
              <div className="text-xs text-gray-500 font-medium">Количество в штуках</div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">{isCancelled ? "—" : orderData.totalUnits}</div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <div className="text-sm text-gray-600">Общая сумма заказа</div>
          <div className={`text-2xl font-bold ${isCancelled ? "line-through text-gray-400" : "text-gray-900"}`}>
            {orderData.totalAmount.toLocaleString()} ₽
          </div>
        </div>
      </div>

      {/* ── Блок 2: Позиции ── */}
      <div className="bg-white rounded-3xl shadow-sm p-7 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-5">Позиции</h2>

        <div className="space-y-4">
          {groupedPositions.map(({ status, positions }) => {
            const summary = getGroupSummary(positions);
            const style = getGroupStyle(status);

            return (
              <div key={status} className={`border rounded-3xl overflow-hidden ${style.card}`}>
                {/* Group header */}
                <div className={`px-5 py-3 border-b ${style.header} flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <span className="font-semibold text-gray-900 text-sm">{status}</span>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {summary.count} {pluralPos(summary.count)} / {summary.packages} упак. / {summary.units} шт. / {summary.total.toLocaleString()} ₽
                  </div>
                </div>

                {/* Positions table — без колонки «Комментарий» */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/70 border-b border-gray-100">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Артикул</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Наименование</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">Кол-во в упаковках</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">Кол-во в штуках</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Базовая цена</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">Доп. скидка</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Цена со скидкой</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">НДС, %</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Стоимость по позиции</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {positions.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-700 font-medium whitespace-nowrap">{item.sku}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-800">{item.packages}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-800">{item.units}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-800">{item.basePrice.toLocaleString()} ₽</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-800">
                            {item.additionalDiscount > 0 ? `${item.additionalDiscount}%` : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-800">
                            {item.priceWithDiscount.toLocaleString()} ₽
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-800">{item.vat}%</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            {item.lineTotal.toLocaleString()} ₽
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Блок 3: Отгрузки ── */}
      <div className="bg-white rounded-3xl shadow-sm p-7 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-5">Отгрузки</h2>

        {orderData.shipments.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            {isCancelled ? "Заказ отменён — отгрузок не было" : "Отгрузок пока нет"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-2xl">Номер УПД</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">Дата УПД</th>
                  <th className="px-4 py-3.5 text-center text-sm font-semibold">Скачать УПД</th>
                  <th className="px-4 py-3.5 text-right text-sm font-semibold">Сумма</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">Куда доставка</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">Перевозчик</th>
                  <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-2xl">Способ доставки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderData.shipments.map((shipment, index) => (
                  <tr key={shipment.id} className={`hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{shipment.updNumber}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{shipment.updDate}</td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => alert(`Скачать УПД Excel: ${shipment.updNumber}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 font-medium transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Excel
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">
                      {shipment.amount.toLocaleString()} ₽
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{shipment.deliveryAddress}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{shipment.carrier}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{shipment.deliveryMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}