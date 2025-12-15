import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function CsvUploadPage() {
  const [file, setFile] = useState(null);

  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [polling, setPolling] = useState(false);

  const pollTimerRef = useRef(null);

  const API_UPLOAD = "http://localhost:5000/uploadreports";
  const API_JOB_STATUS = (id) => `http://localhost:5000/job-status/${id}`;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Some browsers may not set type correctly, so we also check extension.
    const isCsvType = selected.type === "text/csv";
    const isCsvExt = selected.name.toLowerCase().endsWith(".csv");

    if (!isCsvType && !isCsvExt) {
      toast.error("Please upload a valid CSV file (.csv)");
      return;
    }

    setFile(selected);
    // reset previous job state
    setJobId(null);
    setJobStatus(null);
  };

  const startUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      // IMPORTANT: backend multer expects field name "file"
      formData.append("file", file);

      const res = await axios.post(API_UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newJobId = res.data?.job_id;
      if (!newJobId) {
        toast.error("Upload succeeded but job_id not returned");
        return;
      }

      setJobId(newJobId);
      toast.success("CSV uploaded. Processing started.");

      // start polling
      startPolling(newJobId);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data ||
        err.message ||
        "Upload failed";
      toast.error(String(msg));
    } finally {
      setUploading(false);
    }
  };

  const fetchJobStatusOnce = async (id) => {
    const res = await axios.get(API_JOB_STATUS(id));
    return res.data;
  };

  const startPolling = (id) => {
    // clear any existing polling timer
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    setPolling(true);

    // poll immediately once, then every 1.2s
    fetchJobStatusOnce(id)
      .then((data) => setJobStatus(data))
      .catch(() => {});

    pollTimerRef.current = setInterval(async () => {
      try {
        const data = await fetchJobStatusOnce(id);
        setJobStatus(data);

        const status = (data?.status || "").toLowerCase();
        if (status === "completed" || status === "failed") {
          stopPolling();

          if (status === "completed") toast.success("CSV processed successfully!");
          if (status === "failed") toast.error("CSV processing failed!");
        }
      } catch (err) {
        // If status endpoint errors repeatedly you can stop polling
        // For now, just show one toast and keep polling.
        // toast.error("Unable to fetch job status");
      }
    }, 1200);
  };

  const stopPolling = () => {
    setPolling(false);
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = jobStatus?.total ?? 0;
  const processed = jobStatus?.processed ?? 0;
  const success = jobStatus?.success ?? 0;
  const failed = jobStatus?.failed ?? 0;

  const progressPct =
    total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  // Backend currently stores errors as strings; we show them in a table.
  const errors = Array.isArray(jobStatus?.errors) ? jobStatus.errors : [];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Bulk Report Upload</h2>

        {/* Upload Box */}
        <div style={styles.uploadSection}>
          <p style={styles.label}>Upload CSV File</p>

          <label style={styles.uploadBox}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div style={styles.uploadContent}>
              <div style={styles.uploadIcon}>⬆</div>
              <p style={styles.uploadText}>
                {file ? file.name : "Click to select CSV file"}
              </p>
            </div>
          </label>
        </div>

        {/* CSV Format */}
        <div style={styles.formatBox}>
          <p style={styles.formatTitle}>CSV Format</p>
          <code style={styles.code}>
            ngo_id,month,people_helped,events_conducted,funds_utilized
          </code>
          <p style={styles.example}>Example: NGO001,2025-01,500,10,250000</p>
        </div>

        <button
          onClick={startUpload}
          disabled={!file || uploading || polling}
          style={{
            ...styles.button,
            opacity: !file || uploading || polling ? 0.6 : 1,
          }}
        >
          {uploading
            ? "Uploading..."
            : polling
            ? "Processing..."
            : "⬆ Upload and Process"}
        </button>

        {/* ================= JOB RESULT ================= */}
        {jobId && (
          <div style={styles.progressSection}>
            <p>
              <strong>Job ID:</strong> {jobId}
            </p>

            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progressPct}%`,
                  background:
                    (jobStatus?.status || "").toLowerCase() === "failed"
                      ? "#ef4444"
                      : "#22c55e",
                }}
              />
            </div>

            <p style={{ marginTop: 6, color: "#475569", fontSize: 13 }}>
              {total > 0
                ? `Processed ${processed} of ${total} rows (${progressPct}%)`
                : "Waiting for processing to start..."}
              {"  "}
              <strong style={{ textTransform: "uppercase" }}>
                {jobStatus?.status || ""}
              </strong>
            </p>

            <div style={styles.summaryGrid}>
              <SummaryCard label="Total Rows" value={total} />
              <SummaryCard label="Processed" value={processed} />
              <SummaryCard label="Success" value={success} success />
              <SummaryCard label="Failed" value={failed} error />
            </div>
          </div>
        )}

        {/* ================= ERROR TABLE ================= */}
        {jobId && errors.length > 0 && (
          <div style={styles.tableSection}>
            <h3 style={styles.tableHeading}>Failed Records</h3>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((errMsg, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={{ ...styles.td, color: "#b91c1c" }}>
                        {String(errMsg)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: 10, fontSize: 13, color: "#475569" }}>
              Note: To show full per-row details (ngo_id/month/etc.) in this
              table, the backend must store structured row errors (not just
              strings).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= REUSABLE CARD ================= */

function SummaryCard({ label, value, success, error }) {
  return (
    <div style={styles.summaryCard}>
      <p style={styles.summaryLabel}>{label}</p>
      <p
        style={{
          ...styles.summaryValue,
          color: success ? "#16a34a" : error ? "#dc2626" : "#2563eb",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    justifyContent: "center",
    paddingTop: "40px",
  },
  card: {
    width: "100%",
    maxWidth: "800px",
    background: "#fff",
    padding: "32px",
    borderRadius: "14px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  heading: { fontSize: "20px", marginBottom: "20px" },

  uploadSection: { marginBottom: "20px" },
  label: { fontSize: "14px", marginBottom: "8px" },

  uploadBox: {
    height: "160px",
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  uploadContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  uploadIcon: { fontSize: "28px" },
  uploadText: { color: "#334155" },

  formatBox: {
    background: "#eff6ff",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  formatTitle: { fontWeight: "600" },
  code: {
    display: "block",
    background: "#fff",
    padding: "8px",
    borderRadius: "6px",
    marginTop: "6px",
  },
  example: { marginTop: 8, fontSize: 13, color: "#475569" },

  button: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
  },

  progressSection: { marginTop: "32px" },
  progressBar: {
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "999px",
    margin: "12px 0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "0%",
    borderRadius: "999px",
    transition: "width 0.2s ease",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginTop: 12,
  },
  summaryCard: {
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
  },
  summaryLabel: { fontSize: "13px", color: "#475569" },
  summaryValue: { fontSize: "20px", fontWeight: "600" },

  tableSection: { marginTop: "32px" },
  tableHeading: { marginBottom: 12 },
  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "12px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "left",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },
};
