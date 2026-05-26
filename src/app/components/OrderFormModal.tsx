import { useMemo, useState } from "react";
import { X, FileSpreadsheet, ShoppingCart, CheckCircle2 } from "lucide-react";

interface Props {
  onClose: () => void;
}

function SectionBlock({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {number}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const selectCls =
  "w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const orderRows = [
  { sku: "10001", name: "ЭСТЕЛАЙТ АСТЕРИА OA2", qty: 12, unit: "уп.", sum: "51 000" },
  { sku: "10018", name: "УНИВЕРСАЛ ФЛОУ A3", qty: 24, unit: "уп.", sum: "76 320" },
  { sku: "10442", name: "БОНД ФОРС II", qty: 8, unit: "уп.", sum: "55 200" },
  { sku: "10762", name: "Кисти / расходные материалы", qty: 40, unit: "уп.", sum: "78 000" },
];

const total = "260 520";
const orderId = "LK-ORDER-2026-000123";

export function OrderFormModal({ onClose }: Props) {
  const [fileName, setFileName] = useState("");
  const [isImported, setIsImported] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const [contactName, setContactName] = useState("Арина Иванова");
  const [email, setEmail] = useState("arina@example.ru");
  const [phone, setPhone] = useState("+7 999 123-45-67");
  const [carrier, setCarrier] = useState("Деловые линии — терминал Москва Север");
  const [customCarrier, setCustomCarrier] = useState("");
  const [payment, setPayment] = useState("prepayment");
  const [warehouse, setWarehouse] = useState("Москва");
  const [comment, setComment] = useState("");
  const [extraFileName, setExtraFileName] = useState("");

  const carrierOptions = [
    "Деловые линии — терминал Москва Север",
    "ПЭК — доставка до адреса",
    "СДЭК — терминал получателя",
  ];

  const isReady = useMemo(() => {
    const carrierReady = carrier !== "new" || customCarrier.trim().length > 0;
    return (
      isImported &&
      contactName.trim() &&
      (email.trim() || phone.trim()) &&
      carrierReady &&
      payment &&
      warehouse
    );
  }, [isImported, contactName, email, phone, carrier, customCarrier, payment, warehouse]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsImported(true);
    setOrderCreated(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl border border-gray-100 flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-7 py-5 border-b border-gray-100 bg-blue-50/40 flex-shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Оформление заказа</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Импортируйте бланк заказа, проверьте состав и добавьте сопроводительные данные.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-500">
              Шаги: импорт → данные → оформление
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 bg-blue-50/20">
          {orderCreated ? (
            /* Success state */
            <div className="flex items-center justify-center min-h-72">
              <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-gray-900">Заказ оформлен</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                  Заявка <span className="font-semibold text-gray-900">{orderId}</span> создана. Проверьте почту.
                </p>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: "Сумма заказа", value: `${total} ₽` },
                      { label: "Условия оплаты", value: payment === "prepayment" ? "Предоплата" : "Отсрочка" },
                      { label: "Склад", value: warehouse },
                      { label: "Бланк", value: "Стандартный Excel ПРОТЕКО" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          {item.label === "Бланк" ? "Транспортная компания" : item.label}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-gray-900">
                          {item.label === "Бланк"
                            ? carrier === "new"
                              ? customCarrier || "—"
                              : carrier
                            : item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setOrderCreated(false);
                      setIsImported(false);
                      setFileName("");
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Оформить новый заказ
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-white transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left column */}
              <div className="space-y-5">
                {/* Section 1 — Import */}
                <SectionBlock number="1" title="Импорт заполненного Excel">
                  <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                    <div className="flex justify-center text-blue-300">
                      <FileSpreadsheet className="w-10 h-10" />
                    </div>
                    <div className="mt-3 text-sm font-medium text-gray-900">
                      {fileName || "Перетащите файл сюда или выберите на компьютере"}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Поддерживается только .xlsx</p>
                    <label className="mt-4 inline-flex cursor-pointer rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                      Выбрать файл
                      <input type="file" accept=".xlsx" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>

                  {isImported && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <div className="font-semibold">Файл успешно импортирован</div>
                      <div className="mt-1 text-xs text-emerald-700">
                        Найдено 4 строки заказа. Дубли артикулов сконсолидированы. Критичных ошибок нет.
                      </div>
                    </div>
                  )}
                </SectionBlock>

                {/* Section 2 — Preview */}
                <SectionBlock number="2" title="Предпросмотр заказа">
                  {!isImported ? (
                    <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
                      Предпросмотр появится после импорта бланка заказа.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">Артикул</th>
                            <th className="px-4 py-3 font-medium">Наименование</th>
                            <th className="px-4 py-3 text-right font-medium">Кол-во</th>
                            <th className="px-4 py-3 text-right font-medium">Сумма, ₽</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {orderRows.map((row) => (
                            <tr key={row.sku} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-600 text-xs">{row.sku}</td>
                              <td className="px-4 py-3 text-gray-800 text-xs">{row.name}</td>
                              <td className="px-4 py-3 text-right text-gray-700 text-xs">
                                {row.qty} {row.unit}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900 text-xs">{row.sum}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-blue-50/50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              Итого
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-blue-600">
                              {total} ₽
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </SectionBlock>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                {/* Section 3 — Order data */}
                <SectionBlock number="3" title="Данные заказа">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Контактное лицо" required>
                      <input
                        className={inputCls}
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </Field>
                    <Field label="Телефон" required>
                      <input
                        className={inputCls}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="E-mail" required>
                        <input
                          className={inputCls}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <Field label="Перевозчик / адрес / способ доставки" required>
                      <select
                        className={selectCls}
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                      >
                        {carrierOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="new">Ввести новый вариант</option>
                      </select>
                    </Field>

                    {carrier === "new" && (
                      <input
                        className={inputCls}
                        placeholder="Например: Байкал Сервис, доставка до терминала"
                        value={customCarrier}
                        onChange={(e) => setCustomCarrier(e.target.value)}
                      />
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Склад отгрузки" required>
                        <select
                          className={selectCls}
                          value={warehouse}
                          onChange={(e) => setWarehouse(e.target.value)}
                        >
                          <option>Москва</option>
                          <option>Санкт-Петербург</option>
                          <option>Новосибирск</option>
                        </select>
                      </Field>

                      <Field label="Условия оплаты" required>
                        <div className="flex gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1">
                          {(
                            [
                              { val: "prepayment", label: "Предоплата" },
                              { val: "deferment", label: "Отсрочка" },
                            ] as const
                          ).map(({ val, label }) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setPayment(val)}
                              className={`flex-1 rounded-xl border px-2 py-1.5 text-xs font-medium transition-all ${
                                payment === val
                                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                  : "border-transparent bg-transparent text-gray-600 hover:bg-white hover:border-gray-200"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </div>

                    <Field label="Комментарий">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Например: температурный режим, желаемая дата отгрузки, другие пожелания"
                        className={`${inputCls} min-h-[80px] resize-none`}
                      />
                    </Field>

                    <Field label="Дополнительный файл">
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                          Прикрепить файл
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setExtraFileName(e.target.files?.[0]?.name || "")}
                          />
                        </label>
                        <span className="truncate text-xs text-gray-500">
                          {extraFileName || "PDF, изображение или Excel"}
                        </span>
                      </div>
                    </Field>
                  </div>
                </SectionBlock>

                {/* Submit block */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  {!isReady && (
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                      Чтобы оформить заказ, импортируйте бланк заказа и заполните обязательные поля.
                    </div>
                  )}

                  <button
                    disabled={!isReady}
                    onClick={() => setOrderCreated(true)}
                    className={`mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
                      isReady
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        : "cursor-not-allowed bg-gray-100 text-gray-400"
                    }`}
                  >
                    Оформить заказ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
