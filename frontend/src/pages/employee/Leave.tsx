import { useEffect, useState } from 'react';
import { leaveApi } from '../../api/client';
import type { LeaveRequest, LeaveType } from '../../types';
import './Leave.css';

const LEAVE_TYPES: LeaveType[] = ['sick', 'casual', 'annual', 'unpaid', 'other'];

export default function EmployeeLeave() {
  const [list, setList] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'casual' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const load = () => leaveApi.list().then(setList).catch(() => setList([]));

  const today =new Date().toISOString().split('T')[0];

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setError('Please fill all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await leaveApi.create(form);
      setForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="leave-page">
      <h1 className="page-title">Leave</h1>
      <p className="page-subtitle">Apply for leave and view your requests</p>

      <div className="leave-form-card">
        <h2>Apply for leave</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          <div className="form-row">
            <label>
              Type
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LeaveType }))}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Start date
              <input
                type="date"
                value={form.startDate}
                min={today}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                required
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || today}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                required
              />
            </label>
          </div>
          <label>
            Reason
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Brief reason for leave"
              rows={3}
              required
            />
          </label>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
        </form>
      </div>

      <section className="leave-list-section">
        <h2>Your leave requests</h2>
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : list.length === 0 ? (
          <p className="empty-state">No leave requests yet.</p>
        ) : (
          <ul className="leave-table">
            <li className="leave-table-header">
              <span>Type</span>
              <span>Start</span>
              <span>End</span>
              <span>Reason</span>
              <span>Status</span>
            </li>
            {list.map((l) => (
              <li key={l._id} className="leave-table-row">
                <span>{l.type}</span>
                <span>{new Date(l.startDate).toLocaleDateString()}</span>
                <span>{new Date(l.endDate).toLocaleDateString()}</span>
                <span className="reason-cell">{l.reason}</span>
                <span className={`badge status-${l.status}`}>{l.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
