import { useEffect, useState } from 'react';
import { leaveApi } from '../../api/client';
import type { LeaveRequest } from '../../types';
import './Leave.css';

function getEmployeeName(emp: LeaveRequest['employeeId']): string {
  if (typeof emp === 'object' && emp !== null && 'firstName' in emp) {
    return `${(emp as { firstName: string }).firstName} ${(emp as { lastName: string }).lastName}`;
  }
  return '—';
}

export default function AdminLeave() {
  const [list, setList] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = () => leaveApi.list().then(setList).catch(() => setList([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    setActioning(id);
    try {
      await leaveApi.approve(id);
      load();
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioning(id);
    try {
      await leaveApi.reject(id);
      load();
    } finally {
      setActioning(null);
    }
  };

  const pending = list.filter((l) => l.status === 'pending');

  return (
    <div className="admin-leave">
      <h1 className="page-title">Leave management</h1>
      <p className="page-subtitle">Approve or reject employee leave requests</p>

      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : list.length === 0 ? (
        <p className="empty-state">No leave requests.</p>
      ) : (
        <>
          {pending.length > 0 && (
            <p className="pending-count">{pending.length} pending request(s)</p>
          )}
          <ul className="admin-leave-list">
            {list.map((l) => (
              <li key={l._id} className={`admin-leave-item status-${l.status}`}>
                <div className="leave-item-main">
                  <span className="emp-name">{getEmployeeName(l.employeeId)}</span>
                  <span className="leave-type">{l.type}</span>
                  <span className="leave-dates">
                    {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                  </span>
                  <span className="leave-reason">{l.reason}</span>
                  <span className="badge">{l.status}</span>
                </div>
                {l.status === 'pending' && (
                  <div className="leave-item-actions">
                    <button
                      type="button"
                      className="btn-approve"
                      onClick={() => handleApprove(l._id)}
                      disabled={actioning === l._id}
                    >
                      {actioning === l._id ? '...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="btn-reject"
                      onClick={() => handleReject(l._id)}
                      disabled={actioning === l._id}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
