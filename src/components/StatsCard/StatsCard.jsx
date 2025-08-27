import React, { memo } from "react";
import styles from "./StatsCard.module.css";

/**
 * Generic stats card component used across the app.
 * Accepts optional label/title and emoji to support
 * different layouts in parent components.
 */
function StatsCard({
  title,
  label,
  value,
  emoji,
  className = "",
  labelClassName = "",
  valueClassName = "",
  emojiClassName = "",
  ...props
}) {
  const labelText = title || label;
  return (
    <div
      className={`${styles.card} ${className}`.trim()}
      role="status"
      aria-label={`${labelText}: ${value}`}
      {...props}
    >
      {title ? (
        <h3 className={`${styles.label} ${labelClassName}`.trim()}>{title}</h3>
      ) : (
        <span className={`${styles.label} ${labelClassName}`.trim()}>
          {label}
        </span>
      )}
      <span className={`${styles.value} ${valueClassName}`.trim()}>
        {value}
      </span>
      {emoji && (
        <span className={`${styles.emoji} ${emojiClassName}`.trim()}>
          {emoji}
        </span>
      )}
    </div>
  );
}

export default memo(StatsCard);
