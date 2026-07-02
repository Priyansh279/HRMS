import React, { useEffect, useState } from "react";
import { salaryApi, employeesApi } from "../../api/client";
import type { Salary, Employee } from "../../types";
import { useNavigate } from "react-router-dom";
import "./Employees.css";
import "./Salary.css";

function getEmployeeName(emp: Salary["employeeId"]): string {
  if (typeof emp === "object" && emp !== null && "firstName" in emp) {
    return `${emp.firstName} ${emp.lastName}`;
  }
  return "—";
}

export default function AdminSalary() {
  const [list, setList] = useState<Salary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const navigator = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    month: "",
    year: new Date().getFullYear(),
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [salaryData, employeeData] = await Promise.all([
      salaryApi.list(),
      employeesApi.list(),
    ]);
    setList(salaryData);
    setEmployees(employeeData);
  };

  useEffect(() => {
    load()
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Generate Salary
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await salaryApi.generate(form);

      setShowForm(false);
      setForm({
        employeeId: "",
        month: "",
        year: new Date().getFullYear(),
      });

      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate salary",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Mark Paid
  const markPaid = async (id: string) => {
    try {
      await salaryApi.markPaid(id);
      load();
    } catch {
      alert("Failed to update status");
    }
  };
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="admin-employees">
      <div className="page-head">
        <h1 className="page-title">Salary Management</h1>

        <button
          className="btn-primary"
          onClick={() => navigator("/admin/salaryStructure")}
        >
          Add Salary
        </button>

        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Generate Salary
        </button>
      </div>

      <p className="page-subtitle">Manage employee salaries</p>

      {/* 🔹 Modal Form */}
      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h2>Generate Salary</h2>

            <form onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}

              <div className="form-grid">
                <label>
                  Employee
                  <select
                    value={form.employeeId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, employeeId: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Month
                  <select
                    value={form.month}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, month: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select Month</option>
                    {MONTHS.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Year
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, year: Number(e.target.value) }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Generating..." : "Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 Table */}
      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : list.length === 0 ? (
        <p className="empty-state">No salary records yet.</p>
      ) : (
        <div className="employees-table-wrap">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Year</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {list.map((sal) => (
                <tr key={sal._id}>
                  <td>{getEmployeeName(sal.employeeId)}</td>

                  <td>{sal.month}</td>
                  <td>{sal.year}</td>
                  <td>₹ {sal.netSalary}</td>

                  <td>
                    <span className={`status-badge status-${sal.status}`}>
                      {sal.status}
                    </span>
                  </td>

                  <td>
                    {sal.status === "unpaid" && (
                      <button
                        className="btn-primary"
                        onClick={() => markPaid(sal._id)}
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
