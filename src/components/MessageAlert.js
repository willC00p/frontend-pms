import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function MessageAlert({ message, type, renderMessage }) {
  if (!message) return null;

  return (
    <div className={`login-message ${type}`}>
      {type === 'success' && <FaCheckCircle className="message-icon success-icon" />}
      {type === 'error' && <FaTimesCircle className="message-icon error-icon" />}
      <span>{renderMessage ? renderMessage(message) : message}</span>
    </div>
  );
}

export default MessageAlert;