import React, { useState } from 'react';
import '../assets/messages.css';

function Messages() {
  const [activeTab, setActiveTab] = useState('notification');

  const allMessages = {
    notification: [
      {
        sender: 'Juancho Dela Cruz',
        tag: 'Time In',
        preview: 'Velit officia consequat duis enim velit mollit...',
        time: '10:41 PM',
      },
      {
        sender: 'Catherine Malvar',
        tag: 'Parking Assigned',
        preview: 'Sunt qui esse pariatur duis deserunt mollit...',
        time: '12:01 PM',
      },
    ],
    chat: [
      {
        sender: 'Edward Layno',
        tag: 'New Message',
        preview: 'Nostrud irure ex duis ea quis id quis ad et...',
        time: '11:59 AM',
      },
    ],
    feedback: [
      {
        sender: 'Nico Leonardo',
        tag: 'Feedback',
        preview: 'Amet minim mollit non deserunt ullamco est...',
        time: '10:30 AM',
      },
      {
        sender: 'User Survey',
        tag: 'Feedback',
        preview: 'Excellent app with minor issues.',
        time: '09:15 AM',
      },
    ],
    incident: [
      {
        sender: 'Security Office',
        tag: 'Incident Report',
        preview: 'Unauthorized entry attempt detected...',
        time: '08:00 AM',
      },
    ]
  };

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h2>Hello Joseph,</h2>
        <h1>Messages</h1>
        <p className="breadcrumb">Dashboard / Messages / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
      </div>

      <div className="tab-bar">
        <button
          className={activeTab === 'notification' ? 'active-tab' : ''}
          onClick={() => setActiveTab('notification')}
        >
          🔔 Notification
        </button>
        <button
          className={activeTab === 'chat' ? 'active-tab' : ''}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chats <span className="tab-badge">1</span>
        </button>
        <button
          className={activeTab === 'feedback' ? 'active-tab' : ''}
          onClick={() => setActiveTab('feedback')}
        >
          📝 Feedback <span className="tab-badge green">6</span>
        </button>
        <button
          className={activeTab === 'incident' ? 'active-tab' : ''}
          onClick={() => setActiveTab('incident')}
        >
          ⚠️ Incident <span className="tab-badge green">2</span>
        </button>
      </div>

      <div className="message-list">
        {allMessages[activeTab].map((msg, i) => (
          <div className={`message-row ${msg.active ? 'active' : ''}`} key={i}>
            <div className="msg-left">
              <input type="checkbox" />
              <span className="msg-star">★</span>
              <strong>{msg.sender}</strong>
              {msg.tag && <span className="msg-tag">{msg.tag}</span>}
              {msg.badge && <span className="msg-badge">{msg.badge}</span>}
              <span className="msg-preview"> - {msg.preview}</span>
            </div>
            <div className="msg-time">{msg.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Messages;
