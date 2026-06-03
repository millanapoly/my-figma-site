import { useState, useEffect, useRef } from "react";
import {
  ChevronDown, ChevronUp, Search, Settings, ShoppingBag,
  Clock, MapPin, Phone, Mail, Building2, Package, CheckCircle,
  XCircle, Truck, AlertTriangle, RotateCcw, Calendar, Bell,
  Plus, X, Lock, Info,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type OrderStatus =
  | "new" | "accepted" | "confirmed" | "in_delivery"
  | "delivered" | "not_delivered" | "missed"
  | "cancelled_buyer" | "cancelled_store";

type ModalType = "decline" | "cancel" | "notdelivered" | "toDelivery" | "dateOnly";

interface Product {
  name: string; sku: string; description: string;
  qty: number; price: number; category: string; release: string;
}

interface Order {
  id: string; status: OrderStatus;
  createdAt: string; statusUpdatedAt: string;
  city: string; paymentMethod: string;
  products: Product[];
  clinic?: { name: string; inn: string; contact: string; phone: string; email: string; address: string };
  address?: string;
  comment?: string;
  buyerComment?: string;
  deliveryDate?: string; deliveryFrom?: string; deliveryTo?: string;
  declineReason?: string; cancelReason?: string; notDeliveredReason?: string;
  deadlineTime?: string;
}

// ─── PRODUCT CATALOGUE ───────────────────────────────────────────────────────
const PRODUCTS: Record<string, Omit<Product, "qty">> = {
  "14906": { name: "Набор Tokuyama Bond Force II Kit",      sku: "14906", price: 6091.14,  description: "Набор адгезивной системы Tokuyama Bond Force II для терапевтических реставраций.", category: "Адгезивы", release: "Набор" },
  "14926": { name: "Адгезив Tokuyama Bond Force II Refill", sku: "14926", price: 6091.14,  description: "Отдельный адгезив Tokuyama Bond Force II в формате refill.", category: "Адгезивы", release: "Флакон / refill" },
  "14971": { name: "Набор Tokuyama Bond Force II Pen Kit",  sku: "14971", price: 7368.90,  description: "Набор адгезивной системы Tokuyama Bond Force II в формате Pen Kit.", category: "Адгезивы", release: "Pen Kit" },
  "14114": { name: "Набор Tokuyama EE-Bond Intro Kit",      sku: "14114", price: 5397.21,  description: "Стартовый набор Tokuyama EE-Bond.", category: "Адгезивы", release: "Набор" },
  "14701": { name: "Набор Tokuyama One-Up Bond F Plus Kit", sku: "14701", price: 13537.48, description: "Набор однокомпонентного адгезива Tokuyama One-Up Bond F Plus.", category: "Адгезивы", release: "Набор" },
};

// ─── MOCK ORDERS ─────────────────────────────────────────────────────────────
function futureTime(minutesAhead: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesAhead);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: "M652133", status: "new",
    createdAt: "26.05.2026 10:14", statusUpdatedAt: "26.05.2026 10:14",
    city: "Москва", paymentMethod: "Безналичный расчёт",
    deadlineTime: futureTime(25),
    address: "г. Москва, ул. Садовая-Кудринская, д. 15, оф. 301",
    clinic: { name: "Стоматология «ДентаЛюкс»", inn: "7714556789", contact: "Сидоров Игорь Петрович", phone: "+7 (495) 456-78-90", email: "igorsid@dentalux.ru", address: "г. Москва, ул. Садовая-Кудринская, д. 15, оф. 301" },
    products: [{ ...PRODUCTS["14906"], qty: 1 }],
  },
  {
    id: "M651890", status: "accepted",
    createdAt: "25.05.2026 16:30", statusUpdatedAt: "25.05.2026 16:58",
    city: "Москва", paymentMethod: "Безналичный расчёт",
    address: "г. Москва, ул. Профсоюзная, д. 45, оф. 12",
    clinic: { name: "Стоматология «Здоровые зубы»", inn: "7724987654", contact: "Иванова Наталья Сергеевна", phone: "+7 (495) 123-45-67", email: "zakaz@zdorovye-zuby.ru", address: "г. Москва, ул. Профсоюзная, д. 45, оф. 12" },
    products: [{ ...PRODUCTS["14926"], qty: 2 }],
    comment: "",
  },
  {
    id: "M650712", status: "confirmed",
    createdAt: "24.05.2026 11:00", statusUpdatedAt: "24.05.2026 11:32",
    city: "Санкт-Петербург", paymentMethod: "Безналичный расчёт",
    address: "г. Санкт-Петербург, Невский пр., д. 88, пом. 3",
    clinic: { name: "Клиника «ДентАрт»", inn: "7841305671", contact: "Смирнов Алексей Викторович", phone: "+7 (812) 567-89-01", email: "orders@dent-art.spb.ru", address: "г. Санкт-Петербург, Невский пр., д. 88, пом. 3" },
    products: [{ ...PRODUCTS["14114"], qty: 1 }],
    comment: "Клиент просил уточнить наличие перед доставкой",
  },
  {
    id: "M650010", status: "in_delivery",
    createdAt: "23.05.2026 09:30", statusUpdatedAt: "23.05.2026 14:15",
    city: "Москва", paymentMethod: "Безналичный расчёт",
    deliveryDate: "27.05.2026", deliveryFrom: "10:00", deliveryTo: "14:00",
    address: "г. Москва, Ленинский пр., д. 76, каб. 208",
    clinic: { name: "ООО «Денталь Плюс»", inn: "7703876543", contact: "Козлова Марина Игоревна", phone: "+7 (495) 987-65-43", email: "m.kozlova@dental-plus.ru", address: "г. Москва, Ленинский пр., д. 76, каб. 208" },
    products: [{ ...PRODUCTS["14701"], qty: 1 }],
  },
  {
    id: "M648990", status: "delivered",
    createdAt: "20.05.2026 13:00", statusUpdatedAt: "22.05.2026 16:30",
    city: "Москва", paymentMethod: "Безналичный расчёт",
    deliveryDate: "22.05.2026", deliveryFrom: "14:00", deliveryTo: "18:00",
    address: "г. Москва, ул. Тверская, д. 10",
    clinic: { name: "Стоматология «Улыбка»", inn: "7706543210", contact: "Петров Дмитрий Андреевич", phone: "+7 (495) 111-22-33", email: "info@ulyb.ru", address: "г. Москва, ул. Тверская, д. 10" },
    products: [{ ...PRODUCTS["14906"], qty: 2 }],
  },
  {
    id: "M648100", status: "missed",
    createdAt: "18.05.2026 09:45", statusUpdatedAt: "18.05.2026 10:15",
    city: "Казань", paymentMethod: "Безналичный расчёт",
    products: [{ ...PRODUCTS["14971"], qty: 1 }],
    declineReason: "Заказ не был принят в течение 30 минут рабочего времени.",
  },
  {
    id: "M645220", status: "cancelled_buyer",
    createdAt: "15.05.2026 12:00", statusUpdatedAt: "15.05.2026 14:30",
    city: "Ростов-на-Дону", paymentMethod: "Безналичный расчёт",
    products: [{ ...PRODUCTS["14114"], qty: 2 }],
    cancelReason: "Покупатель отменил заказ",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новый", accepted: "Принят в обработку", confirmed: "Подтверждён",
  in_delivery: "Передан в доставку", delivered: "Доставлен",
  not_delivered: "Не доставлен", missed: "Упущенный",
  cancelled_buyer: "Отменён покупателем", cancelled_store: "Отменён дистрибьютором",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  new:             "bg-blue-100 text-blue-700 border-blue-200",
  accepted:        "bg-amber-100 text-amber-700 border-amber-200",
  confirmed:       "bg-indigo-100 text-indigo-700 border-indigo-200",
  in_delivery:     "bg-orange-100 text-orange-700 border-orange-200",
  delivered:       "bg-green-100 text-green-700 border-green-200",
  not_delivered:   "bg-red-100 text-red-700 border-red-200",
  missed:          "bg-gray-100 text-gray-500 border-gray-200",
  cancelled_buyer: "bg-gray-100 text-gray-500 border-gray-200",
  cancelled_store: "bg-gray-100 text-gray-500 border-gray-200",
};

const FINAL_STATUSES: OrderStatus[] = ["delivered", "not_delivered", "missed", "cancelled_buyer", "cancelled_store"];

const fmt = (n: number) => n.toLocaleString("ru", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function parseRuDate(dateStr: string, timeStr?: string): Date | null {
  const parts = dateStr.split(".");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  const dt = new Date(y, m - 1, d);
  if (timeStr) { const [h, min] = timeStr.split(":").map(Number); dt.setHours(h, min, 0, 0); }
  else dt.setHours(23, 59, 59, 999);
  return dt;
}

function isDeliveryPast(order: Order): boolean {
  if (!order.deliveryDate) return false;
  const boundary = parseRuDate(order.deliveryDate, order.deliveryTo);
  return boundary !== null && new Date() > boundary;
}

function orderTotal(order: Order) {
  return order.products.reduce((s, p) => s + p.price * p.qty, 0);
}

// ─── PRODUCT AVATAR ───────────────────────────────────────────────────────────
function ProductAvatar({ sku, small }: { sku: string; small?: boolean }) {
  const colors: Record<string, string> = {
    "14906": "from-blue-500 to-blue-700", "14926": "from-blue-400 to-blue-600",
    "14971": "from-indigo-500 to-blue-600", "14114": "from-teal-500 to-green-600",
    "14701": "from-purple-500 to-indigo-600",
  };
  const grad = colors[sku] ?? "from-gray-400 to-gray-600";
  const sz = small ? "w-8 h-8 rounded-xl" : "w-10 h-10 rounded-xl";
  return (
    <div className={`${sz} bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}>
      <Package className={`${small ? "w-4 h-4" : "w-5 h-5"} text-white/80`} />
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── REASON MODAL ─────────────────────────────────────────────────────────────
function ReasonModal({ title, reasons, onConfirm, onClose, confirmLabel = "Подтвердить", confirmCls = "bg-red-600 hover:bg-red-700 text-white" }: {
  title: string; reasons: string[];
  onConfirm: (reason: string, custom: string) => void;
  onClose: () => void; confirmLabel?: string; confirmCls?: string;
}) {
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!selected) { setErr("Выберите причину."); return; }
    if (selected === "Другая причина" && !custom.trim()) { setErr("Опишите причину."); return; }
    onConfirm(selected, custom.trim());
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-2 mb-4">
        {reasons.map(r => (
          <label key={r} className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${selected === r ? "bg-blue-50 border-blue-300" : "border-gray-200 hover:bg-gray-50"}`}>
            <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected === r ? "border-blue-600 bg-blue-600" : "border-gray-300"}`} />
            <span className="text-sm text-gray-800">{r}</span>
            <input type="radio" className="sr-only" checked={selected === r} onChange={() => { setSelected(r); setErr(""); }} />
          </label>
        ))}
      </div>
      {selected === "Другая причина" && (
        <textarea value={custom} onChange={e => setCustom(e.target.value)} placeholder="Опишите причину…"
          className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:border-blue-400 mb-3" />
      )}
      {err && <p className="text-xs text-red-600 mb-3">{err}</p>}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Отмена</button>
        <button onClick={submit} className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${confirmCls}`}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

// ─── DELIVERY DATE MODAL ──────────────────────────────────────────────────────
function DeliveryDateModal({ initial, onSave, onClose }: {
  initial: { date: string; from: string; to: string };
  onSave: (d: { date: string; from: string; to: string }) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(initial.date);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo]     = useState(initial.to);
  const [err, setErr]   = useState("");

  const save = () => {
    if (!date || !from || !to) { setErr("Заполните все поля."); return; }
    if (from >= to) { setErr("Время окончания должно быть позже времени начала."); return; }
    onSave({ date, from, to });
  };

  const inputCls = "w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400";

  return (
    <Modal title="Укажите дату и время доставки" onClose={onClose}>
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Дата доставки</label>
          <input type="date" value={date} onChange={e => { setDate(e.target.value); setErr(""); }} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">С</label>
            <input type="time" step="3600" value={from} onChange={e => { setFrom(e.target.value); setErr(""); }} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">До</label>
            <input type="time" step="3600" value={to} onChange={e => { setTo(e.target.value); setErr(""); }} className={inputCls} />
          </div>
        </div>
      </div>
      {err && <p className="text-xs text-red-600 mb-3">{err}</p>}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Отмена</button>
        <button onClick={save} className="flex-1 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">Сохранить</button>
      </div>
    </Modal>
  );
}

// ─── TO-DELIVERY MODAL ────────────────────────────────────────────────────────
function ToDeliveryModal({ initial, onConfirm, onClose }: {
  initial: { date: string; from: string; to: string; buyerComment: string };
  onConfirm: (d: { date: string; from: string; to: string; buyerComment: string }) => void;
  onClose: () => void;
}) {
  const [date, setDate]                 = useState(initial.date);
  const [from, setFrom]                 = useState(initial.from);
  const [to, setTo]                     = useState(initial.to);
  const [buyerComment, setBuyerComment] = useState(initial.buyerComment);
  const [err, setErr]                   = useState("");

  const hasDate = !!initial.date;

  const save = () => {
    if (!date || !from || !to) { setErr("Укажите дату и время доставки."); return; }
    if (from >= to) { setErr("Время окончания должно быть позже времени начала."); return; }
    onConfirm({ date, from, to, buyerComment });
  };

  const inputCls = "w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400";

  return (
    <Modal title="Передать в доставку" onClose={onClose}>
      <div className="space-y-4 mb-4">
        <div className={`space-y-3 rounded-2xl p-3 ${hasDate ? "bg-gray-50 border border-gray-200" : "bg-amber-50 border border-amber-200"}`}>
          {!hasDate && (
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <p className="text-xs font-semibold text-amber-800">Дата доставки не задана — укажите её перед передачей</p>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Дата доставки</label>
            <input type="date" value={date} onChange={e => { setDate(e.target.value); setErr(""); }} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">С</label>
              <input type="time" step="3600" value={from} onChange={e => { setFrom(e.target.value); setErr(""); }} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">До</label>
              <input type="time" step="3600" value={to} onChange={e => { setTo(e.target.value); setErr(""); }} className={inputCls} />
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Комментарий для покупателя</label>
          <p className="text-xs text-gray-400 mb-1.5">Покупатель увидит этот текст. Укажите имя и телефон курьера.</p>
          <textarea value={buyerComment} onChange={e => setBuyerComment(e.target.value)}
            placeholder="Например: курьер Алексей, +7 (999) 123-45-67"
            className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm resize-none h-20 focus:outline-none focus:border-blue-400" />
        </div>
      </div>
      {err && <p className="text-xs text-red-600 mb-3">{err}</p>}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Отмена</button>
        <button onClick={save} className="flex-1 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">Передать в доставку</button>
      </div>
    </Modal>
  );
}

// ─── DEADLINE TIMER ───────────────────────────────────────────────────────────
function DeadlineTimer({ deadlineTime, onExpire }: { deadlineTime: string; onExpire?: () => void }) {
  const [left, setLeft] = useState(() => {
    const [h, m] = deadlineTime.split(":").map(Number);
    const now = new Date();
    const dl = new Date(); dl.setHours(h, m, 0, 0);
    return Math.max(0, Math.floor((dl.getTime() - now.getTime()) / 1000));
  });
  const firedRef    = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (left <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        const t = setTimeout(() => onExpireRef.current?.(), 400);
        return () => clearTimeout(t);
      }
      return;
    }
    const t = setInterval(() => setLeft(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [left]);

  const mins = Math.floor(left / 60);
  const secs = left % 60;
  const urgent = mins < 10;
  if (left === 0) return (
    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      Время истекло
    </span>
  );
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${urgent ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
      <Clock className="inline w-3 h-3 mr-1 -mt-0.5" />
      {mins}:{String(secs).padStart(2, "0")}
    </span>
  );
}

// ─── ORDER PROGRESS ───────────────────────────────────────────────────────────
const PROGRESS_STEPS: { key: OrderStatus; short: string }[] = [
  { key: "new",         short: "Новый" },
  { key: "accepted",    short: "Принят" },
  { key: "confirmed",   short: "Подтверждён" },
  { key: "in_delivery", short: "Доставка" },
  { key: "delivered",   short: "Доставлен" },
];

function OrderProgress({ status }: { status: OrderStatus }) {
  const problemStatuses: Partial<Record<OrderStatus, { color: string; dot: string }>> = {
    missed:          { color: "text-gray-500",  dot: "bg-gray-400" },
    not_delivered:   { color: "text-red-600",   dot: "bg-red-500"  },
    cancelled_buyer: { color: "text-gray-500",  dot: "bg-gray-400" },
    cancelled_store: { color: "text-gray-500",  dot: "bg-gray-400" },
  };
  const problem = problemStatuses[status];
  if (problem) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${problem.dot}`} />
        <span className={`text-xs font-medium ${problem.color}`}>{STATUS_LABELS[status]}</span>
      </div>
    );
  }

  const currentIdx = PROGRESS_STEPS.findIndex(s => s.key === status);
  return (
    <div className="space-y-1.5 min-w-[120px]">
      <div className="flex items-center">
        {PROGRESS_STEPS.map((step, i) => (
          <div key={step.key} className={`flex items-center ${i < PROGRESS_STEPS.length - 1 ? "flex-1" : ""}`}>
            <div title={step.short} className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${
              i < currentIdx   ? "bg-blue-600" :
              i === currentIdx ? "bg-blue-600 ring-2 ring-blue-200 ring-offset-1" :
              "bg-gray-200"
            }`} />
            {i < PROGRESS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-0.5 ${i < currentIdx ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 font-medium">
        {PROGRESS_STEPS[currentIdx]?.short}
      </div>
    </div>
  );
}

// ─── ORDER ACTIONS ────────────────────────────────────────────────────────────
function OrderActions({ order, onAct, onModal }: {
  order: Order;
  onAct: (upd: Partial<Order>) => void;
  onModal: (m: ModalType) => void;
}) {
  if (FINAL_STATUSES.includes(order.status)) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const ts = () => ({ statusUpdatedAt: new Date().toLocaleString("ru").replace(",", "") });
  const btnP = "flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap w-full";
  const btnS = "flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap";

  if (order.status === "new") return (
    <div className="flex flex-col gap-1.5">
      <button onClick={() => onAct({ status: "accepted", ...ts() })} className={`${btnP} bg-blue-600 hover:bg-blue-700 text-white`}>
        <CheckCircle className="w-3.5 h-3.5" /> Принять
      </button>
      <button onClick={() => onModal("decline")} className={`${btnS} w-full border-red-200 text-red-600 hover:bg-red-50`}>
        Отказаться
      </button>
    </div>
  );

  if (order.status === "accepted") return (
    <div className="flex flex-col gap-1.5">
      <button onClick={() => onAct({ status: "confirmed", ...ts() })} className={`${btnP} bg-indigo-600 hover:bg-indigo-700 text-white`}>
        <CheckCircle className="w-3.5 h-3.5" /> Подтвердить
      </button>
      <button onClick={() => onModal("cancel")} className={`${btnS} w-full border-gray-200 text-gray-600 hover:bg-gray-50`}>
        Отменить
      </button>
    </div>
  );

  if (order.status === "confirmed") return (
    <div className="flex flex-col gap-1.5">
      <button onClick={() => onModal("toDelivery")} className={`${btnP} bg-orange-500 hover:bg-orange-600 text-white`}>
        <Truck className="w-3.5 h-3.5" /> Передать в доставку
      </button>
      <div className="flex gap-1">
        <button onClick={() => onModal("dateOnly")} className={`${btnS} flex-1 border-blue-200 text-blue-700 hover:bg-blue-50`}>
          <Calendar className="w-3 h-3" />
          {order.deliveryDate ? order.deliveryDate : "Дата"}
        </button>
        <button onClick={() => onModal("cancel")} className={`${btnS} border-gray-200 text-gray-500 hover:bg-gray-50`}>
          Отменить
        </button>
      </div>
    </div>
  );

  if (order.status === "in_delivery") return (
    <div className="flex flex-col gap-1.5">
      <button onClick={() => onAct({ status: "delivered", ...ts() })} className={`${btnP} bg-green-600 hover:bg-green-700 text-white`}>
        <CheckCircle className="w-3.5 h-3.5" /> Доставлен
      </button>
      <div className="flex gap-1">
        <button onClick={() => onModal("notdelivered")} className={`${btnS} flex-1 border-red-200 text-red-600 hover:bg-red-50`}>
          <XCircle className="w-3 h-3" /> Не доставлен
        </button>
        <button onClick={() => onModal("cancel")} className={`${btnS} border-gray-200 text-gray-500 hover:bg-gray-50`}>
          Отменить
        </button>
      </div>
    </div>
  );

  return null;
}

// ─── INFO ROW ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, hidden }: { icon: React.ReactNode; label: string; value?: string; hidden?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <span className="text-xs text-gray-500 flex-shrink-0 min-w-[120px]">{label}</span>
      {hidden ? (
        <span className="text-xs text-gray-300 flex items-center gap-1"><Lock className="w-3 h-3" /> скрыт до принятия</span>
      ) : (
        <span className="text-xs font-medium text-gray-900">{value ?? "—"}</span>
      )}
    </div>
  );
}

// ─── ORDER ROW ────────────────────────────────────────────────────────────────
function OrderRow({ order, onUpdate }: { order: Order; onUpdate: (id: string, upd: Partial<Order>) => void }) {
  const [open, setOpen]   = useState(false);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [comment, setComment] = useState(order.comment ?? "");

  const total       = orderTotal(order);
  const isFinal     = FINAL_STATUSES.includes(order.status);
  const isNew       = order.status === "new";
  const isPastDelivery = order.status === "in_delivery" && isDeliveryPast(order);
  const showContacts = !["new", "missed", "cancelled_buyer", "cancelled_store"].includes(order.status) && order.clinic;

  const act = (upd: Partial<Order>) => onUpdate(order.id, upd);
  const ts  = () => ({ statusUpdatedAt: new Date().toLocaleString("ru").replace(",", "") });

  const handleExpire = () => act({
    status: "missed",
    declineReason: "Заказ не был принят в течение 30 минут рабочего времени.",
    ...ts(),
  });

  const tdCls = "px-3 py-3 align-top text-left";
  const rowBg = open
    ? "bg-blue-50/50"
    : isPastDelivery
    ? "bg-amber-50/30 hover:bg-amber-50/60"
    : "hover:bg-gray-50/60";

  return (
    <>
      {/* ── Main row ─────────────────────────────────────────── */}
      <tr className={`border-b border-gray-100 transition-colors ${rowBg}`}>

        {/* Заказ */}
        <td className={`${tdCls} cursor-pointer`} onClick={() => setOpen(v => !v)}>
          <div className="font-bold text-gray-900 text-xs">№ {order.id}</div>
          <div className="text-xs text-gray-400 mt-0.5">{order.createdAt}</div>
          <div className="mt-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          {isNew && order.deadlineTime && (
            <div className="mt-1.5">
              <DeadlineTimer deadlineTime={order.deadlineTime} onExpire={handleExpire} />
            </div>
          )}
        </td>

        {/* Клиника */}
        <td className={`${tdCls} cursor-pointer`} onClick={() => setOpen(v => !v)}>
          {isNew ? (
            <>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Lock className="w-3 h-3 flex-shrink-0" /> Скрыто до принятия
              </div>
              <div className="text-xs font-medium text-gray-700 mt-0.5">{order.city}</div>
            </>
          ) : (
            <>
              <div className="text-xs font-semibold text-gray-900 leading-snug">{order.clinic?.name ?? "—"}</div>
              <div className="text-xs text-gray-500 mt-0.5">{order.city}</div>
              {order.clinic?.inn && <div className="text-xs text-gray-400 mt-0.5">ИНН: {order.clinic.inn}</div>}
            </>
          )}
        </td>

        {/* Контакты */}
        <td className={`${tdCls} cursor-pointer`} onClick={() => setOpen(v => !v)}>
          {!showContacts ? (
            <div className="flex items-start gap-1 text-xs text-gray-400">
              <Lock className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>Доступны после принятия</span>
            </div>
          ) : (
            <>
              <div className="text-xs font-medium text-gray-900 leading-snug">{order.clinic?.contact}</div>
              <div className="text-xs text-gray-500 mt-0.5">{order.clinic?.phone}</div>
              <div className="text-xs text-gray-400 mt-0.5">{order.clinic?.email}</div>
            </>
          )}
        </td>

        {/* Состав */}
        <td className={`${tdCls} cursor-pointer`} onClick={() => setOpen(v => !v)}>
          <div className="space-y-1.5">
            {order.products.slice(0, 2).map(p => (
              <div key={p.sku}>
                <div className="text-xs font-medium text-gray-900 leading-snug line-clamp-2">{p.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">Арт. {p.sku} · {p.qty} шт.</div>
              </div>
            ))}
            {order.products.length > 2 && (
              <div className="text-xs text-blue-600 font-medium">+ ещё {order.products.length - 2}</div>
            )}
          </div>
        </td>

        {/* Сумма */}
        <td className={`${tdCls} cursor-pointer`} onClick={() => setOpen(v => !v)}>
          <div className="text-sm font-bold text-gray-900 whitespace-nowrap">{fmt(total)} ₽</div>
        </td>

        {/* Доставка и оплата */}
        <td className={`${tdCls} cursor-pointer`} onClick={() => setOpen(v => !v)}>
          <div className="space-y-0.5 text-xs">
            <div className="text-gray-700">Курьерская доставка</div>
            {isNew ? (
              <>
                <div className="text-gray-700">{order.city}</div>
                <div className="flex items-center gap-1 text-gray-400"><Lock className="w-3 h-3" /> Адрес скрыт</div>
              </>
            ) : (
              <div className="text-gray-600 leading-snug">{order.address ?? order.city}</div>
            )}
            <div className="text-gray-500">{order.paymentMethod}</div>
            {order.deliveryDate && (
              <div className={`font-medium ${isPastDelivery ? "text-amber-600" : "text-gray-500"}`}>
                {order.deliveryDate}{order.deliveryFrom ? `, ${order.deliveryFrom}–${order.deliveryTo}` : ""}
              </div>
            )}
          </div>
        </td>

        {/* Прогресс */}
        <td className={`${tdCls} cursor-pointer`} onClick={() => setOpen(v => !v)}>
          <OrderProgress status={order.status} />
        </td>

        {/* Действие — не открывает строку */}
        <td className={tdCls}>
          <OrderActions order={order} onAct={act} onModal={setModal} />
        </td>

        {/* Раскрытие */}
        <td className={tdCls}>
          <button onClick={() => setOpen(v => !v)} className="p-1.5 hover:bg-gray-200 rounded-xl transition-colors">
            {open
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />
            }
          </button>
        </td>
      </tr>

      {/* ── Expanded row ─────────────────────────────────────── */}
      {open && (
        <tr className="bg-blue-50/20">
          <td colSpan={9} className="px-6 py-5 border-b border-blue-100">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Left: полный состав */}
              <section>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Состав заказа</h4>
                <div className="space-y-2">
                  {order.products.map(p => (
                    <div key={p.sku} className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-100">
                      <ProductAvatar sku={p.sku} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Арт. {p.sku} · {p.category} · {p.release}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">{fmt(p.price * p.qty)} ₽</p>
                        <p className="text-xs text-gray-400">{p.qty} шт. × {fmt(p.price)} ₽</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-xs text-gray-500">Итого по заказу</span>
                  <span className="font-bold text-gray-900">{fmt(total)} ₽</span>
                </div>
              </section>

              {/* Right: детали */}
              <div className="space-y-5">

                {/* Доставка */}
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Доставка и оплата</h4>
                  <div className="space-y-2">
                    <InfoRow icon={<Truck className="w-3.5 h-3.5" />} label="Тип доставки" value="Курьерская доставка" />
                    <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Город" value={order.city} />
                    <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Адрес доставки" value={isNew ? undefined : order.address} hidden={isNew} />
                    {order.deliveryDate && (
                      <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Дата доставки"
                        value={`${order.deliveryDate}${order.deliveryFrom ? `, ${order.deliveryFrom}–${order.deliveryTo}` : ""}`} />
                    )}
                    {order.buyerComment && (
                      <InfoRow icon={<Info className="w-3.5 h-3.5" />} label="Комм. покупателю" value={order.buyerComment} />
                    )}
                    <InfoRow icon={<Info className="w-3.5 h-3.5" />} label="Способ оплаты" value={order.paymentMethod} />
                  </div>
                </section>

                {/* Контакты клиники */}
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Контакты клиники</h4>
                  {!showContacts ? (
                    <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-2xl">
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-500">Контакты станут доступны после принятия заказа.</p>
                    </div>
                  ) : order.clinic && (
                    <div className="space-y-2">
                      <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Клиника"        value={order.clinic.name} />
                      <InfoRow icon={<Info className="w-3.5 h-3.5" />}      label="ИНН"            value={order.clinic.inn} />
                      <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Контактное лицо" value={order.clinic.contact} />
                      <InfoRow icon={<Phone className="w-3.5 h-3.5" />}     label="Телефон"        value={order.clinic.phone} />
                      <InfoRow icon={<Mail className="w-3.5 h-3.5" />}      label="Email"          value={order.clinic.email} />
                    </div>
                  )}
                </section>

                {/* Причина */}
                {(order.declineReason || order.cancelReason || order.notDeliveredReason) && (
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Причина</h4>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl">
                      <p className="text-xs text-red-800">{order.declineReason || order.cancelReason || order.notDeliveredReason}</p>
                    </div>
                  </section>
                )}

                {/* Внутренний комментарий */}
                {showContacts && (
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Внутренний комментарий</h4>
                    <textarea value={comment} onChange={e => setComment(e.target.value)}
                      onBlur={() => act({ comment })}
                      placeholder="Комментарий для коллег — не виден клинике…"
                      disabled={isFinal}
                      className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm resize-none h-16 focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400 bg-white" />
                  </section>
                )}

                {/* История */}
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">История статусов</h4>
                  <p className="text-xs text-gray-500">
                    Переведён в «{STATUS_LABELS[order.status]}» · {order.statusUpdatedAt}
                  </p>
                </section>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* ── Modals ──────────────────────────────────────────── */}
      {modal === "decline" && (
        <ReasonModal title="Укажите причину отказа от заказа"
          reasons={["Товара нет в наличии", "Невозможно выполнить заказ", "Невозможно доставить в регион", "Другая причина"]}
          confirmLabel="Отказаться от заказа"
          onClose={() => setModal(null)}
          onConfirm={(r, c) => { act({ status: "cancelled_store", cancelReason: r === "Другая причина" ? c : r, ...ts() }); setModal(null); }} />
      )}
      {modal === "cancel" && (
        <ReasonModal title="Укажите причину отмены заказа"
          reasons={["Товара нет в наличии", "Цена не совпадает", "Невозможно доставить в срок", "Не удалось связаться с покупателем", "Покупатель отказался", "Другая причина"]}
          confirmLabel="Отменить заказ"
          onClose={() => setModal(null)}
          onConfirm={(r, c) => { act({ status: "cancelled_store", cancelReason: r === "Другая причина" ? c : r, ...ts() }); setModal(null); }} />
      )}
      {modal === "notdelivered" && (
        <ReasonModal title="Укажите причину недоставки"
          reasons={["Покупатель отказался от заказа", "Не удалось связаться с покупателем", "Покупатель не принял заказ", "Неверный адрес", "Курьер не смог доставить заказ", "Другая причина"]}
          confirmLabel="Подтвердить"
          onClose={() => setModal(null)}
          onConfirm={(r, c) => { act({ status: "not_delivered", notDeliveredReason: r === "Другая причина" ? c : r, ...ts() }); setModal(null); }} />
      )}
      {modal === "dateOnly" && (
        <DeliveryDateModal
          initial={{ date: order.deliveryDate ?? "", from: order.deliveryFrom ?? "", to: order.deliveryTo ?? "" }}
          onClose={() => setModal(null)}
          onSave={d => { act({ deliveryDate: d.date, deliveryFrom: d.from, deliveryTo: d.to }); setModal(null); }} />
      )}
      {modal === "toDelivery" && (
        <ToDeliveryModal
          initial={{ date: order.deliveryDate ?? "", from: order.deliveryFrom ?? "", to: order.deliveryTo ?? "", buyerComment: order.buyerComment ?? "" }}
          onClose={() => setModal(null)}
          onConfirm={d => {
            act({ status: "in_delivery", deliveryDate: d.date, deliveryFrom: d.from, deliveryTo: d.to, buyerComment: d.buyerComment, ...ts() });
            setModal(null);
          }} />
      )}
    </>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

function SettingsTab() {
  const [schedule, setSchedule] = useState(() =>
    DAYS.map((d, i) => ({ day: d, working: i < 5, from: "09:00", to: "18:00" }))
  );
  const [emails, setEmails]     = useState(["zakaz@proteco.ru"]);
  const [newEmail, setNewEmail] = useState("");
  const [phone, setPhone]       = useState("+7 (495) 000-00-00");
  const [saved, setSaved]       = useState(false);
  const [schedErr, setSchedErr] = useState("");

  const updateDay = (i: number, field: string, val: string | boolean) =>
    setSchedule(s => s.map((d, j) => j === i ? { ...d, [field]: val } : d));

  const addEmail = () => {
    if (!newEmail.includes("@")) return;
    setEmails(e => [...e, newEmail.trim()]);
    setNewEmail("");
  };

  const save = () => {
    const bad = schedule.find(d => d.working && d.from >= d.to);
    if (bad) { setSchedErr(`Проверьте режим обработки заказов: время окончания должно быть позже начала (${bad.day}).`); return; }
    setSchedErr("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-3xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-1">Режим обработки заказов</h3>
        <p className="text-xs text-gray-500 mb-4">Таймер принятия заказа считается только в рабочее время.</p>
        <div className="space-y-2">
          {schedule.map((d, i) => (
            <div key={d.day} className={`flex items-center gap-3 p-3 rounded-2xl border ${d.working ? "border-gray-200 bg-gray-50" : "border-gray-100 bg-white"}`}>
              <span className="text-xs font-semibold text-gray-700 w-28 flex-shrink-0">{d.day}</span>
              <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                <div onClick={() => updateDay(i, "working", !d.working)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${d.working ? "bg-blue-600" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${d.working ? "left-4.5" : "left-0.5"}`} />
                </div>
                <span className="text-xs text-gray-500">{d.working ? "Рабочий" : "Выходной"}</span>
              </label>
              {d.working && (
                <div className="flex items-center gap-2 ml-auto">
                  <input type="time" value={d.from} onChange={e => updateDay(i, "from", e.target.value)}
                    className="border border-gray-200 rounded-xl px-2 py-1 text-xs focus:outline-none focus:border-blue-400 w-24" />
                  <span className="text-xs text-gray-400">—</span>
                  <input type="time" value={d.to} onChange={e => updateDay(i, "to", e.target.value)}
                    className="border border-gray-200 rounded-xl px-2 py-1 text-xs focus:outline-none focus:border-blue-400 w-24" />
                </div>
              )}
            </div>
          ))}
        </div>
        {schedErr && <p className="text-xs text-red-600 mt-3">{schedErr}</p>}
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Уведомления о заказах</h3>
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Email для уведомлений</label>
          <p className="text-xs text-gray-400 mb-3">На этот адрес отправляются уведомления о заказах из корзины.</p>
          <div className="space-y-2 mb-2">
            {emails.map((e, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl">
                <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-sm flex-1">{e}</span>
                <button onClick={() => setEmails(arr => arr.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && addEmail()}
              placeholder="new@email.ru"
              className="flex-1 border border-gray-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <button onClick={addEmail} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-2xl transition-colors">
              <Plus className="w-3.5 h-3.5" /> Добавить
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Телефон для SMS</label>
          <p className="text-xs text-gray-400 mb-3">На этот номер отправляются SMS о новых заказах.</p>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <input value={phone} onChange={e => setPhone(e.target.value)} className="flex-1 bg-transparent text-sm focus:outline-none" />
          </div>
          <p className="text-xs text-gray-400 mt-2">SMS-шаблон: Новый заказ Tokuyama №[номер] на сумму [сумма] ₽. Примите заказ в ЛК ProfiSfera в течение 30 минут.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-2xl transition-all ${saved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
          {saved ? <><CheckCircle className="w-4 h-4" /> Сохранено</> : "Сохранить настройки"}
        </button>
      </div>
    </div>
  );
}

// ─── FILTER OPTIONS ───────────────────────────────────────────────────────────
const FILTER_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all",             label: "Все заказы" },
  { value: "new",             label: "Новые" },
  { value: "accepted",        label: "Принятые в обработку" },
  { value: "confirmed",       label: "Подтверждённые" },
  { value: "in_delivery",     label: "Переданные в доставку" },
  { value: "delivered",       label: "Доставленные" },
  { value: "not_delivered",   label: "Не доставленные" },
  { value: "missed",          label: "Упущенные" },
  { value: "cancelled_buyer", label: "Отменённые покупателем" },
  { value: "cancelled_store", label: "Отменённые дистрибьютором" },
];

const TABLE_HEADERS = [
  { label: "Заказ",            cls: "min-w-[140px]" },
  { label: "Клиника",          cls: "min-w-[150px]" },
  { label: "Контакты",         cls: "min-w-[170px]" },
  { label: "Состав заказа",    cls: "min-w-[190px]" },
  { label: "Сумма",            cls: "min-w-[105px]" },
  { label: "Доставка и оплата",cls: "min-w-[180px]" },
  { label: "Прогресс",         cls: "min-w-[140px]" },
  { label: "Действие",         cls: "min-w-[180px]" },
  { label: "",                 cls: "w-10"           },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function StoreOrders() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [tab, setTab]       = useState<"orders" | "settings">("orders");

  const newCount           = orders.filter(o => o.status === "new").length;
  const pastDeliveryOrders = orders.filter(o => o.status === "in_delivery" && isDeliveryPast(o));

  const openOrder = (id: string) => { setFilter("all"); setSearch(id); };

  const updateOrder = (id: string, upd: Partial<Order>) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...upd } : o));

  const filtered = orders.filter(o => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-lg leading-tight">Заказы из магазина</h1>
          {newCount > 0 && <p className="text-xs text-blue-600 font-semibold">{newCount} новых</p>}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
        {[
          { key: "orders",   label: "Список заказов", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
          { key: "settings", label: "Настройки",      icon: <Settings className="w-3.5 h-3.5" /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as "orders" | "settings")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "settings" ? <SettingsTab /> : (
        <>
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по номеру заказа"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div className="relative">
              <select value={filter} onChange={e => setFilter(e.target.value as OrderStatus | "all")}
                className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer">
                {FILTER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Alerts */}
          {newCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl">
              <Bell className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800 font-medium">
                {newCount === 1 ? "1 новый заказ ожидает принятия." : `${newCount} новых заказа ожидают принятия.`} Примите в течение 30 минут рабочего времени.
              </p>
            </div>
          )}
          {pastDeliveryOrders.map(o => (
            <div key={o.id} className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-900 font-semibold">Не забудьте закрыть заказ №{o.id}</p>
                <p className="text-xs text-amber-700 mt-0.5">Дата доставки {o.deliveryDate} прошла. Укажите, доставлен заказ или нет.</p>
              </div>
              <button onClick={() => openOrder(o.id)} className="flex-shrink-0 text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2">
                Перейти →
              </button>
            </div>
          ))}

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
              <RotateCcw className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {search ? "Заказы не найдены. Проверьте номер или измените фильтры."
                  : filter !== "all" ? "Заказы с выбранным статусом не найдены."
                  : "У вас пока нет заказов."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {TABLE_HEADERS.map((h, i) => (
                      <th key={i} className={`${h.cls} px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap`}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <OrderRow key={o.id} order={o} onUpdate={updateOrder} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
