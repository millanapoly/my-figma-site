import { useState, useMemo } from "react";
import {
  Upload, FileText, CheckCircle, XCircle, AlertCircle,
  Clock, Download, RefreshCw, HelpCircle,
  Mail, Phone, Calendar,
  AlertTriangle, RotateCcw, ArrowRight, X,
  Zap, Filter, ChevronDown
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Scenario = 1 | 2 | 3 | 4 | 5 | 6;
type UploadStep = "form" | "selected" | "processing" | "success" | "error";
type CorrStep = "select" | "upload" | "processing" | "done";

// ─── Mock History Data ────────────────────────────────────────────────────────

const HISTORY_BASE = [
  {
    id: 1, dateTime: "09.04.2026 14:23", type: "Продажи", kind: "Окончательный",
    period: "Март 2026", fileName: "sales_final_2026-03.xlsx",
    status: "Загружен", timeliness: "вовремя", correctable: true, author: "Смирнов А.В.",
  },
  {
    id: 2, dateTime: "09.04.2026 14:20", type: "Остатки", kind: "Окончательный",
    period: "Март 2026", fileName: "stock_final_2026-03.xlsx",
    status: "Загружен", timeliness: "вовремя", correctable: true, author: "Смирнов А.В.",
  },
  {
    id: 3, dateTime: "17.03.2026 09:05", type: "Продажи", kind: "Промежуточный",
    period: "Март 2026", fileName: "sales_interim_2026-03.xlsx",
    status: "Скорректирован", timeliness: "вовремя", correctable: false, author: "Козлова М.П.",
  },
  {
    id: 4, dateTime: "14.03.2026 11:42", type: "Остатки", kind: "Промежуточный",
    period: "Март 2026", fileName: "stock_interim_2026-03.xlsx",
    status: "Загружен", timeliness: "вовремя", correctable: true, author: "Смирнов А.В.",
  },
  {
    id: 5, dateTime: "04.03.2026 16:30", type: "Продажи", kind: "Окончательный",
    period: "Февраль 2026", fileName: "sales_final_2026-02.xlsx",
    status: "Загружен", timeliness: "с опозданием", correctable: false, author: "Петров Д.И.",
  },
  {
    id: 6, dateTime: "03.03.2026 10:00", type: "Остатки", kind: "Окончательный",
    period: "Февраль 2026", fileName: "stock_final_2026-02.xlsx",
    status: "Загружен", timeliness: "вовремя", correctable: false, author: "Петров Д.И.",
  },
  {
    id: 7, dateTime: "14.02.2026 17:11", type: "Продажи", kind: "Промежуточный",
    period: "Февраль 2026", fileName: "sales_interim_2026-02.xlsx",
    status: "Загружен", timeliness: "вовремя", correctable: false, author: "Смирнов А.В.",
  },
];

// CISLink histories
const CIS_SUCCESS = [
  { id: 1, dateTime: "10.04.2026 08:00", depth: "01.03.2026 – 31.03.2026", status: "success", method: "API", errors: [] },
  { id: 2, dateTime: "06.04.2026 04:00", depth: "01.03.2026 – 05.04.2026", status: "success", method: "API", errors: [] },
  { id: 3, dateTime: "02.04.2026 04:00", depth: "01.03.2026 – 01.04.2026", status: "success", method: "API", errors: [] },
];

const CIS_ERROR = [
  {
    id: 1, dateTime: "10.04.2026 08:00", depth: "—", status: "error", method: "API",
    errors: [
      "Ошибка формата данных: CISLink вернул некорректный ответ на запрос выгрузки.",
      "Авторизация прошла успешно, но данные не были переданы.",
    ],
  },
  {
    id: 2, dateTime: "09.04.2026 04:00", depth: "—", status: "error", method: "API",
    errors: ["Ошибка авторизации при обращении к CISLink. Токен доступа недействителен."],
  },
  {
    id: 3, dateTime: "08.04.2026 12:00", depth: "01.03.2026 – 07.04.2026", status: "success", method: "API", errors: [] },
];

const CIS_FTP = [
  {
    id: 1, dateTime: "10.04.2026 08:00", depth: "01.03.2026 – 31.03.2026", status: "success", method: "FTP", errors: [] },
  {
    id: 2, dateTime: "06.04.2026 04:00", depth: "01.03.2026 – 05.04.2026", status: "success", method: "FTP", errors: [] },
];

// ─── Shared Badges ────────────────────────────────────────────────────────────

function StatusBadge({ status, timeliness }: { status: string; timeliness?: string }) {
  if (status === "Загружен") {
    const late = timeliness === "с опозданием";
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        late ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"
      }`}>
        {late ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
        {late ? "Загружен с опозданием" : "Загружен вовремя"}
      </span>
    );
  }
  if (status === "Скорректирован")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
        <RotateCcw className="w-3.5 h-3.5" /> Скорректирован
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
      {status}
    </span>
  );
}

// ─── Rules Modal ──────────────────────────────────────────────────────────────

function RulesModal({ reportType, onClose }: { reportType: "sales" | "stock"; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-semibold text-gray-900">
              Правила заполнения — {reportType === "sales" ? "Продажи" : "Остатки"}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Шаблон и валидация полей</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {reportType === "sales" ? (
          <div className="space-y-4 text-sm">
            <div className="bg-blue-50 rounded-2xl p-5">
              <div className="font-semibold text-blue-900 mb-3">Обязательные поля шаблона «Продажи»</div>
              <ul className="space-y-2">
                {[
                  "Номер реализации",
                  "Дата реализации (ДД.ММ.ГГГГ) — в рамках отчётного периода",
                  "Артикул — должен присутствовать в справочнике PROTECO",
                  "Номенклатура",
                  "ИНН контрагента — 10 или 12 цифр",
                  "Наименование контрагента",
                  "Адрес доставки",
                  "Количество — целое или дробное, больше нуля",
                  "Сумма в рублях — больше нуля",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-blue-800">
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-600 space-y-1.5">
              <div className="font-semibold text-gray-800 mb-2">Логика агрегации</div>
              <p>Одинаковые комбинации «реализация + дата + ИНН + артикул» суммируются в одну запись.</p>
              <p>Дата реализации одинаковая во всех строках с одним номером реализации.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="bg-teal-50 rounded-2xl p-5">
              <div className="font-semibold text-teal-900 mb-3">Обязательные поля шаблона «Остатки»</div>
              <ul className="space-y-2">
                {[
                  "Артикул — должен присутствовать в справочнике PROTECO",
                  "Номенклатура",
                  "Количество — целое (штучный товар) или дробное, больше нуля",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-teal-800">
                    <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-600 space-y-1.5">
              <div className="font-semibold text-gray-800 mb-2">Логика агрегации</div>
              <p>Несколько строк с одинаковым артикулом суммируются по количеству.</p>
              <p>Для штучных товаров количество должно быть целым числом.</p>
            </div>
          </div>
        )}

        <div className="bg-amber-50 rounded-2xl p-4 mt-4 text-xs text-amber-700 space-y-1">
          <div className="font-semibold text-amber-800">Сроки подачи</div>
          <p>Промежуточный отчёт — не позднее 15-го рабочего дня месяца.</p>
          <p>Окончательный отчёт — не позднее 3-го рабочего дня следующего месяца.</p>
          <p>Форматы файлов: XLSX, XLS. Максимум 10 МБ.</p>
        </div>

        <button onClick={onClose} className="mt-6 w-full py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-medium hover:bg-blue-700 transition-colors">
          Понятно
        </button>
      </div>
    </div>
  );
}

// ─── CISLink Request Modal ────────────────────────────────────────────────────

function CISLinkRequestModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-2">Заявка отправлена</div>
          <div className="text-sm text-gray-500 mb-6">Специалист PROTECO свяжется с вами в течение 1–2 рабочих дней для согласования подключения CISLink.</div>
          <button onClick={onClose} className="px-8 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-medium hover:bg-blue-700 transition-colors">
            Закрыть
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-semibold text-gray-900">Заявка на подключение к CISLink</div>
            <div className="text-xs text-gray-500 mt-0.5">Заполните данные технического специалиста</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Кол-во баз 1С</label>
              <input type="number" defaultValue="2" className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Конфигурация 1С</label>
              <input type="text" defaultValue="Управление торговлей" className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Версия 1С</label>
            <input type="text" defaultValue="8.3.22" className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">ФИО технического специалиста</label>
            <input type="text" placeholder="Иванов Иван Иванович" className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Телефон</label>
              <input type="tel" placeholder="+7 (___) ___-__-__" className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email</label>
              <input type="email" placeholder="tech@company.ru" className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Отмена
          </button>
          <button onClick={() => setSent(true)} className="flex-1 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            Отправить заявку
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CISLink Banner (manual mode top) ────────────────────────────────────────

function CISLinkBanner({ onRequest }: { onRequest: () => void }) {
  return (
    <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="flex items-stretch">
        <div className="w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" />
        <div className="flex-1 p-6 flex items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Подключите автоматическую выгрузку отчётов через CISLink</div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                CISLink — сервис автоматизированного сбора данных о продажах, остатках и движении товаров. Модуль устанавливается в вашу учётную систему на базе 1С и ежедневно передаёт данные автоматически. Это избавляет от ручной подготовки отчётов, исключает ошибки при заполнении и даёт дополнительную скидку по Дистрибьюторскому соглашению.
              </p>
            </div>
          </div>
          <button
            onClick={onRequest}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Оставить заявку
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Form ──────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<string, string> = {
  "2026-04": "Апрель 2026",
  "2026-03": "Март 2026",
  "2026-02": "Февраль 2026",
  "2026-01": "Январь 2026",
};

const SALES_ERRORS = [
  { row: 3, field: "Артикул", msg: "«AST-9981» не найден в справочнике товаров PROTECO" },
  { row: 7, field: "Дата реализации", msg: "15.05.2026 выходит за рамки отчётного периода (март 2026)" },
  { row: 12, field: "Количество", msg: "Значение «−5» не может быть отрицательным" },
  { row: 18, field: "ИНН", msg: "«123456789» — некорректное количество цифр (должно быть 10 или 12)" },
  { row: 21, field: "Номер реализации", msg: "Пустое значение — поле обязательно для заполнения" },
];

const STOCK_ERRORS = [
  { row: 2, field: "Артикул", msg: "«PLF-0042» не найден в справочнике товаров PROTECO" },
  { row: 8, field: "Количество", msg: "Значение «3.5» — товар продаётся только поштучно (целое число)" },
  { row: 14, field: "Номенклатура", msg: "Пустое значение — поле обязательно для заполнения" },
];

function UploadForm({
  onSuccess,
  onRequest,
}: {
  onSuccess: (item: typeof HISTORY_BASE[0]) => void;
  onRequest: () => void;
}) {
  const [reportType, setReportType] = useState<"sales" | "stock">("sales");
  const [reportKind, setReportKind] = useState<"interim" | "final">("final");
  const [period, setPeriod] = useState("2026-04");
  const [step, setStep] = useState<UploadStep>("form");
  const [selectedFile, setSelectedFile] = useState("");
  const [showRules, setShowRules] = useState(false);

  const typeLabel = reportType === "sales" ? "Продажи" : "Остатки";
  const kindLabel = reportKind === "final" ? "Окончательный" : "Промежуточный";
  const errors = reportType === "sales" ? SALES_ERRORS : STOCK_ERRORS;

  const handleFileSelect = () => {
    const pfx = reportType === "sales" ? "sales" : "stock";
    const sfx = reportKind === "final" ? "final" : "interim";
    setSelectedFile(`${pfx}_${sfx}_${period}.xlsx`);
    setStep("selected");
  };

  const handleProcess = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 1800);
  };

  const handleReset = () => {
    setStep("form");
    setSelectedFile("");
  };

  const handleSuccessNew = () => {
    onSuccess({
      id: Date.now(),
      dateTime: "10.04.2026 " + new Date().toTimeString().slice(0, 5),
      type: typeLabel,
      kind: kindLabel,
      period: PERIOD_LABELS[period],
      fileName: selectedFile,
      status: "Загружен",
      timeliness: "вовремя",
      correctable: true,
      author: "Смирнов А.В.",
    });
    setStep("form");
    setSelectedFile("");
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Form header */}
        <div className="px-7 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Загрузить новый отчёт</div>
              <div className="text-xs text-gray-500">Выберите параметры и прикрепите файл</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Тип отчёта */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Тип отчёта</label>
              <div className="flex gap-2">
                {(["sales", "stock"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setReportType(t)}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all border ${
                      reportType === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {t === "sales" ? "Продажи" : "Остатки"}
                  </button>
                ))}
              </div>
            </div>

            {/* Вид отчёта */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Вид отчёта</label>
              <div className="flex gap-2">
                {(["interim", "final"] as const).map(k => (
                  <button
                    key={k}
                    onClick={() => setReportKind(k)}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all border ${
                      reportKind === k
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {k === "interim" ? "Промежуточный" : "Окончательный"}
                  </button>
                ))}
              </div>
            </div>

            {/* Период */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Отчётный период</label>
              <div className="relative">
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="w-full py-2.5 px-3 pr-8 rounded-2xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
                >
                  {Object.entries(PERIOD_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Upload area */}
        <div className="px-7 py-5">
          {step === "form" && (
            <div
              onClick={handleFileSelect}
              className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-sm font-medium text-gray-700 mb-1">Нажмите, чтобы выбрать файл</div>
              <div className="text-xs text-gray-400">XLSX, XLS · Максимум 10 МБ</div>
            </div>
          )}

          {step === "selected" && (
            <div className="border border-blue-200 bg-blue-50 rounded-3xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{selectedFile}</div>
                  <div className="text-xs text-gray-500 mt-0.5">42 KB · Готов к обработке</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleReset} className="p-2 hover:bg-blue-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={handleProcess} className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  Начать обработку
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="border border-blue-200 bg-blue-50 rounded-3xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800 mb-1.5">Файл обрабатывается…</div>
                <div className="text-xs text-gray-500 mb-2">Проверка формата → структуры → содержимого строк</div>
                <div className="w-full bg-blue-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-900 mb-1">Отчёт успешно загружен</div>
                <div className="text-sm text-green-700">
                  {typeLabel} · {kindLabel} · {PERIOD_LABELS[period]} · <span className="font-medium">{selectedFile}</span>
                </div>
                <div className="text-xs text-green-600 mt-1">✓ Данные переданы в BD-Litics. Запись добавлена в историю загрузок.</div>
              </div>
              <button onClick={handleSuccessNew} className="flex-shrink-0 px-4 py-2.5 bg-white border border-green-200 text-green-700 rounded-2xl text-sm font-medium hover:bg-green-50 transition-colors">
                Загрузить ещё
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-red-800">Файл не прошёл проверку</div>
                  <div className="text-sm text-red-600 mt-0.5">
                    Найдено {errors.length} ошибок. Исправьте файл и загрузите повторно.
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden mb-4 border border-red-100">
                <div className="px-4 py-2.5 border-b border-red-100 text-xs font-semibold text-red-700 uppercase tracking-wide bg-red-50">
                  Все найденные ошибки ({errors.length})
                </div>
                <div className="divide-y divide-gray-100">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
                        Стр. {err.row}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-gray-700">{err.field}: </span>
                        <span className="text-xs text-gray-600">{err.msg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleReset} className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  Загрузить исправленный файл
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 border border-red-200 bg-white text-red-700 rounded-2xl text-sm font-medium hover:bg-red-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Скачать ошибки
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic template + rules links */}
        <div className="px-7 py-4 border-t border-gray-100 flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <Download className="w-4 h-4" />
            Скачать шаблон {typeLabel === "Продажи" ? "продаж" : "остатков"}
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Правила заполнения {typeLabel === "Продажи" ? "для продаж" : "для остатков"}
          </button>
        </div>
      </div>

      {showRules && <RulesModal reportType={reportType} onClose={() => setShowRules(false)} />}
    </>
  );
}

// ─── History Filters ──────────────────────────────────────────────────────────

function HistoryFilters({
  filterPeriod, setFilterPeriod,
  filterType, setFilterType,
  filterStatus, setFilterStatus,
  count, total,
}: {
  filterPeriod: string; setFilterPeriod: (v: string) => void;
  filterType: string; setFilterType: (v: string) => void;
  filterStatus: string; setFilterStatus: (v: string) => void;
  count: number; total: number;
}) {
  const hasFilter = filterPeriod !== "all" || filterType !== "all" || filterStatus !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Filter className="w-3.5 h-3.5" />
        <span className="font-medium">Фильтры:</span>
      </div>

      {/* Period */}
      <div className="relative">
        <select
          value={filterPeriod}
          onChange={e => setFilterPeriod(e.target.value)}
          className="pl-3 pr-8 py-2 rounded-2xl border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
        >
          <option value="all">Все периоды</option>
          <option value="Апрель 2026">Апрель 2026</option>
          <option value="Март 2026">Март 2026</option>
          <option value="Февраль 2026">Февраль 2026</option>
          <option value="Январь 2026">Январь 2026</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Type */}
      <div className="relative">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="pl-3 pr-8 py-2 rounded-2xl border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
        >
          <option value="all">Все типы</option>
          <option value="Продажи">Продажи</option>
          <option value="Остатки">Остатки</option>
          <option value="Промежуточный">Промежуточный</option>
          <option value="Окончательный">Окончательный</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Status */}
      <div className="relative">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="pl-3 pr-8 py-2 rounded-2xl border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
        >
          <option value="all">Все статусы</option>
          <option value="Загружен">Загружен</option>
          <option value="Скорректирован">Скорректирован</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {hasFilter && (
        <button
          onClick={() => { setFilterPeriod("all"); setFilterType("all"); setFilterStatus("all"); }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-2 rounded-2xl border border-gray-200 hover:border-gray-300"
        >
          <X className="w-3 h-3" /> Сбросить
        </button>
      )}

      <div className="ml-auto text-xs text-gray-400">
        {count === total ? `${total} записей` : `${count} из ${total}`}
      </div>
    </div>
  );
}

// ─── Manual History Table ─────────────────────────────────────────────────────

function ManualHistoryTable({
  data,
  onCorrect,
  highlightId,
}: {
  data: typeof HISTORY_BASE;
  onCorrect?: (id: number) => void;
  highlightId?: number | null;
}) {
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = useMemo(() => data.filter(row => {
    if (filterPeriod !== "all" && row.period !== filterPeriod) return false;
    if (filterType !== "all") {
      if (filterType === "Продажи" && row.type !== "Продажи") return false;
      if (filterType === "Остатки" && row.type !== "Остатки") return false;
      if (filterType === "Промежуточный" && row.kind !== "Промежуточный") return false;
      if (filterType === "Окончательный" && row.kind !== "Окончательный") return false;
    }
    if (filterStatus !== "all" && row.status !== filterStatus) return false;
    return true;
  }), [data, filterPeriod, filterType, filterStatus]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-gray-900">История загрузок</div>
            <div className="text-xs text-gray-500 mt-0.5">Сортировка: новые сначала</div>
          </div>
        </div>
        <HistoryFilters
          filterPeriod={filterPeriod} setFilterPeriod={setFilterPeriod}
          filterType={filterType} setFilterType={setFilterType}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          count={filtered.length} total={data.length}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 whitespace-nowrap">Дата и время</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Тип / Вид</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Период</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Автор</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Статус</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Файл</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                  Нет записей, соответствующих фильтрам
                </td>
              </tr>
            )}
            {filtered.map(row => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50/70 transition-colors ${highlightId === row.id ? "bg-blue-50/40" : ""}`}
              >
                <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {row.dateTime}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{row.type}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{row.kind}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {row.period}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {row.author}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={row.status} timeliness={row.timeliness} />
                </td>
                <td className="px-4 py-4">
                  <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Скачать
                  </button>
                </td>
                <td className="px-4 py-4">
                  {onCorrect && row.correctable ? (
                    <button
                      onClick={() => onCorrect(row.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Скорректировать
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300 px-1">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400">Страница 1 из 1</span>
        <div className="flex gap-2">
          <button disabled className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-300 cursor-not-allowed">← Назад</button>
          <button disabled className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-300 cursor-not-allowed">Вперёд →</button>
        </div>
      </div>
    </div>
  );
}

// ─── CISLink Support Contacts ─────────────────────────────────────────────────

function SupportContacts({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm ${compact ? "p-5" : "p-6"}`}>
      <div className="font-semibold text-gray-900 text-sm mb-4">Служба поддержки CISLink</div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <a href="tel:88002008020" className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Телефон</div>
            <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">8 (800) 200-80-20</div>
          </div>
        </a>
        <a href="mailto:support@cislink.ru" className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">support@cislink.ru</div>
          </div>
        </a>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Clock className="w-3.5 h-3.5" />
        пн–пт, 9:00–18:00 МСК · данные обновляются каждые 4 ч.
      </div>
    </div>
  );
}

// ─── CISLink History Table ────────────────────────────────────────────────────

function CISHistoryTable({ data }: { data: typeof CIS_SUCCESS }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900">История автоматических загрузок</div>
          <div className="text-xs text-gray-500 mt-0.5">Показаны релевантные записи согласно логике отображения</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <RefreshCw className="w-3.5 h-3.5" />
          Обновлено: 10.04.2026 08:00
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Дата и время передачи</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Глубина данных</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Способ</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Статус пакета</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Сообщение</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(row => (
              <tr key={row.id} className={`hover:bg-gray-50/70 transition-colors ${row.status === "error" ? "bg-red-50/20" : ""}`}>
                <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {row.dateTime}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{row.depth}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${
                    row.method === "FTP" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                  }`}>
                    {row.method}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {row.status === "success"
                    ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" /> Принят</span>
                    : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium"><XCircle className="w-3.5 h-3.5" /> Отклонён</span>
                  }
                </td>
                <td className="px-4 py-4 max-w-xs">
                  {row.errors && row.errors.length > 0
                    ? <span className="text-xs text-red-600 leading-relaxed">{row.errors[0]}</span>
                    : <span className="text-xs text-gray-400">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shared CorrectionPanel ───────────────────────────────────────────────────

function CorrectionPanel({
  corrStep,
  record,
  onCancel,
  onProcess,
}: {
  corrStep: CorrStep;
  record: typeof HISTORY_BASE[0] | undefined;
  onCancel: () => void;
  onProcess: () => void;
}) {
  if (corrStep === "select") return null;
  return (
    <div className={`rounded-3xl p-6 border ${corrStep === "done" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}>
      {corrStep === "upload" && record && (
        <>
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-blue-900">Режим корректировки</div>
              <div className="text-sm text-blue-700 mt-1">
                Вы заменяете ранее загруженный отчёт. Тип и период зафиксированы автоматически — изменить нельзя.
              </div>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-blue-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-blue-500" />
            </button>
          </div>
          <div className="bg-white rounded-2xl p-4 mb-5 grid grid-cols-3 gap-4 border border-blue-100">
            <div>
              <div className="text-xs text-gray-500 mb-1">Тип отчёта</div>
              <div className="text-sm font-semibold text-gray-900">{record.type}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Вид отчёта</div>
              <div className="text-sm font-semibold text-gray-900">{record.kind}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Период</div>
              <div className="text-sm font-semibold text-gray-900">{record.period}</div>
            </div>
          </div>
          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-5 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {record.fileName.replace(".xlsx", "_v2.xlsx")}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">56 KB · Новый файл для замены</div>
              </div>
            </div>
            <button
              onClick={onProcess}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Загрузить и заменить
            </button>
          </div>
        </>
      )}

      {corrStep === "processing" && (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-blue-900 mb-1">Обрабатывается корректировка…</div>
            <div className="text-sm text-blue-600 mb-2">Проверка структуры и валидация строк</div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {corrStep === "done" && (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-green-900">Корректировка выполнена успешно</div>
            <div className="text-sm text-green-700 mt-0.5">
              Новый файл принят. Обновление передано в BD-Litics. История загрузок обновлена.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared correction state hook ─────────────────────────────────────────────

function useCorrectionFlow(initialHistory: typeof HISTORY_BASE) {
  const [history, setHistory] = useState(initialHistory);
  const [corrStep, setCorrStep] = useState<CorrStep>("select");
  const [correctingId, setCorrectingId] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const record = history.find(r => r.id === correctingId);

  const handleStartCorrect = (id: number) => {
    setCorrectingId(id);
    setCorrStep("upload");
  };

  const handleProcess = () => {
    setCorrStep("processing");
    setTimeout(() => {
      setCorrStep("done");
      setHighlightId(correctingId);
      setHistory(prev =>
        prev.map(r =>
          r.id === correctingId
            ? { ...r, status: "Скорректирован", fileName: r.fileName.replace(".xlsx", "_v2.xlsx"), correctable: false }
            : r
        )
      );
    }, 1800);
  };

  const handleCancel = () => setCorrStep("select");

  return {
    history, setHistory,
    corrStep, record,
    highlightId,
    handleStartCorrect,
    handleProcess,
    handleCancel,
  };
}

// ─── Scenario 1: Ручная загрузка — без ошибок ─────────────────────────────────

function Scenario1({ onRequest }: { onRequest: () => void }) {
  const corr = useCorrectionFlow(HISTORY_BASE);

  return (
    <div className="space-y-5">
      <CISLinkBanner onRequest={onRequest} />
      <UploadForm
        onSuccess={item => corr.setHistory(prev => [item, ...prev])}
        onRequest={onRequest}
      />
      <CorrectionPanel
        corrStep={corr.corrStep}
        record={corr.record}
        onCancel={corr.handleCancel}
        onProcess={corr.handleProcess}
      />
      <ManualHistoryTable
        data={corr.history}
        onCorrect={corr.corrStep === "select" ? corr.handleStartCorrect : undefined}
        highlightId={corr.highlightId}
      />
    </div>
  );
}

// ─── Scenario 2: Ручная загрузка — с ошибкой ──────────────────────────────────

function Scenario2({ onRequest }: { onRequest: () => void }) {
  const [step, setStep] = useState<"idle" | "processing" | "error">("idle");
  const [reportType, setReportType] = useState<"sales" | "stock">("sales");
  const [showRules, setShowRules] = useState(false);
  const corr = useCorrectionFlow(HISTORY_BASE);

  const errors = reportType === "sales" ? SALES_ERRORS : STOCK_ERRORS;
  const typeLabel = reportType === "sales" ? "Продажи" : "Остатки";

  return (
    <div className="space-y-5">
      <CISLinkBanner onRequest={onRequest} />

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Загрузить новый отчёт</div>
              <div className="text-xs text-gray-500">Выберите параметры и прикрепите файл</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Тип отчёта</label>
              <div className="flex gap-2">
                {(["sales", "stock"] as const).map(t => (
                  <button key={t} onClick={() => { setReportType(t); setStep("idle"); }}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all border ${reportType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"}`}>
                    {t === "sales" ? "Продажи" : "Остатки"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Вид отчёта</label>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-2xl text-sm font-medium border bg-white text-gray-700 border-gray-200 hover:border-blue-300">Промежуточный</button>
                <button className="flex-1 py-2.5 rounded-2xl text-sm font-medium border bg-blue-600 text-white border-blue-600">Окончательный</button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Отчётный период</label>
              <div className="relative">
                <select className="w-full py-2.5 px-3 pr-8 rounded-2xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none appearance-none">
                  <option>Март 2026</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-7 py-5">
          {step === "idle" && (
            <div className="border border-blue-200 bg-blue-50 rounded-3xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {reportType === "sales" ? "sales_final_2026-03_incorrect.xlsx" : "stock_final_2026-03_incorrect.xlsx"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">87 KB · Готов к обработке</div>
                </div>
              </div>
              <button onClick={() => { setStep("processing"); setTimeout(() => setStep("error"), 1800); }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-medium hover:bg-blue-700 transition-colors">
                Начать обработку
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="border border-blue-200 bg-blue-50 rounded-3xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800 mb-1.5">Файл обрабатывается…</div>
                <div className="text-xs text-gray-500 mb-2">Проверка формата → структуры → содержимого строк</div>
                <div className="w-full bg-blue-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-red-800">Файл не прошёл проверку</div>
                  <div className="text-sm text-red-600 mt-0.5">
                    Найдено {errors.length} ошибок. Исправьте файл и загрузите повторно.
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden mb-4 border border-red-100">
                <div className="px-4 py-2.5 border-b border-red-100 text-xs font-semibold text-red-700 uppercase tracking-wide bg-red-50">
                  Все найденные ошибки — {typeLabel} ({errors.length})
                </div>
                <div className="divide-y divide-gray-100">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
                        Стр. {err.row}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-gray-700">{err.field}: </span>
                        <span className="text-xs text-gray-600">{err.msg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("idle")} className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  Загрузить исправленный файл
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 border border-red-200 bg-white text-red-700 rounded-2xl text-sm font-medium hover:bg-red-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Скачать ошибки
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-7 py-4 border-t border-gray-100 flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <Download className="w-4 h-4" />
            Скачать шаблон {typeLabel === "Продажи" ? "продаж" : "остатков"}
          </button>
          <button onClick={() => setShowRules(true)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <HelpCircle className="w-4 h-4" />
            Правила заполнения {typeLabel === "Продажи" ? "для продаж" : "для остатков"}
          </button>
        </div>
      </div>

      <CorrectionPanel
        corrStep={corr.corrStep}
        record={corr.record}
        onCancel={corr.handleCancel}
        onProcess={corr.handleProcess}
      />
      <ManualHistoryTable
        data={corr.history}
        onCorrect={corr.corrStep === "select" ? corr.handleStartCorrect : undefined}
        highlightId={corr.highlightId}
      />
      {showRules && <RulesModal reportType={reportType} onClose={() => setShowRules(false)} />}
    </div>
  );
}

// ─── Scenario 3: Ручная корректировка ─────────────────────────────────────────

function Scenario3({ onRequest }: { onRequest: () => void }) {
  const corr = useCorrectionFlow(HISTORY_BASE);

  return (
    <div className="space-y-5">
      <CISLinkBanner onRequest={onRequest} />
      <CorrectionPanel
        corrStep={corr.corrStep}
        record={corr.record}
        onCancel={corr.handleCancel}
        onProcess={corr.handleProcess}
      />
      <ManualHistoryTable
        data={corr.history}
        onCorrect={corr.corrStep === "select" ? corr.handleStartCorrect : undefined}
        highlightId={corr.highlightId}
      />
    </div>
  );
}

// ─── Scenario 4: CISLink — пакет принят ───────────────────────────────────────

function Scenario4() {
  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 mb-1">Автоматическая передача данных активна</div>
          <p className="text-sm text-gray-500">
            Ваша организация подключена к CISLink. Данные о продажах и остатках передаются автоматически каждые 4 часа. Ручная загрузка не требуется.
          </p>
        </div>
      </div>

      {/* Status block */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-semibold text-gray-900">Статус обмена данными</div>
            <div className="text-xs text-gray-400 mt-0.5">Последнее обновление: 10.04.2026 08:00</div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold border border-green-100">
            <CheckCircle className="w-4 h-4" /> Пакет принят
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Глубина данных", value: "01.03.2026 – 31.03.2026" },
            { label: "Способ передачи", value: "API", pill: true },
            { label: "Следующее обновление", value: "10.04.2026 12:00" },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs text-gray-500 mb-1">{item.label}</div>
              {item.pill
                ? <span className="inline-flex items-center text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">{item.value}</span>
                : <div className="text-sm font-semibold text-gray-800">{item.value}</div>
              }
            </div>
          ))}
        </div>
      </div>

      <CISHistoryTable data={CIS_SUCCESS} />
      <SupportContacts />
    </div>
  );
}

// ─── Scenario 5: CISLink — ошибка пакета ──────────────────────────────────────

function Scenario5() {
  const allErrors = [
    "Ошибка формата данных: CISLink вернул некорректный ответ на запрос выгрузки.",
    "Авторизация прошла успешно, но данные не были переданы в систему.",
  ];

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 mb-1">Автоматическая передача данных активна</div>
          <p className="text-sm text-gray-500">Ваша организация подключена к CISLink. Данные передаются автоматически. Последняя попытка завершилась с ошибкой.</p>
        </div>
      </div>

      {/* Status */}
      <div className="bg-red-50 rounded-3xl border border-red-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-semibold text-red-900">Статус обмена данными</div>
            
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-semibold border border-red-200">
            <XCircle className="w-4 h-4" /> Пакет отклонён
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Последняя попытка", value: "10.04.2026 08:00" },
            { label: "Последняя успешная", value: "08.04.2026 12:00" },
            { label: "Способ передачи", value: "API", pill: true },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl p-4 border border-red-100">
              <div className="text-xs text-gray-500 mb-1">{item.label}</div>
              {item.pill
                ? <span className="inline-flex items-center text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">{item.value}</span>
                : <div className="text-sm font-semibold text-gray-800">{item.value}</div>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Unified error block */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Ошибки пакета данных</div>
            <div className="text-xs text-gray-500 mt-0.5">Нормализованные сообщения для устранения</div>
          </div>
        </div>
        <div className="space-y-3">
          {allErrors.map((err, i) => (
            <div key={i} className="flex items-start gap-3 bg-red-50 rounded-2xl p-4 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-800">{err}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          Что проверить самостоятельно
        </div>
        <div className="space-y-3">
          {[
            { n: "1", text: "Проверьте настройки выгрузки в вашей учётной системе (1С): убедитесь, что модуль CISLink активен и работает." },
            { n: "2", text: "Убедитесь, что токен доступа CISLink не истёк. При необходимости обновите его в настройках интеграции." },
            { n: "3", text: "Проверьте журнал ошибок модуля CISLink на стороне 1С на наличие технических сообщений." },
          ].map(item => (
            <div key={item.n} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">{item.n}</div>
              <p className="text-sm text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support — immediately after error */}
      <SupportContacts />

      <CISHistoryTable data={CIS_ERROR} />
    </div>
  );
}

// ─── Scenario 6: CISLink — FTP-сценарий ──────────────────────────────────────

function Scenario6() {
  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 mb-1">Автоматическая передача данных активна (FTP)</div>
          <p className="text-sm text-gray-500">Ваша организация подключена к CISLink. Данные передаются через FTP.</p>
        </div>
      </div>

      {/* FTP warning */}
      <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="font-semibold text-amber-900 mb-1">Включите автоматическую выгрузку данных</div>
            <p className="text-sm text-amber-800 leading-relaxed">
              При настройке модуля CISLink необходимо заменить ручную отправку данных через <strong>FTP</strong> на автоматическую по расписанию через <strong>API</strong>. Это обеспечит бесперебойную и своевременную передачу данных без ручного участия.
            </p>
            <div className="mt-4">
              <a href="mailto:support@cislink.ru" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-2xl text-sm font-medium hover:bg-amber-700 transition-colors">
                <Mail className="w-4 h-4" />
                Запросить помощь с переходом на API
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Status block */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-semibold text-gray-900">Статус обмена данными</div>
            <div className="text-xs text-gray-400 mt-0.5">Последнее обновление: 10.04.2026 08:00</div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold border border-green-100">
            <CheckCircle className="w-4 h-4" /> Пакет принят
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Глубина данных", value: "01.03.2026 – 31.03.2026" },
            { label: "Способ передачи", value: "FTP", pillAmber: true },
            { label: "Следующая передача", value: "Ручная (по расписанию FTP)" },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs text-gray-500 mb-1">{item.label}</div>
              {item.pillAmber
                ? <span className="inline-flex items-center text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">{item.value}</span>
                : <div className="text-sm font-semibold text-gray-800">{item.value}</div>
              }
            </div>
          ))}
        </div>
      </div>

      <CISHistoryTable data={CIS_FTP} />
      <SupportContacts />
    </div>
  );
}

// ─── Scenario definitions ─────────────────────────────────────────────────────

const SCENARIOS = [
  { id: 1 as Scenario, label: "Ручная загрузка", sub: "Без ошибок", mode: "manual" as const },
  { id: 2 as Scenario, label: "Ручная загрузка", sub: "С ошибкой", mode: "manual" as const },
  { id: 3 as Scenario, label: "Корректировка", sub: "Ручного отчёта", mode: "manual" as const },
  { id: 4 as Scenario, label: "CISLink", sub: "Пакет принят", mode: "auto" as const },
  { id: 5 as Scenario, label: "CISLink", sub: "Ошибка пакета", mode: "auto" as const },
  { id: 6 as Scenario, label: "CISLink", sub: "FTP-сценарий", mode: "auto" as const },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function Reporting() {
  const [active, setActive] = useState<Scenario>(1);
  const [showCISForm, setShowCISForm] = useState(false);

  const current = SCENARIOS.find(s => s.id === active)!;
  const isManual = current.mode === "manual";

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-gray-900">Отчётность</h1>
          <p className="text-gray-500 mt-1 text-sm">Продажи и остатки · Только РФ · MVP</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold border ${
          isManual ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-indigo-50 text-indigo-700 border-indigo-100"
        }`}>
          {isManual ? <Upload className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
          {isManual ? "Ручная подача" : "CISLink · Авто"}
        </div>
      </div>

      {/* Scenario switcher */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 border-b border-gray-100 text-xs font-semibold uppercase tracking-wide">
          <div className="flex items-center gap-2 px-5 py-3 border-r border-gray-100 text-blue-600">
            <Upload className="w-3.5 h-3.5" /> Ручной режим
          </div>
          <div className="flex items-center gap-2 px-5 py-3 text-indigo-600">
            <Zap className="w-3.5 h-3.5" /> Автоматический режим (CISLink)
          </div>
        </div>
        <div className="grid grid-cols-6 gap-0 p-2">
          {SCENARIOS.map(s => {
            const isActive = active === s.id;
            const isAuto = s.mode === "auto";
            const isError = s.sub.toLowerCase().includes("ошибк");
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-3 rounded-2xl text-center transition-all ${
                  isActive
                    ? isAuto ? "bg-indigo-600 text-white shadow-sm" : "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className={`text-xs font-bold tracking-wide ${isActive ? "opacity-60" : "text-gray-400"}`}>С{s.id}</span>
                <span className="text-xs font-semibold leading-snug">{s.label}</span>
                <span className={`text-xs leading-tight ${
                  isActive ? "opacity-60" : isError ? "text-red-400" : s.sub === "FTP-сценарий" ? "text-amber-500" : "text-gray-400"
                }`}>{s.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario label */}
      <div className="flex items-center gap-3">
        <div className={`px-4 py-1.5 rounded-2xl text-xs font-bold ${isManual ? "bg-blue-600 text-white" : "bg-indigo-600 text-white"}`}>
          Сценарий {active}
        </div>
        <span className="text-sm font-semibold text-gray-800">{current.label}</span>
        <span className="text-sm text-gray-400">·</span>
        <span className="text-sm text-gray-500">{current.sub}</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Scenario content */}
      {active === 1 && <Scenario1 onRequest={() => setShowCISForm(true)} />}
      {active === 2 && <Scenario2 onRequest={() => setShowCISForm(true)} />}
      {active === 3 && <Scenario3 onRequest={() => setShowCISForm(true)} />}
      {active === 4 && <Scenario4 />}
      {active === 5 && <Scenario5 />}
      {active === 6 && <Scenario6 />}

      {showCISForm && <CISLinkRequestModal onClose={() => setShowCISForm(false)} />}
    </div>
  );
}
