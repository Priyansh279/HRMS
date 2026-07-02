import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeesApi, leaveApi, attendanceApi,exitApi } from '../../api/client';
import './Dashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    pendingLeaves: 0,
    presentToday: 0,
    Exit:0,
  });

  useEffect(() => {
    Promise.all([
      employeesApi.list().then((arr) => arr.length),
      leaveApi.list().then((arr) => arr.filter((l) => l.status === 'pending').length),
      attendanceApi.list().then((arr) => {
        const today = new Date().toDateString();
        return arr.filter(
          (a) => new Date(a.date).toDateString() === today && a.status === 'present'
        ).length;
      }),
      exitApi.list().then((arr) => arr.filter((l: { status: string; }) => l.status === 'pending').length),
    ]).then(([employees, pendingLeaves, presentToday, Exit]) => {
      setStats({ employees, pendingLeaves, presentToday, Exit });
    });
  }, []);

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">HRMS overview and quick access</p>

      <div className="dashboard-cards">
        <Link to="/admin/employees" className="dashboard-card">
          <span className="card-value">{stats.employees}</span>
          <span className="card-label">Employees</span>
        </Link>
        <Link to="/admin/leave" className="dashboard-card">
          <span className="card-value">{stats.pendingLeaves}</span>
          <span className="card-label">Pending leave requests</span>
        </Link>
        <div className="dashboard-card static">
          <span className="card-value">{stats.presentToday}</span>
          <span className="card-label">Present today</span>
        </div>
        <Link to="/admin/exits" className="dashboard-card">
          <span className="card-value">{stats.Exit}</span>
          <span className="card-label">Resignation Requests</span>
        </Link>
      </div>

      <section className="dashboard-section">
        <h2>Quick links</h2>
        <div className="quick-actions">
          <Link to="/admin/employees" className="quick-action">Manage employees</Link>
          <Link to="/admin/leave" className="quick-action">Approve / Reject leave</Link>
          <Link to="/admin/attendance" className="quick-action">View attendance</Link>
          <Link to="/admin/Notices" className="quick-action">Notices & Reminder</Link>
          <Link to="/admin/exits"className="quick-action">Resignation Management</Link>
   
        </div>
      </section>
    </div>
  );
}
