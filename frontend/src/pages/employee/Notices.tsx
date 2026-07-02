import { useEffect, useState } from "react";
import { noticesApi } from "../../api/client";
import type { Notice } from "../../types";
import "./Notices.css";

export default function EmployeeNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    noticesApi
      .list()
      .then(setNotices)
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading notices...</div>;
  if (!notices.length) return <div className="page-loading">No notices available.</div>;

  return (
    <div className="employee-notices">
      <h1 className="page-title">Company Notices</h1>

      <div className="notices-list">
        {notices.map((notice) => (
          <div className="notice-card" key={notice._id}>
            
            <div className="notice-header">
              <h2>{notice.title}</h2>

              <span className={`notice-type type-${notice.type}`}>
                {notice.type}
              </span>
            </div>

            <p className="notice-description">{notice.description}</p>

            <div className="notice-footer">
              <span>
                Published: {new Date(notice.publishDate).toLocaleDateString()}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}