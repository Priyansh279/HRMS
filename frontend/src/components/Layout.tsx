import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const employeeNav = [
  { to: '/employee', label: 'Dashboard' },
  { to: '/employee/profile', label: 'Profile' },
  { to: '/employee/leave', label: 'Leave' },
  { to: '/employee/attendance', label: 'Attendance' },
  { to: '/employee/notices', label: 'Notices' },
  { to: '/employee/salary',label:'Salary'},
  { to: '/employee/exit', label: 'Resignation' },
  
  ];

const adminNav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/employees', label: 'Employees' },
  { to: '/admin/leave', label: 'Leave' },
  { to: '/admin/attendance', label: 'Attendance' },
  { to: '/admin/notices', label: 'Notices' },
  { to: '/admin/salary',label:'Salary'},
  { to: '/admin/exits', label: 'Resignation' },
  
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const nav = isAdmin ? adminNav : employeeNav;
  const base = isAdmin ? '/admin' : '/employee';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <button
          type="button"
          className="layout-menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
        <div className="layout-brand">
          <span className="layout-brand-icon">HR</span>
          <span className="layout-brand-text">HRMS</span>
          <span className="layout-portal-badge">{isAdmin ? 'Admin' : 'Employee'}</span>
        </div>
        <div className="layout-user">
          <span className="layout-user-email">{user?.email}</span>
          <button type="button" className="layout-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <aside className={`layout-sidebar ${menuOpen ? 'open' : ''}`}>
        <nav className="layout-nav">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === base}
              className={({ isActive }) => `layout-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
