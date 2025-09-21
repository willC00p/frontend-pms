import React from "react";
import ReactDOM from "react-dom";
import styles from "../pages/ParkingAssignmentPage.module.css";

const ParkingTooltip = ({ visible, x, y, children, className = "", style = {} }) => {
  if (!visible) return null;
  // Offset so tooltip appears above the slot
  const tooltipStyle = {
    position: "fixed",
    left: x,
    top: y,
    zIndex: 99999, // Extremely high z-index
    pointerEvents: "none", // Let clicks pass through the tooltip
    transform: "translate(-50%, -100%)", // Center horizontally and place above the space
    marginTop: -10, // Add some spacing between tooltip and space
    ...style,
  };
  return ReactDOM.createPortal(
    <div className={`${styles.tooltip} ${className}`} style={tooltipStyle}>
      {children}
    </div>,
    document.body
  );
};

export default ParkingTooltip;
