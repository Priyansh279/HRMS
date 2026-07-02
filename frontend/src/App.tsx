import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeLeave from './pages/employee/Leave';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeExit from './pages/employee/ExitApplication';
import EmployeeNotices from "./pages/employee/Notices";
import EmployeeSalary from './pages/employee/Salary';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEmployees from './pages/admin/Employees';
import AdminLeave from './pages/admin/Leave';
import AdminAttendance from './pages/admin/Attendance';
import AdminExits from './pages/admin/ExitApplication';
import AdminNotices from "./pages/admin/Notices";
import AdminSalary from "./pages/admin/Salary";
import AdminSalaryStructure from './pages/admin/salaryStructure';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'employee' }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/employee"
        element={
          <ProtectedRoute role="employee">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="leave" element={<EmployeeLeave />} />
        <Route path="attendance" element={<EmployeeAttendance />} />
        <Route path="exit" element={<EmployeeExit />} />
        <Route path="notices" element={<EmployeeNotices />} />
        <Route path="salary" element={<EmployeeSalary/>}/>
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="leave" element={<AdminLeave />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="exits" element={<AdminExits />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="salary" element={<AdminSalary />} />
        <Route path="salaryStructure" element={< AdminSalaryStructure />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
