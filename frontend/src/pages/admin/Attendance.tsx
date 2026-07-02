import { useEffect, useState } from 'react';
import { attendanceApi, employeesApi } from '../../api/client';
import type { Attendance, Employee } from '../../types';
import './Attendance.css';

export default function AdminAttendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeesApi.list().then(setEmployees).catch(() => setEmployees([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = selectedEmployee ? { employeeId: selectedEmployee } : undefined;
    attendanceApi
      .list(params)
      .then(setAttendance)
      .catch(() => setAttendance([]))
      .finally(() => setLoading(false));
  }, [selectedEmployee]);

  const empMap = Object.fromEntries(employees.map((e) => [e._id, e]));

  return (
    <div className="admin-attendance">
      <h1 className="page-title">Attendance</h1>
      <p className="page-subtitle">View attendance records by employee</p>

      <div className="admin-attendance-filters">
        <label>
          Employee
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">All employees</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.firstName} {e.lastName} ({e.employeeId})
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : attendance.length === 0 ? (
        <p className="empty-state">No attendance records found.</p>
      ) : (
        <div className="attendance-table-wrap">
          <table className="admin-attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a._id}>
                  <td>
                    {empMap[a.employeeId]
                      ? `${empMap[a.employeeId].firstName} ${empMap[a.employeeId].lastName}`
                      : a.employeeId}
                  </td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—'}</td>
                  <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—'}</td>
                  <td><span className={`badge status-${a.status}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
