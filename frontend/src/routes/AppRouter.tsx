import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AssignmentsPage } from "../pages/Assignments/AssignmentsPage";
import { CurrentReportsPage } from "../pages/CurrentReports/CurrentReportsPage";
import { DashboardPage } from "../pages/Dashboards/DashboardPage";
import { EmployeesPage } from "../pages/Employees/EmployeesPage";
import { HomePage } from "../pages/Home/HomePage";
import { HistoryReportsPage } from "../pages/HistoryReports/HistoryReportsPage";
import { ImportsPage } from "../pages/Imports/ImportsPage";
import { SitesPage } from "../pages/Sites/SitesPage";
import { SyncPage } from "../pages/Sync/SyncPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/reports" element={<Navigate to="/reports/current" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/imports" element={<ImportsPage />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/reports/history" element={<HistoryReportsPage />} />
        <Route path="/reports/current" element={<CurrentReportsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sync" element={<SyncPage />} />
      </Routes>
    </BrowserRouter>
  );
}