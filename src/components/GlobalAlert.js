import React from 'react';
import { useAlert } from 'context/AlertContext';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import 'assets/alert.css';

const GlobalAlert = () => {
  const { alerts, removeAlert } = useAlert();

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="global-alert-portal" role="status" aria-live="polite">
      {alerts.map((a) => (
        <div key={a.id} className={`global-alert ${a.type}`} onClick={() => removeAlert(a.id)}>
          {a.type === 'success' && <FaCheckCircle className="ga-icon" />}
          {a.type === 'error' && <FaTimesCircle className="ga-icon" />}
          <div className="ga-message">{String(a.message)}</div>
          <button className="ga-close" onClick={() => removeAlert(a.id)} aria-label="Close">×</button>
        </div>
      ))}
    </div>
  );
};

export default GlobalAlert;
