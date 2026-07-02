import React, { useEffect, useState } from 'react';
import { employeesApi } from '../../api/client';
import type { Employee } from '../../types';
import './Employees.css';

export default function AdminEmployees() {
  const [list, setList] = useState<Employee[]>([]);     
  const [loading, setLoading] = useState(true); 
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    firstName: '', 
    lastName: '',
    email: '',
    password: '',
    bankName:'',
    accountNumber:'',
    ifscCode:'',
    accountHolderName:'',
    department: '',
    designation: '',
    joinDate: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => employeesApi.list().then(setList);

  useEffect(() => {
    load().catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await employeesApi.create(form);
      setShowForm(false);
      setForm({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        bankName:'',
        accountNumber:'',
        ifscCode:'',
        accountHolderName:'',
        department: '',
        designation: '',
        joinDate: new Date().toISOString().slice(0, 10),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-employees">
      <div className="page-head">
        <h1 className="page-title">Employees</h1>
        <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
          Add employee
        </button>
      </div>
      <p className="page-subtitle">Manage employee records</p>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h2>Add employee</h2>
            <form onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}
              <div className="form-grid">
                <label>
                  Employee ID
                  <input
                    value={form.employeeId}
                    onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                    required
                    placeholder="EMP001"
                  />
                </label>
                <label>
                  First name
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Password (initial)
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </label>
                <label>
                  Department
                  <input
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Designation
                  <input
                    value={form.designation}
                    onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  Bank Name 
                  <input 
                  value={form.bankName}
                  onChange={(e)=>setForm((f)=>({...f,bankName:e.target.value}))}
                  />
                </label>

                <label>
                  AccountNumber
                  <input 
                  value={form.accountNumber}
                  onChange={(e)=>setForm((f)=>({...f,accountNumber:e.target.value}))}
                  />
                </label>

                <label>
                  IFSC CODE 
                  <input 
                  value={form.ifscCode}
                  onChange={(e)=>setForm((f)=>({...f,ifscCode:e.target.value}))}
                  />
                </label>

                <label>
                  Account HoldereName
                  <input 
                  value={form.accountHolderName}
                  onChange={(e)=>setForm((f)=>({...f,accountHolderName:e.target.value}))}
                  />
                </label>

                <label>
                  Join date
                  <input
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                    required
                  />
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : list.length === 0 ? (
        <p className="empty-state">No employees yet. Add one to get started.</p>
      ) : (
        <div className="employees-table-wrap">
          <table className="employees-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Bank Name</th>
                <th>Account Number</th>
                <th>ISFC CODE</th>
                <th>AccountHolderName</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((emp) => (
                <tr key={emp._id}>
                  <td><code>{emp.employeeId}</code></td>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.bankName }</td>
                  <td>{emp.accountNumber}</td>
                  <td>{emp.ifscCode}</td>
                  <td>{emp.accountHolderName}</td>
                  <td><span className={`status-badge status-${emp.status}`}>{emp.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
