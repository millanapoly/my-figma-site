import { Outlet, Link, useLocation } from "react-router-dom";
import { Bell, User, Wallet, Download, Info, Menu, X, Home, TrendingUp, ShoppingCart, Package, DollarSign, AlertCircle as AlertCircleIcon, Award, Newspaper, FileBarChart, Percent, BarChart2, Store } from "lucide-react";
import { useState } from "react";
import { financeScenarios } from "../utils/financeScenarios";
import { OrderBlankModal } from "./OrderBlankModal";
import { OrderFormModal } from "./OrderFormModal";

export function Layout() {
  const location = useLocation();
  const [showDiscountTooltip, setShowDiscountTooltip] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Финансовые данные для закрепа - используем те же правила, что и во вкладке Финансы
  const currentScenarioKey = "scenario1"; // Можно сделать динамическим позже
  const scenario = financeScenarios[currentScenarioKey];
  const financialDocs = scenario.docs;
  const creditLimit = scenario.creditLimit;
  const totalDebt = financialDocs.reduce((sum, doc) => sum + doc.debtAmount, 0);

  // Специальная логика для разных сценариев (как во вкладке Финансы)
  const isOverpaymentScenario = currentScenarioKey === "scenario5";

  let availableCredit;
  if (isOverpaymentScenario) {
    availableCredit = creditLimit;
  } else if (currentScenarioKey === "scenario3") {
    availableCredit = 0;
  } else {
    availableCredit = creditLimit - totalDebt;
  }

  // Данные для состава скидки
  const discountBreakdown = {
    period: "Q1 2026",
    totalDiscount: 15,
    components: [
      { label: "Тип дистрибьютора", value: "Дистрибьютор", type: "text" },
      { label: "Выполнение общего плана (Sell-In)", value: 2, type: "percent" },
      { label: "Соблюдение структуры по линейкам (Sell-In)", value: 0, type: "percent" },
      { label: "Выполнение общего плана (Sell-Out)", value: 3, type: "percent" },
      { label: "Соблюдение структуры по линейкам (Sell-Out)", value: 1, type: "percent" },
      { label: "Своевременность отчётности", value: 1, type: "percent" },
    ]
  };

  const navItems = [
    { path: "/", label: "Главная", icon: Home },

    { path: "/quarter-discount", label: "Квартальная скидка", icon: Percent },
    { path: "/new-orders", label: "Заказы", icon: ShoppingCart },
    { path: "/shipments", label: "Отгрузки", icon: Package },
    { path: "/finances", label: "Финансы", icon: DollarSign },
    { path: "/complaints", label: "Рекламации", icon: AlertCircleIcon },
    { path: "/loyalty", label: "Программа лояльности", icon: Award },
    { path: "/news", label: "Новости", icon: Newspaper },
    { path: "/reporting", label: "Отчётность", icon: FileBarChart },
    { path: "/analytics", label: "Аналитика", icon: BarChart2 },
    { path: "/store-orders", label: "Заказы из магазина", icon: Store },
  ];

  const bottomNavItems = [
    { path: "/", label: "Главная", icon: Home },
    { path: "/new-orders", label: "Заказы", icon: ShoppingCart },
    { path: "/finances", label: "Финансы", icon: DollarSign },
    { path: "/news", label: "Новости", icon: Newspaper },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-blue-600 border-b border-blue-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 -ml-2 hover:bg-blue-700 rounded-2xl transition-colors"
          >
            {showMobileMenu ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
          <div className="text-lg font-semibold text-white">PROTECO</div>
          <button className="relative p-2 -mr-2 hover:bg-blue-700 rounded-2xl transition-colors">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-blue-600"></span>
          </button>
        </div>

        {/* Mobile Top Info Bar - Collapsed */}
        <div className="px-4 py-2 bg-blue-600 border-t border-blue-700 overflow-x-auto">
          <div className="flex items-center gap-4 min-w-max">
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-100">Q1 2026</span>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-blue-500">
              <Wallet className={`w-3.5 h-3.5 ${
                availableCredit < 0 ? 'text-red-300' :
                availableCredit < creditLimit * 0.2 ? 'text-yellow-300' : 'text-green-300'
              }`} />
              <span className={`text-sm font-semibold ${
                availableCredit < 0 ? 'text-red-200' :
                availableCredit < creditLimit * 0.2 ? 'text-yellow-200' : 'text-white'
              }`}>
                {availableCredit.toLocaleString()} ₽
              </span>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-blue-500">
              <span className="text-sm font-semibold text-white">15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
          <div
            className="bg-white w-80 max-w-[85vw] h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Info */}
            <div className="px-5 py-6 bg-blue-50 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">Петров П.С.</div>
                  <div className="text-xs text-gray-500 mt-0.5">Руководитель отдела</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">ООО "ОК ПОВОЛЖЬЯ"</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="py-4">
              <div className="space-y-1 px-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all ${
                        isActive(item.path)
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Mobile Menu Footer */}
            <div className="px-5 py-4 border-t border-gray-200 mt-4">
              <div className="space-y-3 text-xs text-gray-500">
                <div>
                  <div className="font-medium text-gray-700 mb-1">Региональный менеджер</div>
                  <div className="font-medium text-gray-900">Иван Иванович</div>
                  <a href="tel:+79991234567" className="text-blue-600 hover:text-blue-700 font-medium">
                    +7 (999) 123-45-67
                  </a>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div>© 2026 PROTECO</div>
                  <div className="mt-0.5">Версия 2.4.1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Left Sidebar - минималистичный стиль */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          {/* Logo */}
          <div className="px-6 py-8">
            <div className="text-2xl font-semibold tracking-tight text-blue-600">PROTECO</div>
            <div className="text-xs text-gray-500 mt-1 font-normal">Кабинет дистрибьютора</div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 bg-blue-50/30">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">Петров П.С.</div>
                <div className="text-xs text-gray-500 mt-0.5">Руководитель отдела</div>
                <div className="text-xs text-gray-500 truncate mt-0.5">ООО "ОК ПОВОЛЖЬЯ"</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6">
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-3xl text-sm font-medium transition-all duration-150 ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-blue-50 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer Info */}
          <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
            <div>© 2026 PROTECO</div>
            <div className="mt-1">Версия 2.4.1</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Info Bar - чистый и спокойный */}
          <div className="bg-blue-600 border-b border-blue-700 px-8 py-4">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                {/* Quarter */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-blue-100 font-medium">Период</span>
                  <div className="px-3 py-1.5 bg-white text-blue-600 rounded-3xl font-semibold text-xs">
                    Q2 2026
                  </div>
                </div>

                {/* Доступно кредита */}
                <div className={`flex items-center gap-2.5 pl-6 border-l border-blue-500 ${
                  availableCredit < 0
                    ? 'bg-red-500/20 rounded-2xl px-4 py-2'
                    : availableCredit < creditLimit * 0.2
                    ? 'bg-yellow-500/20 rounded-2xl px-4 py-2'
                    : ''
                }`}>
                  <Wallet className={`w-4 h-4 flex-shrink-0 ${
                    availableCredit < 0
                      ? 'text-red-200'
                      : availableCredit < creditLimit * 0.2
                      ? 'text-yellow-200'
                      : 'text-blue-200'
                  }`} />
                  <div>
                    <div className="text-xs text-blue-100 font-medium">Доступно кредита</div>
                    <div className={`text-sm font-semibold ${
                      availableCredit < 0
                        ? 'text-red-100'
                        : availableCredit < creditLimit * 0.2
                        ? 'text-yellow-100'
                        : 'text-white'
                    }`}>
                      {availableCredit.toLocaleString()} ₽
                    </div>
                  </div>
                </div>

                {/* Скидка с подсказкой */}
                <div
                  className="flex items-center gap-2.5 pl-6 border-l border-blue-500 relative"
                  onMouseEnter={() => setShowDiscountTooltip(true)}
                  onMouseLeave={() => setShowDiscountTooltip(false)}
                >
                  <span className="text-xs text-blue-100 font-medium">Скидка</span>
                  <span className="text-sm font-semibold text-white flex items-center gap-1.5 cursor-help">
                    15%
                    <Info className="w-3.5 h-3.5 text-blue-200" />
                  </span>

                  {/* Popover с составом скидки */}
                  {showDiscountTooltip && (
                    <div
                      className="absolute top-full mt-2 right-0 bg-white rounded-3xl shadow-xl border border-gray-200 p-6 z-50 w-80"
                      style={{ transform: 'translateY(0)' }}
                    >
                      {/* Заголовок */}
                      <div className="font-semibold text-gray-900 text-sm mb-3 pb-2 border-b border-gray-200">
                        Состав текущей скидки
                      </div>

                      {/* Период расчета */}
                      <div className="text-xs text-gray-500 mb-3">
                        Период расчёта: <span className="font-semibold text-gray-700">{discountBreakdown.period}</span>
                      </div>

                      {/* Итоговая скидка */}
                      <div className="bg-blue-50 rounded-2xl px-4 py-3 mb-4">
                        <div className="text-xs text-gray-600 mb-0.5">Итоговая скидка</div>
                        <div className="text-2xl font-bold text-blue-600">{discountBreakdown.totalDiscount}%</div>
                      </div>

                      {/* Список блоков */}
                      <div className="space-y-2">
                        {discountBreakdown.components.map((component, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm py-1.5 px-2 rounded hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-gray-700 text-xs">{component.label}</span>
                            <span className={`font-semibold text-xs ${
                              component.type === 'text'
                                ? 'text-gray-900'
                                : component.value > 0
                                  ? 'text-green-600'
                                  : 'text-gray-400'
                            }`}>
                              {component.type === 'text'
                                ? component.value
                                : `+${component.value}%`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Euro Rate */}
                <div className="flex items-center gap-2.5 pl-6 border-l border-blue-500">
                  <span className="text-xs text-blue-100 font-medium">Курс</span>
                  <span className="text-sm font-semibold text-white">€ = 105 ₽</span>
                </div>

                {/* Update Times - две отдельные даты */}
                <div className="pl-6 border-l border-blue-500">
                  <div className="space-y-1.5">
                    <div>
                      <div className="text-xs text-blue-100 font-medium">Обновлено у PROTECO</div>
                      <div className="text-sm font-semibold text-white">15.05.2026 <span className="text-blue-200 font-normal">15:42</span></div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-100 font-medium">Обновлено на складе у дистрибьютора</div>
                      <div className="text-sm font-semibold text-white">16.05.2026 <span className="text-blue-200 font-normal">14:30</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5">
                {/* Order Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-600 rounded-3xl font-semibold text-sm transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Скачать бланк заказа
                  </button>
                  <button
                    onClick={() => setShowOrderForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-3xl font-semibold text-sm transition-colors shadow-sm border border-blue-400"
                  >
                    Оформить заказ
                  </button>
                </div>

                {/* Regional Manager */}
                <div className="pl-6 border-l border-blue-500">
                  <div className="text-xs text-blue-100 font-medium">Региональный менеджер</div>
                  <div className="text-sm font-semibold text-white mt-0.5">Иван Иванович</div>
                  <a href="tel:+79991234567" className="text-xs text-blue-200 hover:text-white font-medium mt-0.5 inline-block">
                    +7 (999) 123-45-67
                  </a>
                </div>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-blue-700 rounded-2xl transition-colors">
                  <Bell className="w-5 h-5 text-white" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-blue-600"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-8 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Main Content */}
      <div className="lg:hidden pb-20">
        <div className="p-4">
          <Outlet />
        </div>
      </div>

      {/* Mobile Floating Action Button - Order */}
      <button
        onClick={() => setShowOrderModal(true)}
        className="lg:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full font-semibold text-sm transition-all shadow-lg"
      >
        <Download className="w-5 h-5" />
        <span>Заказ</span>
      </button>

      {/* Order Blank Modal */}
      {showOrderModal && (
        <OrderBlankModal onClose={() => setShowOrderModal(false)} />
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderFormModal onClose={() => setShowOrderForm(false)} />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-colors flex-1 ${
                  active ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-600"}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}