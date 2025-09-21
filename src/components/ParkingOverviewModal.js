import React, { useState } from 'react';
import styles from '../pages/ParkingAssignmentPage.module.css';
import api from '../utils/api';

const ParkingOverviewModal = ({ layout, assignments, onClose, fetchLayout, fetchAssignments }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchPlate, setSearchPlate] = useState('');
    const [searchSlotName, setSearchSlotName] = useState('');

    // Filter slots by assignee name, plate number, or slot metadata name
    const filteredSlots = layout.parking_slots.filter(slot => {
        const assignment = assignments[String(slot.id)];
        const nameMatch = searchTerm.trim() === '' || (assignment && assignment.name && assignment.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const plateMatch = searchPlate.trim() === '' || (assignment && assignment.vehicle_plate && assignment.vehicle_plate.toLowerCase().includes(searchPlate.toLowerCase()));
        // Search by slot metadata.name (case-insensitive)
        const slotName = slot.metadata && slot.metadata.name ? String(slot.metadata.name) : '';
        const slotNameMatch = searchSlotName.trim() === '' || slotName.toLowerCase().includes(searchSlotName.toLowerCase());
        return nameMatch && plateMatch && slotNameMatch;
    });

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.tableTitle}>Parking Space Overview</h2>
                    <button 
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search by Name"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '180px' }}
                    />
                    <input
                        type="text"
                        placeholder="Search by Plate Number"
                        value={searchPlate}
                        onChange={e => setSearchPlate(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '180px' }}
                    />
                    <input
                        type="text"
                        placeholder="Search by Slot Name"
                        value={searchSlotName}
                        onChange={e => setSearchSlotName(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '180px' }}
                    />
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.parkingTable}>
                        <thead>
                            <tr>
                                <th>Space Number</th>
                                <th>Status</th>
                                <th>Assignee</th>
                                <th>Type</th>
                                <th>Faculty Position</th>
                                <th>Vehicle Details</th>
                                <th>Vehicle Color</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSlots.map(slot => {
                                const assignment = assignments[String(slot.id)];
                                return (
                                    <tr key={slot.id} className={slot.space_status === 'reserved' ? styles.reservedRow : 
                                                               slot.space_status === 'occupied' ? styles.occupiedRow : 
                                                               styles.availableRow}>
                                        <td>{slot.metadata && slot.metadata.name ? slot.metadata.name : (slot.name || slot.space_number)}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[slot.space_status]}`}>
                                                {slot.space_status.charAt(0).toUpperCase() + slot.space_status.slice(1)}
                                            </span>
                                        </td>
                                        <td>{assignment ? assignment.name : '-'}</td>
                                        <td>{assignment ? (assignment.assignee_type === 'faculty' ? 'Faculty' : 'Guest') : '-'}</td>
                                        <td>{assignment && assignment.assignee_type === 'faculty' ? (assignment.faculty_position || '-') : '-'}</td>
                                        <td>{assignment ? assignment.vehicle_details : '-'}</td>
                                        <td>{assignment ? assignment.vehicle_color || '-' : '-'}</td>
                                        <td>{assignment ? new Date(assignment.start_time).toLocaleString() : '-'}</td>
                                        <td>{assignment?.end_time ? new Date(assignment.end_time).toLocaleString() : '-'}</td>
                                        <td>
                                            {assignment && (
                                                <button
                                                    className={styles.unassignTableButton}
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to unassign this parking space?')) {
                                                            try {
                                                                await api.initCsrf();
                                                                await api.post(`/parking-assignments/${assignment.id}/end`);
                                                                await Promise.all([fetchLayout(), fetchAssignments()]);
                                                                window.showAlert('Parking space unassigned successfully!', 'success');
                                                            } catch (error) {
                                                                window.showAlert('Failed to unassign parking space', 'error');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Unassign
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ParkingOverviewModal;
