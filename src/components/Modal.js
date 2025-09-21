import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {title && <h2 className="modal-title">{title}</h2>}

        <div className="modal-body">{children}</div>

        {/* No built-in cancel/close button here */}
      </div>
    </div>
  );
};

export default Modal;