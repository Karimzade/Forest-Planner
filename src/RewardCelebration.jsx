import React, { useEffect } from "react";
import { useLanguage } from "./Language";
import "./celebration.css";

export default function RewardCelebration({ title, onClose }) {
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(onClose, 7500);
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="reward-celebration">
      <div className="celebration-leaves" aria-hidden="true">
        {Array.from({ length: 36 }, (_, index) => (
          <span key={index} className={`falling-leaf leaf-${index}`} />
        ))}
      </div>
      <div className="celebration-message" role="status" aria-live="polite">
        <span className="celebration-emblem" aria-hidden="true">
          ❧
        </span>
        <strong>{t("Time to celebrate!")}</strong>
        <p dir="auto">{title}</p>
        <small>{t("Reward claimed! Set your next reward.")}</small>
        <button type="button" onClick={onClose} aria-label={t("Close")}>
          ×
        </button>
      </div>
    </div>
  );
}
