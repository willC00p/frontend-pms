import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import 'assets/userlist.css';

const userData = [
  {
    name: 'Juan Dela Cruz',
    studentno: '2026100837',
    phonenumber: '09842751837',
    department: 'College of Nursing',
    position: 'Student',
    vehicletype: 'SUV',
    platenumber: 'HWB 2389',
  },
  {
    name: 'Sanya Lopez',
    studentno: '2026100839',
    phonenumber: '09998887777',
    department: 'College of Science',
    position: 'Faculty',
    vehicletype: 'SUV',
    platenumber: 'ABC 1234',
  },
  {
    name: 'Kayden Reyes',
    studentno: '2026937163',
    phonenumber: '09775556666',
    department: 'Admin Office',
    position: 'Personnel',
    vehicletype: 'Motorcycle',
    platenumber: 'XYZ 9999',
  },
  {
    name: 'Duchess Sison',
    studentno: '2026184726',
    phonenumber: '09123456789',
    department: 'Security',
    position: 'Guard',
    vehicletype: 'SUV',
    platenumber: 'WHD 8394',
  }
];

const UserList = () => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [activeRole, setActiveRole] = useState('Student');

  const navigate = useNavigate(); 

  const roleCount = {
    Student: 0,
    Faculty: 0,
    Personnel: 0,
    Guard: 0,
  };

  userData.forEach(user => {
    if (roleCount[user.position] !== undefined) {
      roleCount[user.position]++;
    }
  });

  const filteredData = userData.filter(
    user =>
      user.position === activeRole &&
      user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="userlist-container">
      <div className="userlist-header">
        <h2>User List</h2>
        <div className="role-buttons">
          {['Student', 'Faculty', 'Personnel', 'Guard'].map(role => (
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

      <div className="userlist-actions">
        <div className="role-buttons">
          <button className="add">Add</button>
          <button
            className="pending"
            onClick={() => navigate('/pendinglist')} 
          >
            Pending
          </button>
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

      <table className="userlist-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Student No.</th>
            <th>Phone Number</th>
            <th>Department</th>
            <th>Position</th>
            <th>Vehicle Type</th>
            <th>Plate Number</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
