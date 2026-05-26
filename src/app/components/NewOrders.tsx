import { Search, Filter, RefreshCw, X, Download, AlertCircle, FileSpreadsheet, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export function NewOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [withProblems, setWithProblems] = useState(false);
  const [unshippedOnly, setUnshippedOnly] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const orderStatuses = [
    "Обрабатывается менеджером",
    "Ожидается оплата",
    "Ожидается оплата до отгрузки",
    "Готов к отгрузке",
    "В процессе отгрузки",
    "Отгружен",
    "Отменён",
  ];

  const orders = [
    {
      id: "ORD-2026-00145",
      orderNumber: "ORD-2026-00145",
      orderDate: "24.03.2026",
      status: "Готов к отгрузке",
      amount: 156800,
      paidPercent: 50,
      totalPackages: 35,
      totalUnits: 140,
      problemPositions: 1,
      isShipped: false,
    },
    {
      id: "ORD-2026-00142",
      orderNumber: "ORD-2026-00142",
      orderDate: "22.03.2026",
      status: "Ожидается оплата",
      amount: 89500,
      paidPercent: 0,
      totalPackages: 25,
      totalUnits: 100,
      problemPositions: 1,
      isShipped: false,
    },
    {
      id: "ORD-2026-00138",
      orderNumber: "ORD-2026-00138",
      orderDate: "20.03.2026",
      status: "В процессе отгрузки",
      amount: 234700,
      paidPercent: 100,
      totalPackages: 55,
      totalUnits: 220,
      problemPositions: 0,
      isShipped: false,
    },
    {
      id: "ORD-2026-00135",
      orderNumber: "ORD-2026-00135",
      orderDate: "18.03.2026",
      status: "Ожидается оплата",
      amount: 67200,
      paidPercent: 30,
      totalPackages: 3,
      totalUnits: 12,
      problemPositions: 0,
      isShipped: false,
    },
    {
      id: "ORD-2026-00132",
      orderNumber: "ORD-2026-00132",
      orderDate: "15.03.2026",
      status: "Обрабатывается менеджером",
      amount: 125300,
      paidPercent: 0,
      totalPackages: 35,
      totalUnits: 140,
      problemPositions: 2,
      isShipped: false,
    },
    {
      id: "ORD-2026-00128",
      orderNumber: "ORD-2026-00128",
      orderDate: "12.03.2026",
      status: "Готов к отгрузке",
      amount: 198400,
      paidPercent: 100,
      totalPackages: 33,
      totalUnits: 132,
      problemPositions: 0,
      isShipped: false,
    },
    {
      id: "ORD-2026-00120",
      orderNumber: "ORD-2026-00120",
      orderDate: "08.03.2026",
      status: "Ожидается оплата",
      amount: 342100,
      paidPercent: 0,
      totalPackages: 70,
      totalUnits: 280,
      problemPositions: 0,
      isShipped: false,
    },
    {
      id: "ORD-2026-00115",
      orderNumber: "ORD-2026-00115",
      orderDate: "05.03.2026",
      status: "Отгружен",
      amount: 320000,
      paidPercent: 100,
      totalPackages: 50,
      totalUnits: 200,
      problemPositions: 0,
      isShipped: true,
    },
    {
      id: "ORD-2026-00110",
      orderNumber: "ORD-2026-00110",
      orderDate: "02.03.2026",
      status: "Отгружен",
      amount: 156200,
      paidPercent: 100,
      totalPackages: 23,
      totalUnits: 92,
      problemPositions: 0,
      isShipped: true,
    },
    {
      id: "ORD-2026-00101",
      orderNumber: "ORD-2026-00101",
      orderDate: "20.02.2026",
      status: "Отменён",
      amount: 74500,
      paidPercent: 0,
      totalPackages: 12,
      totalUnits: 48,
      problemPositions: 0,
      isShipped: false,
    },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchOrderNumber = order.orderNumber.toLowerCase().includes(searchLower);
        const matchAmount = order.amount.toString().includes(searchTerm);
        if (!matchOrderNumber && !matchAmount) return false;
      }
      if (order.orderDate) {
        const orderDate = order.orderDate.split('.').reverse().join('-');
        if (dateFrom && orderDate < dateFrom) return false;
        if (dateTo && orderDate > dateTo) return false;
      }
      if (withProblems && order.problemPositions === 0) return false;
      if (unshippedOnly && order.isShipped) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(order.status)) return false;
      return true;
    });
  }, [orders, searchTerm, dateFrom, dateTo, withProblems, unshippedOnly, selectedStatuses]);

  const resetFilters = () => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    setDateFrom(date.toISOString().split('T')[0]);
    setDateTo(new Date().toISOString().split('T')[0]);
    setWithProblems(false);
    setUnshippedOnly(false);
    setSelectedStatuses([]);
    setSearchTerm("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Обрабатывается менеджером":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "Ожидается оплата":
      case "Ожидается оплата до отгрузки":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "Готов к отгрузке":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      case "В процессе отгрузки":
        return "bg-indigo-100 text-indigo-700 border border-indigo-200";
      case "Отгружен":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Отменён":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const formatProblemPositions = (count: number) => {
    if (count === 0) return null;
    if (count === 1) return "1 позиция";
    if (count >= 2 && count <= 4) return `${count} позиции`;
    return `${count} позиций`;
  };

  const isCancelled = (status: string) => status === "Отменён";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Заказы</h1>
          <p className="text-gray-500 mt-1 text-sm">Управление заказами и их статусами</p>
        </div>
        <div className="text-xs text-gray-400 bg-white border border-gray-200 rounded-2xl px-4 py-2">
          Найдено: <span className="font-semibold text-gray-700">{filteredOrders.length}</span> из {orders.length}
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-200 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск по № заказа или сумме..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-2xl text-sm font-medium flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Фильтры
            {selectedStatuses.length > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedStatuses.length}
              </span>
            )}
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2.5 border border-gray-200 rounded-2xl text-sm text-gray-600 hover:bg-gray-50 font-medium flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Сбросить
          </button>
          <button className="px-4 py-2.5 bg-blue-600 text-white rounded-2xl text-sm hover:bg-blue-700 font-medium flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-gray-100 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Дата заказа с</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Дата заказа по</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withProblems}
                  onChange={(e) => setWithProblems(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">С проблемами по позициям</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unshippedOnly}
                  onChange={(e) => setUnshippedOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Неотгруженные</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Статус заказа</label>
              <div className="flex flex-wrap gap-2">
                {orderStatuses.map(status => (
                  <label key={status} className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-2xl border text-sm transition-colors ${
                    selectedStatuses.includes(status)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedStatuses([...selectedStatuses, status]);
                        else setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                      }}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Заказы по выбранным условиям не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-5 py-3.5 text-left text-sm font-semibold">№ заказа</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">Дата заказа</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">Статус заказа</th>
                  <th className="px-4 py-3.5 text-center text-sm font-semibold">Оплачено</th>
                  <th className="px-4 py-3.5 text-center text-sm font-semibold">Кол-во (упак.)</th>
                  <th className="px-4 py-3.5 text-center text-sm font-semibold">Кол-во (шт.)</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">Проблемы</th>
                  <th className="px-4 py-3.5 text-right text-sm font-semibold">Стоимость</th>
                  <th className="px-5 py-3.5 text-center text-sm font-semibold">Скачать счёт</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order, index) => {
                  const cancelled = isCancelled(order.status);
                  const problems = formatProblemPositions(order.problemPositions);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        cancelled ? 'bg-red-50/30 opacity-75' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/new-orders/${order.id}`}
                          className="text-blue-600 font-semibold hover:underline text-sm"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{order.orderDate}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-semibold ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {cancelled ? (
                          <span className="text-gray-400 text-sm">—</span>
                        ) : (
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-xs font-semibold ${
                            order.paidPercent === 100
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : order.paidPercent > 0
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-100 text-gray-400 border border-gray-200"
                          }`}>
                            {order.paidPercent}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-gray-800">
                        {cancelled ? <span className="text-gray-400">—</span> : order.totalPackages}
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-gray-800">
                        {cancelled ? <span className="text-gray-400">—</span> : order.totalUnits}
                      </td>
                      <td className="px-4 py-3.5">
                        {problems ? (
                          <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {problems}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Нет</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">
                        <span className={cancelled ? "line-through text-gray-400" : ""}>
                          {order.amount.toLocaleString()} ₽
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {cancelled ? (
                          <span className="text-xs text-gray-400 block text-center">—</span>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); alert(`Счёт Excel: ${order.orderNumber}`); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 font-medium transition-colors whitespace-nowrap"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                              Excel
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); alert(`Счёт PDF: ${order.orderNumber}`); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 font-medium transition-colors whitespace-nowrap"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              PDF
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-400">
        <div>Найдено заказов: <span className="font-medium text-gray-600">{filteredOrders.length}</span></div>
        <div>Показаны заказы за последние 90 дней</div>
      </div>
    </div>
  );
}