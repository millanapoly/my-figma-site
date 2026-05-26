// Типы для сценариев
export type ScenarioType = "scenario1" | "scenario2" | "scenario3";

export interface FinancialDocument {
  realization: string;          // Наименование реализации из 1С
  invoiceNumber: string | null; // Счёт для скачивания (null — счёт не выставлен)
  createdDate: string;          // Дата возникновения задолженности
  payDueDate: string | null;    // null = "не установлен" — не участвует в расчёте X
  debtAmount: number;
  riskStatus: string;
}

export interface Scenario {
  name: string;
  creditLimit: number;
  creditDepth: number;
  balance: number; // > 0 → показывать карточку переплаты
  docs: FinancialDocument[];
}

export const financeScenarios: Record<ScenarioType, Scenario> = {

  // ── Сценарий 1: Просроченных платежей нет (с переплатой) ──────────────────
  scenario1: {
    name: "Просроченных платежей нет",
    creditLimit: 2500000,
    creditDepth: 45,
    balance: 450000, // переплата — показывается как доп. карточка
    docs: [
      {
        realization: "Реализация товаров и услуг ОП00-000006 от 24.03.2026",
        invoiceNumber: "СЧ-2026-00145",
        createdDate: "24.03.2026",
        payDueDate: "08.05.2026",
        debtAmount: 156800,
        riskStatus: "Норма",
      },
      {
        realization: "Реализация товаров и услуг ОП00-000009 от 22.03.2026",
        invoiceNumber: "СЧ-2026-00142",
        createdDate: "22.03.2026",
        payDueDate: "06.05.2026",
        debtAmount: 89500,
        riskStatus: "Норма",
      },
      {
        realization: "Реализация товаров и услуг ОП00-000012 от 20.03.2026",
        invoiceNumber: null, // счёт не выставлен
        createdDate: "20.03.2026",
        payDueDate: null, // не установлен
        debtAmount: 234700,
        riskStatus: "Норма",
      },
    ],
  },

  // ── Сценарий 2: До стоп-отгрузки X дней (предупреждение) ─────────────────
  scenario2: {
    name: "До стоп-отгрузки X дней",
    creditLimit: 2500000,
    creditDepth: 45,
    balance: 0,
    docs: [
      {
        realization: "Реализация товаров и услуг ОП00-000003 от 05.03.2026",
        invoiceNumber: "СЧ-2026-00128",
        createdDate: "05.03.2026",
        payDueDate: "05.04.2026", // ближайший — «До стопа 4 дня» → X = 4
        debtAmount: 156800,
        riskStatus: "До стопа 4 дня",
      },
      {
        realization: "Реализация товаров и услуг ОП00-000004 от 08.03.2026",
        invoiceNumber: "СЧ-2026-00132",
        createdDate: "08.03.2026",
        payDueDate: "08.04.2026",
        debtAmount: 89500,
        riskStatus: "До стопа 7 дней",
      },
      {
        realization: "Реализация товаров и услуг ОП00-000005 от 15.03.2026",
        invoiceNumber: null,
        createdDate: "15.03.2026",
        payDueDate: null, // не установлен — не участвует в расчёте X
        debtAmount: 45200,
        riskStatus: "Норма",
      },
      {
        realization: "Реализация товаров и услуг ОП00-000007 от 20.03.2026",
        invoiceNumber: "СЧ-2026-00138",
        createdDate: "20.03.2026",
        payDueDate: "03.05.2026",
        debtAmount: 234700,
        riskStatus: "Норма",
      },
    ],
  },

  // ── Сценарий 3: Отгрузка заблокирована из-за просрочки ───────────────────
  scenario3: {
    name: "Отгрузка заблокирована из-за просрочки",
    creditLimit: 2500000,
    creditDepth: 45,
    balance: 0,
    docs: [
      {
        realization: "Реализация товаров и услуг ОП00-000001 от 15.02.2026",
        invoiceNumber: "СЧ-2026-00115",
        createdDate: "15.02.2026",
        payDueDate: "29.03.2026",
        debtAmount: 125300,
        riskStatus: "Просрочено",
      },
      {
        realization: "Реализация товаров и услуг ОП00-000002 от 20.02.2026",
        invoiceNumber: "СЧ-2026-00120",
        createdDate: "20.02.2026",
        payDueDate: "26.03.2026",
        debtAmount: 198400,
        riskStatus: "Просрочено",
      },
      {
        realization: "Реализация товаров и услуг ОП00-000003 от 05.03.2026",
        invoiceNumber: "СЧ-2026-00128",
        createdDate: "05.03.2026",
        payDueDate: "19.04.2026",
        debtAmount: 89500,
        riskStatus: "До стопа 4 дня",
      },
      {
        realization: "Реализация товаров и услуг ОП00-000005 от 15.03.2026",
        invoiceNumber: null,
        createdDate: "15.03.2026",
        payDueDate: null, // не установлен
        debtAmount: 67200,
        riskStatus: "Норма",
      },
    ],
  },
};
