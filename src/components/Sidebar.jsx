// Sidebar.jsx
import React, { useState, useEffect } from "react";
import "../css/sidebar.css";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // add/remove class on body so main layout can adapt
    if (collapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }

    // cleanup (optional)
    return () => document.body.classList.remove("sidebar-collapsed");
  }, [collapsed]);

  const toggle = () => setCollapsed((s) => !s);

  // navigation items (customize hrefs if you use react-router Links)
  const items = [
    { label: "Dashboard", icon: "fas fa-home", href: "/dashboard" },
    { label: "Manajemen User", icon: "fas fa-users-cog", href: "/users" },
    { label: "UMKM", icon: "fas fa-store", href: "/umkm" },
    { label: "Pendidikan", icon: "fas fa-graduation-cap", href: "/pendidikan" },
    { label: "Kesehatan", icon: "fas fa-heartbeat", href: "/kesehatan" },
    { label: "Bantuan Hukum", icon: "fas fa-balance-scale", href: "/hukum" },
    { label: "Sosial", icon: "fas fa-hands-helping", href: "/sosial" },
  ];

  // helper to detect active item (basic)
  const currentPath = window.location.pathname;

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} aria-hidden={false}>
      <div className="sidebar-header">
        <div>
          <div className="brand">Membership</div>
          <div className="small-note">Management System</div>
        </div>

        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          className="toggle-btn"
          onClick={toggle}
        >
          <i className={`fas ${collapsed ? "fa-bars" : "fa-times"}`} />
        </button>
      </div>

      <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
        {items.map((it) => (
          <a
            key={it.href}
            href={it.href}
            className={`nav-item ${currentPath === it.href ? "active" : ""}`}
          >
            <div className="icon-wrap">
              <i className={it.icon} />
            </div>
            <div className="label">{it.label}</div>
          </a>
        ))}
      </nav>
    </aside>
  );
}
