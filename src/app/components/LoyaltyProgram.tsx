import {
  Search,
  X,
  Gift,
  Clock,
  CheckCheck,
  AlertTriangle,
  Package,
  Truck,
  Check,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
  Clock3,
  Download,
} from "lucide-react";
import { useState, useMemo, Fragment } from "react";

// ── Типы ──────────────────────────────────────────────────────────────────────
const CORE_STEPS = [
  "Отправлен со склада PROTECO",
  "Передан клинике",
  "Получен клиникой",
] as const;

const ALL_STATUSES = [...CORE_STEPS, "Жалоба клиники"] as const;

type CoreStep = (typeof CORE_STEPS)[number];
type RequestStatus = (typeof ALL_STATUSES)[number];

interface HistoryItem {
  status: RequestStatus;
  at?: string;
  actor?: string;
  description?: string;
}

interface Shipment {
  updNumber?: string;
  warehouse?: string;
  shippedAt?: string;
  shipmentNumber?: string;
}

interface LoyaltyRequest {
  id: number;
  date: string;
  time: string;
  dateTime: Date;
  distributor: string;
  clinic: string;
  city: string;
  inn: string;
  contact: { name: string; phone: string };
  gifts: string[];
  shipment?: Shipment;
  status: RequestStatus;
  history: HistoryItem[];
}

// ── Тестовые данные ───────────────────────────────────────────────────────────
const INITIAL_REQUESTS: LoyaltyRequest[] = [
  {
    id: 101,
    date: "05.04.2026",
    time: "09:40",
    dateTime: new Date("2026-04-05T09:40:00"),
    distributor: "ООО «Стоматология 32»",
    clinic: "Стоматология 32",
    city: "г. Самара",
    inn: "6312089743",
    contact: {
      name: "Ботяновская Юлия Викторовна",
      phone: "+79027668533",
    },
    gifts: [
      "Sigma Cake Set III",
      "Estelite Universal Flow шприц 3,8 г",
    ],
    shipment: {
      updNumber: "УПД № 45821",
      warehouse: "Москва",
      shippedAt: "02.04.2026",
      shipmentNumber: "Отгрузка № СК-000512",
    },
    status: "Получен клиникой",
    history: [
      {
        status: "Запрос на отправку",
        at: "29.03.2026, 16:20",
        actor: "Иванов И. И.",
        description: "Запрос на подарок создан клиникой",
      },
      {
        status: "Отправлен со склада PROTECO",
        at: "30.03.2026, 09:15",
        actor: "Склад PROTECO",
        description:
          "Подарок упакован и передан в службу доставки",
      },
      {
        status: "Передан клинике",
        at: "31.03.2026, 11:42",
        actor: "Курьерская служба",
        description: "Подарок передан представителю клиники",
      },
      {
        status: "Получен клиникой",
        at: "02.04.2026, 14:18",
        actor: "Петров П. П. / Клиника «Стоматология 32»",
        description: "Клиника подтвердила получение подарка",
      },
    ],
  },
  {
    id: 102,
    date: "29.03.2026",
    time: "16:20",
    dateTime: new Date("2026-03-29T16:20:00"),
    distributor: "Клиника «Дентал Плюс»",
    clinic: "Дентал Плюс",
    city: "г. Казань",
    inn: "5260341287",
    contact: {
      name: "Быстрай Рауль Вячеславович",
      phone: "+79021793063",
    },
    gifts: ["Palfique LX5 A1 3,8 г"],
    shipment: {
      updNumber: "УПД № 45788",
      warehouse: "Москва",
      shippedAt: "27.03.2026",
      shipmentNumber: "Отгрузка № СК-000487",
    },
    status: "Отправлен со склада PROTECO",
    history: [
      {
        status: "Запрос на отправку",
        at: "29.03.2026, 16:20",
        actor: "Иванов И. И.",
        description: "Запрос на подарок создан дистрибьютором",
      },
      {
        status: "Отправлен со склада PROTECO",
        at: "30.03.2026, 09:15",
        actor: "Склад PROTECO",
        description:
          "Подарок передан в отгрузку со склада PROTECO",
      },
    ],
  },
  {
    id: 103,
    date: "25.03.2026",
    time: "11:05",
    dateTime: new Date("2026-03-25T11:05:00"),
    distributor: "ООО «МедиСтом»",
    clinic: "Стома+",
    city: "г. Санкт-Петербург",
    inn: "7801234560",
    contact: {
      name: "Кириллова Наталья Сергеевна",
      phone: "+79119043217",
    },
    gifts: [
      "Estelite Asteria A2 шприц 4,0 г",
      "Bond Force II Kit",
    ],
    shipment: {
      updNumber: "УПД № 45674",
      warehouse: "Санкт-Петербург",
      shippedAt: "25.03.2026",
      shipmentNumber: "Отгрузка № СК-000472",
    },
    status: "Передан клинике",
    history: [
      {
        status: "Запрос на отправку",
        at: "22.03.2026, 10:34",
        actor: "Смирнова А. П.",
        description: "Запрос на подарок создан дистрибьютором",
      },
      {
        status: "Отправлен со склада PROTECO",
        at: "24.03.2026, 17:10",
        actor: "Склад PROTECO",
        description: "Подарок отправлен со склада PROTECO",
      },
      {
        status: "Передан клинике",
        at: "25.03.2026, 11:05",
        actor: "Дистрибьютор",
        description:
          "Дистрибьютор подтвердил передачу подарка клинике",
      },
    ],
  },
  {
    id: 104,
    date: "18.03.2026",
    time: "10:30",
    dateTime: new Date("2026-03-18T10:30:00"),
    distributor: "ООО «Дентал-Трейд»",
    clinic: "Стомадент",
    city: "г. Москва",
    inn: "7702456789",
    contact: {
      name: "Алексеев Дмитрий Олегович",
      phone: "+79165584102",
    },
    gifts: ["Palfique LX5 A3 3,8 г"],
    shipment: {
      updNumber: "УПД № 45590",
      warehouse: "Москва",
      shippedAt: "18.03.2026",
      shipmentNumber: "Отгрузка № СК-000451",
    },
    status: "Жалоба клиники",
    history: [
      {
        status: "Запрос на отправку",
        at: "15.03.2026, 12:15",
        actor: "Иванов И. И.",
        description: "Запрос на подарок создан дистрибьютором",
      },
      {
        status: "Отправлен со склада PROTECO",
        at: "17.03.2026, 09:20",
        actor: "Склад PROTECO",
        description: "Подарок отправлен со склада PROTECO",
      },
      {
        status: "Передан клинике",
        at: "18.03.2026, 10:30",
        actor: "Дистрибьютор",
        description:
          "Дистрибьютор подтвердил передачу подарка клинике",
      },
      {
        status: "Жалоба клиники",
        at: "20.03.2026, 15:48",
        actor: "Клиника «Стомадент»",
        description:
          "Клиника сообщила, что подарок не найден у получателя",
      },
    ],
  },
  {
    id: 105,
    date: "12.03.2026",
    time: "13:45",
    dateTime: new Date("2026-03-12T13:45:00"),
    distributor: "ООО «Стоматология 32»",
    clinic: "32 Дент",
    city: "г. Самара",
    inn: "6312089743",
    contact: {
      name: "Морозова Светлана Павловна",
      phone: "+79277341890",
    },
    gifts: ["Estelite Universal Flow шприц 3,8 г"],
    shipment: undefined,
    status: "Запрос на отправку",
    history: [
      {
        status: "Запрос на отправку",
        at: "12.03.2026, 13:45",
        actor: "Иванов И. И.",
        description: "Запрос на подарок создан дистрибьютором",
      },
    ],
  },
];

// ── Вспомогательные функции ───────────────────────────────────────────────────
function getStepIdx(status: RequestStatus): number {
  if (status === "Жалоба клиники")
    return CORE_STEPS.indexOf("Передан клинике");
  return CORE_STEPS.indexOf(status as CoreStep);
}

// ── ShipmentCell ──────────────────────────────────────────────────────────────
function ShipmentCell({ shipment }: { shipment?: Shipment }) {
  if (!shipment) {
    return (
      <div className="text-sm text-gray-400">
        <div>Отгрузка не сформирована</div>
        <div className="mt-1 text-xs">
          УПД, склад и дата появятся после отправки
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1 text-sm">
      <div className="flex items-center gap-1.5 font-semibold text-gray-900">
        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
        {shipment.updNumber}
      </div>
      <div className="text-gray-500">
        Склад: {shipment.warehouse}
      </div>
      <div className="text-gray-500">
        Отгрузка: {shipment.shippedAt}
      </div>
    </div>
  );
}

// ── StatusPill ────────────────────────────────────────────────────────────────
const statusMeta: Record<
  RequestStatus,
  { tone: string; icon: typeof Clock3 }
> = {
  "Запрос на отправку": {
    tone: "text-gray-600 bg-gray-100 border-gray-200",
    icon: Clock3,
  },
  "Отправлен со склада PROTECO": {
    tone: "text-blue-700 bg-blue-50 border-blue-200",
    icon: Package,
  },
  "Передан клинике": {
    tone: "text-blue-700 bg-blue-50 border-blue-200",
    icon: Truck,
  },
  "Получен клиникой": {
    tone: "text-green-700 bg-green-50 border-green-200",
    icon: Check,
  },
  "Жалоба клиники": {
    tone: "text-red-700 bg-red-50 border-red-200",
    icon: AlertTriangle,
  },
};

function StatusPill({ status }: { status: RequestStatus }) {
  const { tone, icon: Icon } = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

// ── CompactStepper (в строке таблицы) ────────────────────────────────────────
function CompactStepper({ status }: { status: RequestStatus }) {
  const isComplaint = status === "Жалоба клиники";
  const isCompleted = status === "Получен клиникой";
  const currentIdx = getStepIdx(status);

  return (
    <div className="space-y-2 min-w-[220px]">
      <div className="flex items-center">
        {CORE_STEPS.map((step, i) => {
          const done = isCompleted || i < currentIdx;
          const current = !isCompleted && i === currentIdx;
          const isComplaintDot =
            isComplaint && i === currentIdx;
          const isLast = i === CORE_STEPS.length - 1;

          return (
            <Fragment key={step}>
              <div
                title={step}
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  done
                    ? "bg-blue-600"
                    : isComplaintDot
                      ? "bg-red-500"
                      : current
                        ? "bg-blue-600 ring-[3px] ring-blue-200"
                        : "bg-gray-200"
                }`}
              >
                {done && (
                  <Check className="w-3 h-3 text-white" />
                )}
                {isComplaintDot && (
                  <AlertTriangle className="w-2.5 h-2.5 text-white" />
                )}
                {!done && !isComplaintDot && current && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mx-0.5 ${done ? "bg-blue-500" : "bg-gray-200"}`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
      {isComplaint ? (
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-red-600">
            Жалоба клиники
          </span>
        </div>
      ) : (
        <span className="text-xs text-gray-500 leading-tight">
          {status}
        </span>
      )}
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function TimelineNode({
  item,
  isLast,
  isCompletedFlow,
}: {
  item: HistoryItem;
  isLast: boolean;
  isCompletedFlow: boolean;
}) {
  const isComplaint = item.status === "Жалоба клиники";
  const isFinalReceived =
    item.status === "Получен клиникой" && isCompletedFlow;

  return (
    <div className="grid grid-cols-[40px_1fr] gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`z-10 flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 ${
            isComplaint
              ? "bg-red-500 text-white ring-4 ring-red-100"
              : isFinalReceived
                ? "bg-blue-600 text-white ring-4 ring-blue-100"
                : "bg-blue-600 text-white"
          }`}
        >
          {isComplaint ? (
            <AlertTriangle className="h-3.5 w-3.5" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
        </div>
        {!isLast && (
          <div
            className={`min-h-10 w-0.5 mt-1 ${isComplaint ? "bg-red-200" : "bg-blue-200"}`}
          />
        )}
      </div>
      <div className="pb-4">
        <div
          className={`text-sm font-semibold ${isComplaint ? "text-red-700" : "text-blue-700"}`}
        >
          {item.status}
        </div>
        <div className="mt-0.5 text-xs text-gray-400">
          {item.at}
        </div>
      </div>
    </div>
  );
}

function PendingTimelineNode({
  step,
  isLast,
}: {
  step: CoreStep;
  isLast: boolean;
}) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-4">
      <div className="flex flex-col items-center">
        <div className="z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-400">
          <Clock3 className="h-3.5 w-3.5" />
        </div>
        {!isLast && (
          <div className="min-h-10 w-0.5 mt-1 bg-gray-200" />
        )}
      </div>
      <div className="pb-4">
        <div className="text-sm font-semibold text-gray-400">
          {step}
        </div>
        <div className="mt-0.5 text-xs text-gray-300">
          Ожидается
        </div>
      </div>
    </div>
  );
}

// ── HistoryPanel (раскрытый блок) ─────────────────────────────────────────────
function HistoryPanel({
  request,
}: {
  request: LoyaltyRequest;
}) {
  const completedFlow = request.status === "Получен клиникой";
  const isComplaint = request.status === "Жалоба клиники";
  const knownCoreStatuses = request.history
    .filter((item) => item.status !== "Жалоба клиники")
    .map((item) => item.status);
  const pendingSteps =
    isComplaint || completedFlow
      ? []
      : CORE_STEPS.filter(
          (step) => !knownCoreStatuses.includes(step),
        );

  return (
    <div className="border-t border-blue-100 bg-blue-50/40 px-6 py-5">
      {/* Детали заявки */}

      {/* Timeline */}
      <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-400">
          История этапов
        </div>
        {request.history.map((item, index) => (
          <TimelineNode
            key={`${request.id}-${item.status}-${item.at}`}
            item={item}
            isLast={
              index === request.history.length - 1 &&
              pendingSteps.length === 0
            }
            isCompletedFlow={completedFlow}
          />
        ))}
        {pendingSteps.map((step, index) => (
          <PendingTimelineNode
            key={`${request.id}-${step}`}
            step={step}
            isLast={index === pendingSteps.length - 1}
          />
        ))}
        {completedFlow && (
          <div className="ml-[58px] mt-1 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 ring-1 ring-green-200">
            ✓ Процесс завершён: подарок подтверждён клиникой.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────────────────────────────
export function LoyaltyProgram() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | RequestStatus
  >("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">(
    "desc",
  );
  const [expandedRows, setExpandedRows] = useState<Set<number>>(
    new Set(),
  );
  const [statuses, setStatuses] = useState<
    Record<number, RequestStatus>
  >(() =>
    Object.fromEntries(
      INITIAL_REQUESTS.map((r) => [r.id, r.status]),
    ),
  );
  const [confirmRequest, setConfirmRequest] =
    useState<LoyaltyRequest | null>(null);

  const requests = useMemo(
    () =>
      INITIAL_REQUESTS.map((r) => ({
        ...r,
        status: statuses[r.id],
      })),
    [statuses],
  );

  const handleTransfer = (request: LoyaltyRequest) => {
    setConfirmRequest(request);
  };

  const confirmTransfer = () => {
    if (!confirmRequest) return;
    setStatuses((prev) => ({
      ...prev,
      [confirmRequest.id]: "Передан клинике",
    }));
    setExpandedRows((prev) =>
      new Set(prev).add(confirmRequest.id),
    );
    setConfirmRequest(null);
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const stats = useMemo(
    () => ({
      pending: requests.filter(
        (r) => r.status === "Запрос на отправку",
      ).length,
      shipped: requests.filter(
        (r) => r.status === "Отправлен со склада PROTECO",
      ).length,
      received: requests.filter(
        (r) => r.status === "Получен клиникой",
      ).length,
      complaint: requests.filter(
        (r) => r.status === "Жалоба клиники",
      ).length,
    }),
    [requests],
  );

  const filtered = useMemo(() => {
    let result = [...requests];
    if (statusFilter !== "all")
      result = result.filter((r) => r.status === statusFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.clinic.toLowerCase().includes(q) ||
          r.distributor.toLowerCase().includes(q) ||
          r.inn.includes(q) ||
          r.gifts.some((g) => g.toLowerCase().includes(q)),
      );
    }
    result.sort((a, b) =>
      sortOrder === "desc"
        ? b.dateTime.getTime() - a.dateTime.getTime()
        : a.dateTime.getTime() - b.dateTime.getTime(),
    );
    return result;
  }, [requests, statusFilter, searchTerm, sortOrder]);

  const isFiltered =
    searchTerm.trim() !== "" || statusFilter !== "all";

  return (
    <div className="space-y-7">
      {/* ── Заголовок ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">
            Программа лояльности
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Мониторинг заявок на отправку призов клиникам
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-700">
          <Building2 className="w-4 h-4" />
          <span>
            Всего заявок:{" "}
            <span className="font-semibold">
              {requests.length}
            </span>
          </span>
        </div>
      </div>

      {/* ── Summary-карточки ── */}
      <div className="grid grid-cols-3 gap-3">

        <button
          onClick={() =>
            setStatusFilter(
              statusFilter === "Отправлен со склада PROTECO"
                ? "all"
                : "Отправлен со склада PROTECO",
            )
          }
          className={`rounded-3xl p-5 border text-left transition-all ${statusFilter === "Отправлен со склада PROTECO" ? "bg-blue-100 border-blue-400 ring-2 ring-blue-400" : "bg-white border-gray-200 hover:border-blue-200"}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 leading-tight">
              Отправлен со склада PROTECO
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.shipped}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            требуют подтверждения передачи
          </div>
        </button>

        <button
          onClick={() =>
            setStatusFilter(
              statusFilter === "Получен клиникой"
                ? "all"
                : "Получен клиникой",
            )
          }
          className={`rounded-3xl p-5 border text-left transition-all ${statusFilter === "Получен клиникой" ? "bg-green-100 border-green-400 ring-2 ring-green-400" : "bg-white border-gray-200 hover:border-green-200"}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCheck className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 leading-tight">
              Получен клиникой
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.received}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            завершено успешно
          </div>
        </button>

        <button
          onClick={() =>
            setStatusFilter(
              statusFilter === "Жалоба клиники"
                ? "all"
                : "Жалоба клиники",
            )
          }
          className={`rounded-3xl p-5 border text-left transition-all ${
            statusFilter === "Жалоба клиники"
              ? "bg-red-100 border-red-400 ring-2 ring-red-400"
              : stats.complaint > 0
                ? "bg-red-50 border-red-200 hover:border-red-300"
                : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${stats.complaint > 0 ? "bg-red-100" : "bg-gray-100"}`}
            >
              <AlertTriangle
                className={`w-4 h-4 ${stats.complaint > 0 ? "text-red-600" : "text-gray-400"}`}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 leading-tight">
              Жалоба клиники
            </span>
          </div>
          <div
            className={`text-2xl font-bold ${stats.complaint > 0 ? "text-red-600" : "text-gray-400"}`}
          >
            {stats.complaint}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            требуют разбора
          </div>
        </button>
      </div>

      {/* ── Поиск и фильтр ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск по клинике, ИНН, номеру УПД или призу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "all" | RequestStatus,
              )
            }
            className="px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none min-w-[220px]"
          >
            <option value="all">Все статусы</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-2xl text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Скачать в Excel
          </button>

          {isFiltered && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* ── Таблица ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="px-4 py-3.5 text-left text-sm font-semibold whitespace-nowrap w-28">
                  Дата
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold min-w-44">
                  Клиника
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold min-w-40">
                  Контакты
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold min-w-48">
                  Перечень призов
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold min-w-44">
                  Связанная отгрузка
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold min-w-52">
                  Прогресс
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold whitespace-nowrap w-44">
                  Действие
                </th>
                <th className="px-4 py-3.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-14 text-center"
                  >
                    <Gift className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <div className="text-gray-500 text-sm font-medium">
                      {isFiltered
                        ? "По вашему запросу ничего не найдено"
                        : "Заявок по программе лояльности пока нет"}
                    </div>
                    {isFiltered && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                        className="mt-2 text-xs text-blue-500 hover:underline"
                      >
                        Сбросить фильтры
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((req, idx) => {
                  const isExpanded = expandedRows.has(req.id);
                  const isComplaint =
                    req.status === "Жалоба клиники";
                  const canTransfer =
                    req.status ===
                    "Отправлен со склада PROTECO";

                  const rowBg = isComplaint
                    ? "bg-red-50/50"
                    : idx % 2 === 1
                      ? "bg-gray-50/40"
                      : "bg-white";

                  return (
                    <Fragment key={req.id}>
                      <tr
                        className={`border-t border-gray-100 transition-colors hover:bg-blue-50/30 ${rowBg} ${isExpanded ? "border-b-0" : ""}`}
                      >
                        <td className="px-4 py-3.5 text-sm align-top">
                          <div className="font-semibold text-gray-900 whitespace-nowrap">
                            {req.date}
                          </div>
                          <div className="text-gray-400 text-xs mt-0.5">
                            {req.time}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm align-top">
                          <div className="font-medium text-gray-900 leading-snug">
                            {req.clinic}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {req.city}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500">
                              ИНН: {req.inn}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm align-top">
                          <div className="font-medium text-gray-900 leading-snug">
                            {req.contact.name}
                          </div>
                          <div className="text-xs text-blue-600 mt-0.5">
                            {req.contact.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm align-top">
                          <ul className="space-y-1">
                            {req.gifts.map((gift, i) => (
                              <li
                                key={i}
                                className="flex items-start justify-between gap-3 text-gray-700"
                              >
                                <div className="flex items-start gap-1.5">
                                  <Gift className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                                  <span className="leading-snug">
                                    {gift}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                  1 шт.
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <ShipmentCell
                            shipment={req.shipment}
                          />
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <CompactStepper status={req.status} />
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          {canTransfer && (
                            <button
                              onClick={() =>
                                handleTransfer(req)
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Передать
                            </button>
                          )}
                        </td>
                        <td className="px-2 py-3.5 align-top">
                          <button
                            onClick={() => toggleRow(req.id)}
                            title={
                              isExpanded
                                ? "Свернуть историю"
                                : "Показать историю"
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${req.id}-expanded`}>
                          <td colSpan={8}>
                            <HistoryPanel request={req} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Футер ── */}
      {filtered.length > 0 && (
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div>
            Показано:{" "}
            <span className="font-medium text-gray-600">
              {filtered.length}
            </span>
            {isFiltered && <span> из {requests.length}</span>}
          </div>
          <div>
            Сортировка:{" "}
            <span className="font-medium text-gray-600">
              {sortOrder === "desc"
                ? "новые сначала"
                : "старые сначала"}
            </span>
          </div>
        </div>
      )}

      {/* ── Модальное окно подтверждения ── */}
      {confirmRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          onClick={() => setConfirmRequest(null)}
        >
          <div
            className="w-full max-w-[460px] rounded-3xl bg-white p-8 text-center shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setConfirmRequest(null)}
              className="ml-auto flex rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Truck className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-xl font-bold leading-tight text-gray-900">
              Подтвердите передачу подарка клинике
            </h2>
            <p className="mx-auto mt-3 max-w-[340px] text-sm leading-6 text-gray-500">
              Клиника:{" "}
              <span className="font-semibold text-gray-700">
                {confirmRequest.clinic}
              </span>
              <br />
              После подтверждения статус изменится на «Передан
              клинике».
            </p>
            <div className="mt-7 grid grid-cols-2 gap-4">
              <button
                onClick={() => setConfirmRequest(null)}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmTransfer}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}