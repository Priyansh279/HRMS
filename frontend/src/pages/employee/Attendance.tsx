import { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/client';
import type { Attendance } from '../../types';
import './Attendance.css';

export default function EmployeeAttendance() {
  const [list, setList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'in' | 'out' | null>(null);

  const load = () => attendanceApi.list().then(setList).catch(() => setList([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayRecord = list.find((a) => new Date(a.date).toDateString() === today);

  const handleCheckIn = async () => {
    setActionLoading('in');
    try {
      await attendanceApi.checkIn();
      load();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading('out');
    try {
      await attendanceApi.checkOut();
      load();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="attendance-page">
      <h1 className="page-title">Attendance</h1>
      <p className="page-subtitle">Check-in, check-out and view your attendance</p>

      <div className="attendance-actions">
        <div className="today-card">
          <h3>Today</h3>
          {todayRecord ? (
            <div className="today-times">
              <p>Check-in: {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : '—'}</p>
              <p>Check-out: {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : '—'}</p>
            </div>
          ) : (
            <p className="text-muted">No check-in yet today.</p>
          )}
          <div className="action-buttons">
            <button
              type="button"
              className="btn-primary"
              onClick={handleCheckIn}
              disabled={!!todayRecord?.checkIn || actionLoading === 'in'}
            >
              {actionLoading === 'in' ? '...' : 'Check in'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCheckOut}
              disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut || actionLoading === 'out'}
            >
              {actionLoading === 'out' ? '...' : 'Check out'}
            </button>
          </div>
        </div>
      </div>

      <section className="attendance-history">
        <h2>Recent attendance</h2>
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : list.length === 0 ? (
          <p className="empty-state">No attendance records yet.</p>
        ) : (
          <ul className="attendance-table">
            <li className="attendance-table-header">
              <span>Date</span>
              <span>Check-in</span>
              <span>Check-out</span>
              <span>Status</span>
            </li>
            {list.slice(0, 14).map((a) => (
              <li key={a._id} className="attendance-table-row">
                <span>{new Date(a.date).toLocaleDateString()}</span>
                <span>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—'}</span>
                <span>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—'}</span>
                <span className={`badge status-${a.status}`}>{a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
