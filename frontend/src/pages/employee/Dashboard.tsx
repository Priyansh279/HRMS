import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { leaveApi, attendanceApi, noticesApi } from "../../api/client";
import type { LeaveRequest, Attendance, Notice } from "../../types";
import "./Dashboard.css";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    leaveApi
      .list()
      .then(setLeaves)
      .catch(() => setLeaves([]));
    attendanceApi
      .list()
      .then(setAttendance)
      .catch(() => setAttendance([]));
    noticesApi
      .list()
      .then(setNotices)
      .catch(() => setNotices([]));
  }, []);

  const pendingLeaves = leaves.filter((l) => l.status === "pending");
  const recentAttendance = attendance.slice(0, 7);

  return (
    <div className="dashboard">
      <h1 className="page-title">
        Welcome, {user?.employee?.firstName ?? user?.email?.split("@")[0]}
      </h1>
      <p className="page-subtitle">Employee self-service portal</p>

      <div className="dashboard-cards">
        <Link to="/employee/leave" className="dashboard-card card-leave">
          <span className="card-value">{pendingLeaves.length}</span>
          <span className="card-label">Pending leave requests</span>
        </Link>
        <Link
          to="/employee/attendance"
          className="dashboard-card card-attendance"
        >
          <span className="card-value">
            {recentAttendance.filter((a) => a.status === "present").length}
          </span>
          <span className="card-label">Present (last 7 days)</span>
        </Link>
      </div>

      <section className="dashboard-section">
        <h2>Quick actions</h2>
        <div className="quick-actions">
          <Link to="/employee/profile" className="quick-action">
            View / Edit profile
          </Link>
          <Link to="/employee/leave" className="quick-action">
            Apply for leave
          </Link>
          <Link to="/employee/attendance" className="quick-action">
            Check-in / Attendance
          </Link>
          <Link to="/employee/Notices" className="quick-action">
            Notices & Reminder
          </Link>
          <Link to="/employee/exit" className="quick-action">
            Resignation & Exit Management
          </Link>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Recent leave requests</h2>
        {leaves.length === 0 ? (
          <p className="empty-state">No leave requests yet.</p>
        ) : (
          <ul className="leave-list">
            {leaves.slice(0, 5).map((l) => (
              <li key={l._id} className={`leave-item status-${l.status}`}>
                <span>{l.type}</span>
                <span>
                  {new Date(l.startDate).toLocaleDateString()} –{" "}
                  {new Date(l.endDate).toLocaleDateString()}
                </span>
                <span className="badge">{l.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Recent Notices</h2>

        {notices.length === 0 ? (
          <p className="empty-state">No notices available.</p>
        ) : (
          <ul className="leave-list">
            {notices.slice(0, 5).map((n) => (
              <li key={n._id} className="leave-item">
                <span className="notice-title">{n.title}</span>

                <span className="notice-date">
                  {new Date(n.createdBy).toLocaleDateString()}
                </span>

                <span className="notice-desc">
                  {n.description?.slice(0, 40)}...
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
