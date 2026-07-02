import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { salaryApi } from "../../api/client";
import type { Salary } from "../../types";
import "./Profile.css";
import "./Salary.css";

export default function EmployeeSalary() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salaryApi
      .getMySalary()
      .then(setSalaries)
      .catch(() => setSalaries([]))
      .finally(() => setLoading(false));
  }, []);

 

  // 📄 PDF Download
  const downloadPDF = (sal: Salary) => {
  const doc = new jsPDF();

  // 🔹 Company Header
  doc.setFontSize(16);
  doc.text("Company Name", 105, 15, { align: "center" });

  doc.setFontSize(14);
  doc.text(`Salary Slip for ${sal.month} ${sal.year}`, 105, 22, {
    align: "center",
  });

  // 🔹 Employee Details (2 Columns)
  autoTable(doc, {
    startY: 30,
    theme: "grid",
    body: [
      ["Name", "Employee Name", "Department", "IT"],
      ["Emp No", "EMP001", "Bank Name", "HDFC Bank"],
      ["Designation", "Developer", "A/c No", "XXXX1234"],
    ],
  });

  // 🔹 Earnings & Deductions Table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 5,
    theme: "grid",
    head: [["Earnings", "Amount", "Deductions", "Amount"]],
    body: [
      ["Basic Salary", sal.basic, "EPF", "1800"],
      ["House Rent Allowance", sal.hra, "Health Insurance", "500"],
      ["Conveyance Allowance", sal.allowances, "Professional Tax", "200"],
      ["Medical Allowance", "1167", "TDS", "-"],
      ["Special Allowance", "18732", "", ""],
      ["Gross Salary", "56000", "Total Deductions", "2500"],
    ],
  });

  // 🔹 Net Pay Section
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY,
    theme: "grid",
    body: [["Net Pay", sal.netSalary]],
    styles: {
      halign: "center",
      fontStyle: "bold",
    },
  });

  // 🔹 Amount in Words
  doc.text(
    `Amount in Words: Fifty Three Thousand Five Hundred`,
    14,
    doc.lastAutoTable.finalY + 10
  );

  // Save PDF
  doc.save(`Salary_${sal.month}_${sal.year}.pdf`);
};
  if (loading) return <div className="page-loading">Loading salary...</div>;
  if (!salaries.length)
    return <div className="page-loading">No salary records found.</div>;

  return (
    <div className="profile-page">
      <h1 className="page-title">My Salary</h1>

      {salaries.map((sal) => (
        <div key={sal._id} className="profile-card salary-card">
          {/* 🔹 Header (like profile header but simpler) */}
          <div className="salary-header">
            <div>
              <h2>
                {sal.month} {sal.year}
              </h2>
              <p className="profile-id">Salary Slip</p>
            </div>

            <span className={`status-badge status-${sal.status}`}>
              {sal.status}
            </span>
          </div>

          {/* 🔹 Salary Details (same pattern as profile-details) */}
          <dl className="profile-details">
            <dt>Basic</dt>
            <dd>₹ {sal.basic}</dd>

            <dt>HRA</dt>
            <dd>₹ {sal.hra}</dd>

            <dt>Allowances</dt>
            <dd>₹ {sal.allowances}</dd>

            <dt>Bonus</dt>
            <dd>₹ {sal.bonus}</dd>

            <dt>Deductions</dt>
            <dd>₹ {sal.deductions}</dd>

            <dt>
              <strong>Net Salary</strong>
            </dt>
            <dd>
              <strong>₹ {sal.netSalary}</strong>
            </dd>
          </dl>

          {/* 📄 Download Button */}
          <button className="download-btn" onClick={() => downloadPDF(sal)}>
            Download Slip
          </button>
        </div>
      ))}
    </div>
  );
}
