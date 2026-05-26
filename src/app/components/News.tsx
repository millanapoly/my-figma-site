import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";

export function News() {
  const news = [
    {
      id: 1,
      title: "Новые условия дистрибьюторского соглашения на Q2 2025",
      date: "20.08.2025",
      category: "Важное",
      excerpt: "С 1 апреля 2025 года вступают в силу обновленные условия ДС. Обратите внимание на изменения в требованиях по фокусным линейкам.",
      link: "#",
      isNew: true,
    },
    {
      id: 2,
      title: "Акция: повышенная скидка на линейку Астерия",
      date: "15.08.2025",
      category: "Акции",
      excerpt: "До конца августа действует специальное предложение - дополнительная скидка 5% на всю линейку композитов Estelite Asteria.",
      link: "#",
      isNew: true,
    },
    {
      id: 3,
      title: "Обновление прайс-листа",
      date: "10.08.2025",
      category: "Цены",
      excerpt: "Обновлены цены на ряд позиций. Новый прайс-лист доступен для скачивания в личном кабинете.",
      link: "#",
      isNew: false,
    },
    {
      id: 4,
      title: "Изменение курса EUR на август 2025",
      date: "01.08.2025",
      category: "Валюта",
      excerpt: "Курс EUR для расчетов в августе составляет 98,50₽. Курс фиксируется на весь месяц.",
      link: "#",
      isNew: false,
    },
    {
      id: 5,
      title: "Новинка: Сигма Кейк набор IV",
      date: "25.07.2025",
      category: "Продукты",
      excerpt: "В ассортименте PROTECO появился новый набор композитов Sigma Cake IV с расширенной палитрой оттенков.",
      link: "#",
      isNew: false,
    },
    {
      id: 6,
      title: "График работы склада в праздничные дни",
      date: "20.07.2025",
      category: "Логистика",
      excerpt: "Информируем о графике работы склада в праздничные дни августа. Планируйте заказы заранее.",
      link: "#",
      isNew: false,
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Back Button - hidden on mobile since we have bottom nav */}
      <Link to="/" className="hidden lg:inline-flex items-center text-blue-600 hover:text-blue-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Вернуться на главную
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-4 lg:p-6 border border-gray-200">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">Новости</h1>
        <p className="text-sm lg:text-base text-gray-600">
          Актуальная информация об акциях, изменениях условий и новых продуктах
        </p>
      </div>

      {/* News List */}
      <div className="space-y-3 lg:space-y-4">
        {news.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-3 gap-2">
              <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                <span
                  className={`px-2 lg:px-3 py-1 rounded text-xs font-semibold ${
                    item.category === "Важное"
                      ? "bg-red-100 text-red-800"
                      : item.category === "Акции"
                      ? "bg-blue-100 text-blue-800"
                      : item.category === "Цены"
                      ? "bg-blue-100 text-blue-800"
                      : item.category === "Валюта"
                      ? "bg-purple-100 text-purple-800"
                      : item.category === "Продукты"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.category}
                </span>
                {item.isNew && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-400 text-gray-900">
                    НОВОЕ
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs lg:text-sm text-gray-500">
                <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1" />
                {item.date}
              </div>
            </div>

            <h3 className="text-base lg:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm lg:text-base text-gray-700 mb-3 lg:mb-4 leading-relaxed">{item.excerpt}</p>

            <a
              href={item.link}
              className="inline-flex items-center text-sm lg:text-base text-blue-600 hover:text-blue-800 font-semibold"
            >
              Читать полностью
              <ExternalLink className="w-3.5 h-3.5 lg:w-4 lg:h-4 ml-1" />
            </a>
          </div>
        ))}
      </div>

      {/* Archive Link */}
      <div className="text-center pb-4">
        <button className="text-sm lg:text-base text-blue-600 hover:text-blue-800 font-semibold">
          Показать архив новостей
        </button>
      </div>
    </div>
  );
}
