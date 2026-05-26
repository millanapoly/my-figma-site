import { Search, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";

export function Complaints() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // desc = новые сначала

  const complaints = [
    {
      id: 1,
      date: "23.03.2026",
      time: "14:30",
      dateTime: new Date("2026-03-23T14:30:00"),
      productName: "Estelite Asteria шприц A2 4,0 г",
      theme: "Несоответствие оттенка заявленному",
      status: "Новое обращение",
      statusColor: "gray",
      documents: [
        { name: "Фото_дефекта_1.jpg", url: "#" },
        { name: "Накладная_982827.pdf", url: "#" },
      ],
    },
    {
      id: 2,
      date: "22.03.2026",
      time: "09:15",
      dateTime: new Date("2026-03-22T09:15:00"),
      productName: "Palfique LX5 A1 3,8 г",
      theme: "Повреждение упаковки при транспортировке, видимые дефекты шприца",
      status: "На рассмотрении",
      statusColor: "blue",
      documents: [
        { name: "Фото_упаковки.jpg", url: "#" },
        { name: "Акт_приемки.pdf", url: "#" },
      ],
    },
    {
      id: 3,
      date: "20.03.2026",
      time: "16:45",
      dateTime: new Date("2026-03-20T16:45:00"),
      productName: "Sigma Cake Set III",
      theme: "Брак производства — неравномерная консистенция материала",
      status: "Одобрена",
      statusColor: "orange",
      documents: [
        { name: "Заключение_лаборатории.pdf", url: "#" },
        { name: "Фото_материала.jpg", url: "#" },
      ],
    },
    {
      id: 4,
      date: "18.03.2026",
      time: "11:20",
      dateTime: new Date("2026-03-18T11:20:00"),
      productName: "Bond Force II Pen Kit",
      theme: "Истек срок годности при получении товара",
      status: "Замена отправлена",
      statusColor: "purple",
      documents: [
        { name: "Скан_накладной.pdf", url: "#" },
      ],
    },
    {
      id: 5,
      date: "15.03.2026",
      time: "13:50",
      dateTime: new Date("2026-03-15T13:50:00"),
      productName: "Estelite Universal Flow High шприцы 3,0 г",
      theme: "Качество материала соответствует заявленному, замена выполнена",
      status: "Закрыта",
      statusColor: "green",
      documents: [
        { name: "Акт_выполненных_работ.pdf", url: "#" },
        { name: "ТТН_замены.pdf", url: "#" },
      ],
    },
    {
      id: 6,
      date: "12.03.2026",
      time: "10:30",
      dateTime: new Date("2026-03-12T10:30:00"),
      productName: "Palfique LX5 B2 3,8 г",
      theme: "Не подтвержден брак производителем после экспертизы",
      status: "Отклонена",
      statusColor: "red",
      documents: [
        { name: "Заключение_эксперта.pdf", url: "#" },
      ],
    },
    {
      id: 7,
      date: "10.03.2026",
      time: "08:45",
      dateTime: new Date("2026-03-10T08:45:00"),
      productName: "Estelite Asteria шприц A3 4,0 г",
      theme: "Дефект упаковки, повреждение при транспортировке",
      status: "На рассмотрении",
      statusColor: "blue",
      documents: [
        { name: "Фото_дефекта.jpg", url: "#" },
      ],
    },
  ];

  // Фильтрация и сортировка
  const filteredComplaints = useMemo(() => {
    let filtered = [...complaints];

    // Фильтр по названию товара
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((complaint) =>
        complaint.productName.toLowerCase().includes(searchLower)
      );
    }

    // Сортировка по дате
    filtered.sort((a, b) => {
      if (sortOrder === "desc") {
        return b.dateTime.getTime() - a.dateTime.getTime(); // новые сначала
      } else {
        return a.dateTime.getTime() - b.dateTime.getTime(); // старые сначала
      }
    });

    return filtered;
  }, [searchTerm, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const getStatusBadge = (status: string, color: string) => {
    const colorClasses = {
      gray: "bg-gray-100 text-gray-800 border border-gray-300",
      blue: "bg-blue-100 text-blue-800 border border-blue-300",
      orange: "bg-blue-100 text-blue-800 border border-blue-300",
      purple: "bg-purple-100 text-purple-800 border border-purple-300",
      green: "bg-green-100 text-green-800 border border-green-300",
      red: "bg-red-100 text-red-800 border border-red-300",
    };
    return (
      <span
        className={`px-3 py-1 rounded text-sm font-semibold ${
          colorClasses[color as keyof typeof colorClasses]
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Рекламации</h1>
        <p className="text-gray-600 mt-1">Мониторинг поданных рекламаций</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-3xl shadow-sm p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск по названию товара..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredComplaints.length === 0 && searchTerm ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">По вашему запросу ничего не найдено</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">Рекламации отсутствуют</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold border-r border-blue-600 whitespace-nowrap cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={toggleSortOrder}
                  >
                    <div className="flex items-center gap-2">
                      <span>Дата создания</span>
                      {sortOrder === "desc" ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-blue-600">
                    Тема
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-blue-600 whitespace-nowrap">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
                    Документы
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint, index) => (
                  <tr
                    key={complaint.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 whitespace-nowrap">
                      <div>{complaint.date}</div>
                      <div className="text-gray-500 text-xs">{complaint.time}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div className="font-medium mb-1">{complaint.productName}</div>
                      <div className="text-gray-600">{complaint.theme}</div>
                    </td>
                    <td className="px-4 py-4 text-sm border-r border-gray-200">
                      {getStatusBadge(complaint.status, complaint.statusColor)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {complaint.documents.length > 0 ? (
                        <div className="space-y-1">
                          {complaint.documents.map((doc, idx) => (
                            <a
                              key={idx}
                              href={doc.url}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm">{doc.name}</span>
                              <Download className="w-3 h-3 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Нет документов</span>
                      )}
                    </td>
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