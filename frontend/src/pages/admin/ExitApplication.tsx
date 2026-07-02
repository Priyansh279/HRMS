import { useEffect, useState } from "react";
import { exitApi } from "../../api/client";
import type { ExitApplication } from "../../types";
import "./ExitApplication.css";

function getEmployeeName(emp: ExitApplication["employeeId"]): string {
  if (typeof emp === "object" && emp !== null && "firstName" in emp) {
    return `${(emp as { firstName: string }).firstName} ${(emp as { lastName: string }).lastName}`;
  }
  return "—";
}

export default function AdminExits() {
  const [list, setList] = useState<ExitApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = () =>
    exitApi
      .list()
      .then(setList)
      .catch(() => setList([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    setActioning(id);

    try {
      await exitApi.approve(id);
      load();
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioning(id);

    try {
      await exitApi.reject(id);
      load();
    } finally {
      setActioning(null);
    }
  };

  const pending = list.filter((e) => e.status === "pending");

  return (
    <div className="admin-exit">
      <h1 className="page-title">Exit management</h1>

      <p className="page-subtitle">
        Approve or reject employee resignation requests
      </p>

      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : list.length === 0 ? (
        <p className="empty-state">No exit requests.</p>
      ) : (
        <>
          {pending.length > 0 && (
            <p className="pending-count">{pending.length} pending request(s)</p>
          )}

          <ul className="admin-exit-list">
            {list.map((e) => (
              <li key={e._id} className={`admin-exit-item status-${e.status}`}>
                <div className="exit-item-main">
                  <span className="emp-name">
                    {getEmployeeName(e.employeeId)}
                  </span>

                  <span className="exit-date">
                    {new Date(e.lastWorkingDay).toLocaleDateString()}
                  </span>

                  <span className="exit-reason">{e.reason}</span>

                  <span className="badge">{e.status}</span>
                </div>

                {e.status === "pending" && (
                  <div className="exit-item-actions">
                    <button
                      type="button"
                      className="btn-approve"
                      onClick={() => handleApprove(e._id)}
                      disabled={actioning === e._id}
                    >
                      {actioning === e._id ? "..." : "Approve"}
                    </button>

                    <button
                      type="button"
                      className="btn-reject"
                      onClick={() => handleReject(e._id)}
                      disabled={actioning === e._id}
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
