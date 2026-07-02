import React, { useEffect, useState } from "react";
import { employeesApi, salaryStructureApi } from "../../api/client";
import type { Employee, SalaryStructure } from "../../types";
import { useNavigate } from "react-router-dom";
import "./Employees.css";
import "./salaryStructure.css";

function getEmployeeName(emp: SalaryStructure["employeeId"]): string {
  if (typeof emp === "object" && emp !== null && "firstName" in emp) {
    return `${emp.firstName} ${emp.lastName}`;
  }
  return "—";
}

export default function AdminSalaryStructure() {
  const [list, setList] = useState<SalaryStructure[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const navigator =useNavigate();
  

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    basic: "",
    hra: "",
    allowances: "",
    bonus: "",
    deductions: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Load Data
  const load = async () => {
    const [structureData, employeeData] = await Promise.all([
      salaryStructureApi.list(),
      employeesApi.list(),
    ]);
    setList(structureData );
    setEmployees(employeeData);
  };
  useEffect(() => {
    load()
      .catch(() => setList([])) 
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await salaryStructureApi.create({
        employeeId: form.employeeId,
        basic: Number(form.basic),
        hra: Number(form.hra),
        allowances: Number(form.allowances),
        bonus: Number(form.bonus),
        deductions: Number(form.deductions),
      });

      setShowForm(false);
      setForm({
        employeeId: "",
        basic: "",
        hra: "",
        allowances: "",
        bonus: "",
        deductions: "",
      });

      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create structure",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-employees">
      {/* 🔹 Header */}
      <div className="page-head">
        <h1 className="page-title">Salary Structure</h1>

        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add Structure
        </button>

        <button
          className="btn-primary"
          onClick={() => navigator("/admin/salary")}
        >
          Generate Salary
        </button>
      </div>

      <p className="page-subtitle">Manage salary configuration</p>

      {/* 🔹 Modal */}
      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h2>Add Salary Structure</h2>

            <form onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}

              <div className="form-grid">
                {/* Employee */}
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

                {/* Basic */}
                <label>
                  Basic
                  <input
                    type="number"
                    value={form.basic}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, basic: e.target.value }))
                    }
                    required
                  />
                </label>

                {/* HRA */}
                <label>
                  HRA
                  <input
                    type="number"
                    value={form.hra}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hra: e.target.value }))
                    }
                    required
                  />
                </label>

                {/* Allowances */}
                <label>
                  Allowances
                  <input
                    type="number"
                    value={form.allowances}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, allowances: e.target.value }))
                    }
                    required
                  />
                </label>

                {/* Bonus */}
                <label>
                  Bonus
                  <input
                    type="number"
                    value={form.bonus}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bonus: e.target.value }))
                    }
                  />
                </label>

                {/* Deductions */}
                <label>
                  Deductions
                  <input
                    type="number"
                    value={form.deductions}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deductions: e.target.value }))
                    }
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
                  {submitting ? "Saving..." : "Save"}
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
        <p className="empty-state">No salary structures yet.</p>
      ) : (
        <div className="employees-table-wrap">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>Allowances</th>
                <th>Bonus</th>
                <th>Deductions</th>
              </tr>
            </thead>

            <tbody>
              {list.map((s) => (
                <tr key={s._id}>
                  <td>{getEmployeeName(s.employeeId)}</td>
                  <td>₹ {s.basic}</td>
                  <td>₹ {s.hra}</td>
                  <td>₹ {s.allowances}</td>
                  <td>₹ {s.bonus}</td>
                  <td>₹ {s.deductions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
