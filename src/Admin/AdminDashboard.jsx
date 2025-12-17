import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../../Config";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [month, setMonth] = useState("2025-12");
  const [data, setData] = useState({
    ngos: 0,
    people: 0,
    events: 0,
    funds: 0,
  });

  const [loading, setLoading] = useState(false);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    const isAdminLoggedIn =
      localStorage.getItem("isAdminLoggedIn") === "true";

    if (!isAdminLoggedIn) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  /* ================= FETCH DASHBOARD DATA ================= */
  const handleFetch = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${config.url}/dashboard?month=${month}`
      );

      setData(res.data);
      toast.success("Dashboard data loaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */
//   const handleLogout = () => {
//     localStorage.removeItem("isAdminLoggedIn");
//     navigate("/admin");
//   };

  const formattedMonth = new Date(month + "-01").toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={styles.page}>
      {/* ===== LOGOUT BAR ===== */}
      {/* <div style={styles.logoutBar}>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div> */}

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.heading}>Admin Dashboard</h2>

          <div style={styles.controls}>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={styles.monthInput}
            />
            <button
              style={styles.fetchBtn}
              onClick={handleFetch}
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch Data"}
            </button>
          </div>
        </div>

        <p style={styles.subText}>
          Showing data for <strong>{formattedMonth}</strong>
        </p>

        {/* Summary Cards */}
        <div style={styles.grid}>
          <SummaryCard
            title="Total NGOs Reporting"
            value={data.ngos}
            bg="#e0ecff"
            icon="👥"
          />

          <SummaryCard
            title="Total People Helped"
            value={data.people.toLocaleString()}
            bg="#e8fff3"
            icon="📈"
          />

          <SummaryCard
            title="Total Events Conducted"
            value={data.events}
            bg="#fff2e2"
            icon="📅"
          />

          <SummaryCard
            title="Total Funds Utilized"
            value={`₹${data.funds.toLocaleString()}`}
            bg="#e9fff3"
            icon="💲"
          />
        </div>
      </div>
    </div>
  );
}

/* ===================== CARD COMPONENT ===================== */

function SummaryCard({ title, value, bg, icon }) {
  return (
    <div style={{ ...styles.summaryCard, background: bg }}>
      <div style={styles.icon}>{icon}</div>
      <p style={styles.cardTitle}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
  },

  logoutBar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "16px",
  },

  logoutBtn: {
    padding: "10px 20px",
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },

  card: {
    width: "100%",
    maxWidth: "1000px",
    background: "#ffffff",
    padding: "32px",
    borderRadius: "14px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  heading: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#0f172a",
  },

  controls: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  monthInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
  },

  fetchBtn: {
    padding: "10px 16px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },

  subText: {
    marginBottom: "24px",
    color: "#475569",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
  },

  summaryCard: {
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  icon: {
    fontSize: "22px",
  },

  cardTitle: {
    fontSize: "14px",
    color: "#475569",
  },

  cardValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
  },
};
