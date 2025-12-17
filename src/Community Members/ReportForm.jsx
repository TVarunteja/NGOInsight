import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../../Config";

export default function ReportForm() {
  const [formData, setFormData] = useState({
    ngo_id: "",
    month: "",
    people_helped: "",
    events_conducted: "",
    funds_utilized: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.ngo_id ||
      !formData.month ||
      !formData.people_helped ||
      !formData.events_conducted ||
      !formData.funds_utilized
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${config.url}/insertreport`,
        {
          ngo_id: formData.ngo_id,
          month: formData.month,
          people_helped: Number(formData.people_helped),
          events_conducted: Number(formData.events_conducted),
          funds_utilized: Number(formData.funds_utilized),
        }
      );

      toast.success(response.data || "Report submitted successfully!");

      // Reset form
      setFormData({
        ngo_id: "",
        month: "",
        people_helped: "",
        events_conducted: "",
        funds_utilized: "",
      });
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Submit Monthly Report</h2>

        <form onSubmit={handleSubmit}>
          {/* NGO ID */}
          <div style={styles.field}>
            <label style={styles.label}>NGO ID *</label>
            <input
              name="ngo_id"
              placeholder="Enter NGO ID"
              value={formData.ngo_id}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* Month */}
          <div style={styles.field}>
            <label style={styles.label}>Month *</label>
            <input
              type="month"
              name="month"
              value={formData.month}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* People Helped */}
          <div style={styles.field}>
            <label style={styles.label}>People Helped *</label>
            <input
              type="number"
              name="people_helped"
              value={formData.people_helped}
              onChange={handleChange}
              min="0"
              style={styles.input}
            />
          </div>

          {/* Events Conducted */}
          <div style={styles.field}>
            <label style={styles.label}>Events Conducted *</label>
            <input
              type="number"
              name="events_conducted"
              value={formData.events_conducted}
              onChange={handleChange}
              min="0"
              style={styles.input}
            />
          </div>

          {/* Funds Utilized */}
          <div style={styles.field}>
            <label style={styles.label}>Funds Utilized *</label>
            <input
              type="number"
              name="funds_utilized"
              value={formData.funds_utilized}
              onChange={handleChange}
              min="0"
              style={styles.input}
            />
          </div>

          <center>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </center>
        </form>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#f5f7fb",
    minHeight: "100vh",
    paddingTop: "40px",
  },
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "40px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "24px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },
};
