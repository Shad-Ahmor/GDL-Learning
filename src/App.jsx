import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";

import StudentModule from "./features/students/StudentModule";
import AcademicModule from "./features/academic/AcademicModule";
import ParentModule from "./features/parent/ParentModule";
import StudentFeesModule from "./features/students/StudentFeesModule";
import AttendanceModule from "./features/attendance/AttendanceModule";
import LibraryModule from "./features/library/LibraryModule";
import ExamModule from "./features/exam/ExamModule";
import ReportsModule from "./features/reports/ReportsModule";
import SettingsModule from "./features/settings/SettingsModule";
import TransportModule from "./features/transport/TransportModule";
import HostelModule from "./features/hostel/HostelModule";
import InventoryModule from "./features/inventory/InventoryModule";
import VisitorModule from "./features/visitor/VisitorModule";
import LoginModule from "./pages/LoginModule";
import PayrollModule from "./features/hr/PayrollModule";
import PromotionModule from "./features/students/PromotionModule";
import VerificationModule from "./features/verification/VerificationModule";
import RoleManagementModule from "./features/setup/RoleManagementModule";
import SuperAdminModule from "./features/superadmin/SuperAdminModule";
import SetupModule from "./pages/SetupModule";
import RecoveryModule from "./pages/RecoveryModule";

const ProtectedRoute = ({ children }) => {
  const isSetup = localStorage.getItem('gdl_admin_setup_complete') === 'true';
  const currentRole = localStorage.getItem('gdl_current_role');

  if (!isSetup) {
    return <Navigate to="/setup" replace />;
  }

  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <HashRouter>
      <div className="h-full w-full bg-background text-foreground transition-colors duration-300">
        <Routes>
          <Route path="/login" element={<LoginModule />} />
          <Route path="/setup" element={<SetupModule />} />
          <Route path="/recover" element={<RecoveryModule />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<StudentModule />} />
            <Route path="students/promotion" element={<PromotionModule />} />
            <Route path="fees" element={<StudentFeesModule />} />
            <Route path="academics" element={<AcademicModule />} />
            <Route path="parents" element={<ParentModule />} />
            <Route path="attendance" element={<AttendanceModule />} />
            <Route path="payroll" element={<PayrollModule />} />
            <Route path="library" element={<LibraryModule />} />
            <Route path="exams" element={<ExamModule />} />
            <Route path="transport" element={<TransportModule />} />
            <Route path="hostel" element={<HostelModule />} />
            <Route path="inventory" element={<InventoryModule />} />
            <Route path="visitor" element={<VisitorModule />} />
            <Route path="reports" element={<ReportsModule />} />
            <Route path="verification" element={<VerificationModule />} />
            <Route path="roles" element={<RoleManagementModule />} />
            <Route path="superadmin" element={<SuperAdminModule />} />
            <Route path="settings" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
