import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import TransactionsPage from "../pages/TransactionsPage";
import BudgetsPage from "../pages/BudgetsPages";
import GoalsPage from "../pages/GoalsPage";
import SettingsPage from "../pages/SettingsPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "budgets", element: <BudgetsPage /> },
      { path: "goals", element: <GoalsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
