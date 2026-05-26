import { Search, Filter, RefreshCw, X, Download } from "lucide-react";
import { useState, useMemo } from "react";

export function Shipments() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Фильтры
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [selectedDeliveryMethods, setSelectedDeliveryMethods] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Моковые данные отгрузок - 1 строка = 1 УПД = 1 счёт
  // Строки без УПД не выводятся
  const shipments = [
    {
      id: "SHIP-2026-00234",
      invoice: "СЧ-2026-00145",
      updNumber: "УПД-2026-00234",
      updDate: "24.03.2026",
      amount: 156800,
      deliveryAddress: "Москва, ул. Ленина 45",
      carrier: "СДЭК",
      deliveryMethod: "До адреса",
    },
    {
      id: "SHIP-2026-00235",
      invoice: "СЧ-2026-00142",
      updNumber: "УПД-2026-00235",
      updDate: "24.03.2026",
      amount: 89500,
      deliveryAddress: "Москва, ул. Ленина 45",
      carrier: "СДЭК",
      deliveryMethod: "До адреса",
    },
    {
      id: "SHIP-2026-00233",
      invoice: "СЧ-2026-00138",
      updNumber: "УПД-2026-00233",
      updDate: "22.03.2026",
      amount: 234700,
      deliveryAddress: "Санкт-Петербург, ул. Невский проспект 120",
      carrier: "ПЭК",
      deliveryMethod: "До терминала",
    },
    {
      id: "SHIP-2026-00231",
      invoice: "СЧ-2026-00128",
      updNumber: "УПД-2026-00231",
      updDate: "18.03.2026",
      amount: 198400,
      deliveryAddress: "Казань, ул. Баумана 12",
      carrier: "Деловые Линии",
      deliveryMethod: "До адреса",
    },
    {
      id: "SHIP-2026-00232",
      invoice: "СЧ-2026-00132",
      updNumber: "УПД-2026-00232",
      updDate: "18.03.2026",
      amount: 125300,
      deliveryAddress: "Казань, ул. Баумана 12",
      carrier: "Деловые Линии",
      deliveryMethod: "До адреса",
    },
    {
      id: "SHIP-2026-00230",
      invoice: "СЧ-2026-00120",
      updNumber: "УПД-2026-00230",
      updDate: "15.03.2026",
      amount: 342100,
      deliveryAddress: "Новосибирск, ул. Красный проспект 45",
      carrier: "СДЭК",
      deliveryMethod: "До терминала",
    },
    {
      id: "SHIP-2026-00229",
      invoice: "СЧ-2026-00115",
      updNumber: "УПД-2026-00229",
      updDate: "12.03.2026",
      amount: 278900,
      deliveryAddress: "Екатеринбург, пр. Ленина 78",
      carrier: "ПЭК",
      deliveryMethod: "До адреса",
    },
    {
      id: "SHIP-2026-00228",
      invoice: "СЧ-2026-00110",
      updNumber: "УПД-2026-00228",
      updDate: "10.03.2026",
      amount: 156200,
      deliveryAddress: "Екатеринбург, пр. Ленина 78",
      carrier: "ПЭК",
      deliveryMethod: "До адреса",
    },
  ];

  // Все уникальные перевозчики
  const allCarriers = Array.from(new Set(shipments.map(s => s.carrier).filter(c => c)));

  // Фильтрация
  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      // Поиск
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchInvoice = shipment.invoice.toLowerCase().includes(searchLower);
        const matchUpd = shipment.updNumber.toLowerCase().includes(searchLower);
        const matchCarrier = shipment.carrier.toLowerCase().includes(searchLower);
        const matchAddress = shipment.deliveryAddress.toLowerCase().includes(searchLower);
        const matchAmount = shipment.amount.toString().includes(searchTerm);
        if (!matchInvoice && !matchUpd && !matchCarrier && !matchAddress && !matchAmount) return false;
      }

      // Дата УПД
      if (shipment.updDate) {
        const updDate = shipment.updDate.split('.').reverse().join('-');
        if (dateFrom && updDate < dateFrom) return false;
        if (dateTo && updDate > dateTo) return false;
      }

      // Перевозчик
      if (selectedCarriers.length > 0) {
        if (!shipment.carrier || !selectedCarriers.includes(shipment.carrier)) return false;
      }

      // Способ доставки
      if (selectedDeliveryMethods.length > 0 && !selectedDeliveryMethods.includes(shipment.deliveryMethod)) return false;

      return true;
    });
  }, [shipments, searchTerm, dateFrom, dateTo, selectedCarriers, selectedDeliveryMethods]);

  const resetFilters = () => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    setDateFrom(date.toISOString().split('T')[0]);
    setDateTo(new Date().toISOString().split('T')[0]);
    setSelectedCarriers([]);
    setSelectedDeliveryMethods([]);
    setSearchTerm("");
  };

  const handleDownloadUpd = (shipmentId: string, updNumber: string) => {
    alert(`Скачивание УПД ${updNumber} в формате Excel для отгрузки ${shipmentId}`);
  };

  const deliveryMethods = ["До терминала", "До адреса", "Самовывоз"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Отгрузки</h1>
        <p className="text-gray-600 mt-1">Информация об отгруженных заказах и документах</p>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-3xl shadow-sm p-4 border border-gray-200 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по счету, УПД, перевозчику, адресу или сумме..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-3xl font-semibold flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-3xl text-gray-700 hover:bg-gray-50 font-semibold flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Сбросить
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата УПД с</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата УПД по</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Перевозчик</label>
              <div className="flex flex-wrap gap-2">
                {allCarriers.map(carrier => (
                  <label key={carrier} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCarriers.includes(carrier)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCarriers([...selectedCarriers, carrier]);
                        } else {
                          setSelectedCarriers(selectedCarriers.filter(c => c !== carrier));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{carrier}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Способ доставки</label>
              <div className="flex flex-wrap gap-2">
                {deliveryMethods.map(method => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDeliveryMethods.includes(method)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDeliveryMethods([...selectedDeliveryMethods, method]);
                        } else {
                          setSelectedDeliveryMethods(selectedDeliveryMethods.filter(m => m !== method));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredShipments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">Отгрузки по выбранным условиям не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Номер заказа</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Номер УПД</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Дата УПД</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Скачать УПД</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Сумма</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Куда доставка</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Перевозчик</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Способ доставки</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShipments.map((shipment, index) => (
                  <tr
                    key={shipment.id}
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-blue-600 font-semibold">{shipment.invoice}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-semibold">
                      {shipment.updNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {shipment.updDate}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDownloadUpd(shipment.id, shipment.updNumber)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-semibold transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Excel
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {shipment.amount.toLocaleString()} ₽
                    </td>
                    <td className="px-4 py-3 text-gray-900">{shipment.deliveryAddress}</td>
                    <td className="px-4 py-3 text-gray-900">{shipment.carrier}</td>
                    <td className="px-4 py-3 text-gray-900">{shipment.deliveryMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>Найдено отгрузок: {filteredShipments.length}</div>
        <div>Показаны отгрузки за последние 90 дней</div>
      </div>
    </div>
  );
}