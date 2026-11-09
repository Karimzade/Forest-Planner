export default function Stat({ label, value, icon, gold }) {
  return (
    <div className={"stat " + (gold ? "gold-stat" : "")}>
      <span className="stat-icon">{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
import React from "react";
