import React from 'react';
import 'assets/editparkingspace.css';

const EditParking = () => {
  return (
    <div className="edit-container">
      <h2 className="hall-title">Pimentel Hall</h2>
      <button className="edit-btn">Edit Parking</button>

      <div className="parking-layout">
        <div className="zone-label">A</div>
        <div className="parking-zone">
          <div className="slot">A1</div>
          <div className="slot filled">A2</div>
          <div className="slot">A3</div>
          <div className="slot filled">A4</div>
          <div className="slot">A5</div>
          <div className="slot">A6</div>
        </div>

        <div className="zone-label">B</div>
        <div className="parking-zone">
          <div className="slot">B1</div>
          <div className="slot filled">B2</div>
          <div className="slot filled">B3</div>
          <div className="slot">B4</div>
        </div>

        <div className="zone-label">C</div>
        <div className="parking-zone">
          <div className="slot">C1</div>
          <div className="slot">C2</div>
          <div className="slot">C3</div>
        </div>
      </div>

      <div className="parking-table">
        <div className="table-controls">
          <input type="text" placeholder="Search..." />
          <button className="add-btn">+ Add Information</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Username</th>
              <th>Vehicle Type</th>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Parking Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BSD 4568</td>
              <td>@juan</td>
              <td>SEDAN</td>
              <td>06/04/2025</td>
              <td>07:54 AM</td>
              <td>-</td>
              <td>A1</td>
              <td>
                <span className="action-icons">✏️ 🗑️</span>
              </td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditParking;
