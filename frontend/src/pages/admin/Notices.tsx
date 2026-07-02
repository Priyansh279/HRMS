import React, { useEffect, useState } from "react";
import { noticesApi } from "../../api/client";
import type { Notice } from "../../types";
import "./Notices.css";

export default function AdminNotices() {
  const [list, setList] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "announcement",
    publishDate: new Date().toISOString().slice(0, 10),
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => noticesApi.list().then(setList);

  useEffect(() => {
    load().catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await noticesApi.create(form);

      setShowForm(false);

      setForm({
        title: "",
        description: "",
        type: "announcement",
        publishDate: new Date().toISOString().slice(0, 10),
      });

      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;

    await noticesApi.remove(id);
    load();
  };
  const handleEdit = async (id:string) => {
    if (!confirm("Edit this notice?")) return;

    await noticesApi.update(id,form);
    load();
  }
  const today =new Date().toISOString().split('T')[0];

  return (
    <div className="admin-notices">

      <div className="page-head">
        <h1 className="page-title">Company Notices</h1>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add notice
        </button>
      </div>

      <p className="page-subtitle">
        Manage announcements, holidays and reminders
      </p>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h2>Add notice</h2>

            <form onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}

              <div className="form-grid">

                <label>
                  Title
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    required
                  />
                </label>

                <label>
                  Type
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="announcement">Announcement</option>
                    <option value="holiday">Holiday</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </label>

                <label className="full">
                  Description
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    required
                  />
                </label>

                <label>
                  Publish date
                  <input
                    type="date"
                    value={form.publishDate}
                    min={today}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, publishDate: e.target.value }))
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
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : list.length === 0 ? (
        <p className="empty-state">No notices yet.</p>
      ) : (
        <div className="notices-table-wrap">

          <table className="notices-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Publish Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.map((notice) => (
                <tr key={notice._id}>
                  <td>{notice.title}</td>

                  <td>
                    <span className={`notice-type type-${notice.type}`}>
                      {notice.type}
                    </span>
                  </td>

                  <td>
                    {new Date(notice.publishDate).toLocaleDateString()}
                  </td>

                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(notice._id)}>
                      Delete
                    </button>
                    <button
                       className="btn-danger"
                       onClick={() => handleEdit(notice._id)}>
                        Edit
                    </button>
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