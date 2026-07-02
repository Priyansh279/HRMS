import { useEffect, useState } from "react";
import { exitApi } from "../../api/client";
import type { ExitApplication } from "../../types";
import "./ExitApplication.css";

export default function EmployeeExit() {
  const [list, setList] = useState<ExitApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    reason: "",
    lastWorkingDay: "",
  });

  const [error, setError] = useState("");

  const load = () =>
    exitApi
      .list()
      .then(setList)
      .catch(() => setList([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.reason.trim() || !form.lastWorkingDay) {
      setError("Please fill all fields.");
      return;
    }

    setSubmitting(true);

    try {
      await exitApi.create(form);

      setForm({
        reason: "",
        lastWorkingDay: "",
      });

      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };
  const today =new Date().toISOString().split('T')[0];
  return (
    <div className="exit-page">
      <h1 className="page-title">Exit Application</h1>
      <p className="page-subtitle">Submit your resignation request</p>

      <div className="exit-form-card">
        <h2>Apply for resignation</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <label>
            Last Working Day
            <input
              type="date"
              value={form.lastWorkingDay}
              min={today}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  lastWorkingDay: e.target.value,
                }))
              }
              required
            />
          </label>

          <label>
            Reason
            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  reason: e.target.value,
                }))
              }
              placeholder="Reason for resignation"
              rows={3}
              required
            />
          </label>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Submitting..." : "Submit Exit Request"}
          </button>
        </form>
      </div>

      <section className="exit-list-section">
        <h2>Your exit requests</h2>

        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : list.length === 0 ? (
          <p className="empty-state">No exit requests yet.</p>
        ) : (
          <ul className="exit-table">
            <li className="exit-table-header">
              <span>Last Working Day</span>
              <span>Reason</span>
              <span>Status</span>
            </li>

            {list.map((e) => (
              <li key={e._id} className="exit-table-row">
                <span>{new Date(e.lastWorkingDay).toLocaleDateString()}</span>

                <span className="reason-cell">{e.reason}</span>

                <span className={`badge status-${e.status}`}>{e.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
