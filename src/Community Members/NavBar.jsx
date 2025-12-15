import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.wrapper}>
      <div style={styles.nav}>
        <div style={styles.links}>
          <NavLink to="/" style={navLinkStyle}>
            Submit Report
          </NavLink>

          <NavLink to="/csv-upload" style={navLinkStyle}>
            CSV Upload
          </NavLink>

          <NavLink to="/admin/dashboard" style={navLinkStyle}>
            Admin Dashboard
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

const navLinkStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "20px 80px",
  borderRadius: "999px", // pill shape
  fontWeight: "500",
  fontSize: "14px",
  color: isActive ? "#ffffff" : "#2563eb",
  background: isActive ? "#2563eb" : "#e0e7ff",
  transition: "all 0.2s ease",
});

const styles = {
//   wrapper: {
//     background: "#f5f7fb",
//     padding: "16px",
//   },

  nav: {
    Width: "100%",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "999px", // rounded navbar
    padding: "12px 20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "center",
  },

  links: {
    display: "flex",
    gap: "16px", // spacing between pills
  },
};
