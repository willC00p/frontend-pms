import React, { useState } from 'react';
import 'assets/pendinglist.css';
import { FaFilePdf, FaCheck, FaTimes } from 'react-icons/fa';

const pendingData = [
  {
    name: 'Angela Cruz',
    studentno: '2026100999',
    phonenumber: '09112223344',
    department: 'College of Engineering',
    position: 'Student',
    vehicletype: 'Sedan',
    platenumber: 'AAA 1111',
    or: 'or-angela.pdf',
    cr: 'cr-angela.pdf'
  },
  {
    name: 'Carlos Dizon',
    studentno: '2026111000',
    phonenumber: '09998887711',
    department: 'College of Arts',
    position: 'Faculty',
    vehicletype: 'Motorcycle',
    platenumber: 'BBB 2222',
    or: 'or-carlos.pdf',
    cr: 'cr-carlos.pdf'
  }
];

const PendingList = () => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [activeRole, setActiveRole] = useState('Student');

  const roleCount = {
    Student: 0,
    Faculty: 0,
    Personnel: 0,
    Guard: 0,
  };

  pendingData.forEach(user => {
    if (roleCount[user.position] !== undefined) {
      roleCount[user.position]++;
    }
  });

  const filteredData = pendingData
    .filter(user =>
      user.position === activeRole &&
      user.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="pendinglist-container">
      <div className="pendinglist-header">
        <h2>Pending List</h2>
        <div className="role-buttons">
          {Object.keys(roleCount).map((role) => (
            <button
              key={role}
              className={activeRole === role ? 'active' : ''}
              onClick={() => setActiveRole(role)}
            >
             {role === 'Faculty' ? 'Faculty' : `${role}s`}: {roleCount[role]}
            </button>
          ))}
        </div>
      </div>

      <div className="pendinglist-actions">
        <div className="role-buttons">
          <button className="add">Add</button>
          <button className="pending">Pending</button>
        </div>

        <div className="right-actions">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest to Oldest</option>
            <option value="oldest">Oldest to Newest</option>
          </select>
        </div>
      </div>

      <table className="pendinglist-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Student No.</th>
            <th>Phone Number</th>
            <th>Department</th>
            <th>Position</th>
            <th>Vehicle Type</th>
            <th>Plate Number</th>
            <th>OR</th>
            <th>CR</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.studentno}</td>
              <td>{user.phonenumber}</td>
              <td>{user.department}</td>
              <td>{user.position}</td>
              <td>{user.vehicletype}</td>
              <td>{user.platenumber}</td>
              <td>
                <a href={`/${user.or}`} className="pdf-link" target="_blank" rel="noopener noreferrer">
                  <FaFilePdf /> OR
                </a>
              </td>
              <td>
                <a href={`/${user.cr}`} className="pdf-link" target="_blank" rel="noopener noreferrer">
                  <FaFilePdf /> CR
                </a>
              </td>
              <td className="action-icons">
                <button className="approve"><FaCheck /></button>
                <button className="reject"><FaTimes /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingList;
