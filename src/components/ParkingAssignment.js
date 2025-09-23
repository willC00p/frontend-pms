import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import api from '../utils/api';
import styles from './ParkingAssignment.module.css';
import normalizeImageUrl from '../utils/imageUrl';

const ParkingAssignment = ({ show, onHide, layout, onAssignmentComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showBackground, setShowBackground] = useState(true);
    const [stageScale, setStageScale] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [layoutElements, setLayoutElements] = useState({ lines: [], texts: [] });
    const [parkingSpaces, setParkingSpaces] = useState([]);

    // Enforce strict canvas size 1024x768
    const canvasWidth = 1024;
    const canvasHeight = 768;

    // form state and assignment type
    const [formData, setFormData] = useState({
        parking_slot_id: '',
        user_id: '',
        name: '',
        contact: '',
        vehicle_plate: '',
        vehicle_type: '',
        vehicle_color: '',
        start_time: new Date().toISOString().slice(0, 16),
        end_time: '',
        purpose: '',
        faculty_position: '',
        assignee_type: 'guest',
        assignment_type: 'assign'
    });
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [assignmentType, setAssignmentType] = useState('guest'); // guest or faculty

    useEffect(() => {
        if (layout) {
            // Set parking spaces
            setParkingSpaces(layout.parking_slots || []);
            // Set layout elements (lines and texts)
            setLayoutElements(layout.layout_elements || { lines: [], texts: [] });
        }
    }, [layout]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await api.initCsrf();
            // Prepare the assignment data
                        // For now, handle both faculty and guests similarly since user_id feature is not yet implemented
            const assignmentData = {
                parking_slot_id: selectedSlot.id,
                guest_name: formData.name,
                guest_contact: formData.contact,
                vehicle_plate: formData.vehicle_plate,
                vehicle_type: formData.vehicle_type,
                vehicle_color: formData.vehicle_color,
                start_time: formData.start_time,
                end_time: formData.end_time || null,
                purpose: formData.purpose,
                faculty_position: formData.assignee_type === 'faculty' ? formData.faculty_position : null,
                assignee_type: formData.assignee_type,
                assignment_type: formData.end_time ? 'reserve' : 'assign'
            };
            console.log('Sending assignment data:', assignmentData);

            const response = await api.post('/parking-assignments', assignmentData);

            if (onAssignmentComplete) {
                onAssignmentComplete(response.data.assignment);
            }
            onHide();
        } catch (error) {
            console.error('Error creating assignment:', error);
            const errorMessage = error.response?.data?.message 
                ? `Error: ${error.response.data.message}` 
                : 'Failed to create parking assignment';
            const validationErrors = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join('\n')
                : '';
            setError(`${errorMessage}\n${validationErrors}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h2>{layout.name} - Select a Space to Assign</h2>
                            <button
                                onClick={() => setShowBackground(!showBackground)}
                                style={{
                                    padding: '4px 8px',
                                    background: showBackground ? '#2563eb' : '#4b5563',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {showBackground ? 'Hide Background' : 'Show Background'}
                            </button>
                        </div>
                        <button onClick={onHide}>&times;</button>
                    </div>

                    <div className={styles.layoutSection}>
                        <div style={{ width: `${Math.max(1, canvasWidth * stageScale)}px`, height: `${Math.max(1, canvasHeight * stageScale)}px`, position: 'relative' }}>
                            <div 
                                className={`${styles.layoutContainer} ${!showBackground ? styles.hideBg : ''}`}
                                style={{
                                    backgroundImage: layout?.background_image ? `url(${normalizeImageUrl(layout.background_image)})` : 'none',
                                    width: `${canvasWidth}px`,
                                    height: `${canvasHeight}px`,
                                    backgroundSize: `${canvasWidth}px ${canvasHeight}px`,
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    margin: 'auto',
                                    border: '1px solid #333',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    transform: `scale(${stageScale})`,
                                    transformOrigin: 'top left'
                                }}
                            >
                        {console.log('Layout dimensions:', layout.width, layout.height)}
                        {console.log('Parking slots:', layout.parking_slots)}
                        {layout.parking_slots.map(slot => (
                            <div
                                key={slot.id}
                                className={`${styles.parkingSpace} ${slot.space_status === 'occupied' ? styles.occupied : styles.available} ${selectedSlot?.id === slot.id ? styles.selected : ''}`}
                                style={{
                                    left: `${slot.position_x}px`,
                                    top: `${slot.position_y}px`,
                                    width: `${slot.width}px`,
                                    height: `${slot.height}px`,
                                    transform: `rotate(${slot.rotation || 0}deg)`,
                                    position: 'absolute'
                                }}
                                onClick={() => {
                                    setSelectedSlot(slot);
                                    setFormData(prev => ({ ...prev, parking_slot_id: slot.id }));
                                }}
                            >
                                <span className={styles.spaceNumber}>{slot.space_number}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
            {selectedSlot && (
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Assignment Type</label>
                        <div className={styles.radioGroup}>
                            <label>
                                <input
                                    type="radio"
                                    name="assignmentType"
                                    value="guest"
                                    checked={assignmentType === 'guest'}
                                    onChange={(e) => {
                                        setAssignmentType(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            assignee_type: 'guest'
                                        }));
                                    }}
                                />
                                Guest
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="assignmentType"
                                    value="faculty"
                                    checked={assignmentType === 'faculty'}
                                    onChange={(e) => {
                                        setAssignmentType(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            assignee_type: 'faculty'
                                        }));
                                    }}
                                />
                                Faculty
                            </label>
                        </div>
                    </div>

                    {formData.assignee_type === 'faculty' && (
                        <div className={styles.formGroup}>
                            <label>Faculty Position</label>
                            <input
                                type="text"
                                name="faculty_position"
                                value={formData.faculty_position}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label>{assignmentType === 'faculty' ? 'Faculty Name' : 'Guest Name'}</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label>Contact Number</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Vehicle Type</label>
                        <select
                            name="vehicle_type"
                            value={formData.vehicle_type}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select vehicle type</option>
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="bicycle">Bicycle</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Vehicle Plate Number</label>
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <input
                                                                            type="text"
                                                                            name="vehicle_plate"
                                                                            value={formData.vehicle_plate}
                                                                            onChange={handleInputChange}
                                                                            required
                                                                    />
                                                                    <button type="button" onClick={async () => {
                                                                            const plate = (formData.vehicle_plate || '').trim();
                                                                            if (!plate) { setError('Enter a plate number to lookup'); return; }
                                                                            setIsLoading(true);
                                                                            setError(null);
                                                                            try {
                                                                                await api.initCsrf();
                                                                                const resp = await api.get(`/vehicles/lookup-by-plate/${encodeURIComponent(plate)}`);
                                                                                const vehicle = resp.data?.vehicle || resp.data || null;
                                                                                if (!vehicle) {
                                                                                    setError('No record found for that plate number');
                                                                                    return;
                                                                                }
                                                                                // Owner and details — try multiple shapes
                                                                                const owner = vehicle.user || null;
                                                                                const ownerRole = (owner?.role || '').toLowerCase();
                                                                                // vehicle-level user details (via vehicles.user_details_id relation)
                                                                                const vUserDetails = vehicle.userDetails || vehicle.user_details || vehicle.userDetail || null;
                                                                                // user-level user details (via user->userDetails relation)
                                                                                const ownerUserDetails = owner?.userDetails || owner?.user_details || owner?.userDetail || null;

                                                                                // block autoload if owner is a student (role or student_no present)
                                                                                const isStudent = ownerRole === 'student' || !!(vUserDetails?.student_no) || !!(ownerUserDetails?.student_no);
                                                                                if (isStudent) {
                                                                                    setError('Autoload blocked: vehicle belongs to a student');
                                                                                    return;
                                                                                }

                                                                                // If the vehicle record lacks useful detail (no owner and no vehicle_type), treat as no record
                                                                                const hasOwner = !!owner;
                                                                                const hasType = !!(vehicle.vehicle_type);
                                                                                if (!hasOwner && !hasType) {
                                                                                    setError('No record found for that plate number');
                                                                                    return;
                                                                                }

                                                                                // Optional: ensure the vehicle is compatible with the selected slot (e.g., type match)
                                                                                const slotType = (selectedSlot?.allowed_vehicle_type || selectedSlot?.type || '').toLowerCase();
                                                                                const vehType = (vehicle.vehicle_type || '').toLowerCase();
                                                                                if (slotType && vehType && slotType !== 'any' && slotType !== vehType) {
                                                                                    setError(`Vehicle found but not compatible with this slot type (${slotType}).`);
                                                                                    return;
                                                                                }

                                                                                // prefer vehicle.userDetails, then owner.userDetails
                                                                                const chosenDetails = vUserDetails || ownerUserDetails || null;
                                                                                const facultyPosition = chosenDetails?.position || null;

                                                                                // populate form fields from vehicle and owner
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    vehicle_plate: vehicle.plate_number || plate,
                                                                                    vehicle_type: vehicle.vehicle_type || prev.vehicle_type,
                                                                                    vehicle_color: vehicle.vehicle_color || prev.vehicle_color,
                                                                                    name: owner?.name || prev.name,
                                                                                    contact: owner?.contact_number || prev.contact,
                                                                                    assignee_type: (ownerRole === 'faculty' || !!facultyPosition) ? 'faculty' : prev.assignee_type,
                                                                                    faculty_position: facultyPosition || prev.faculty_position
                                                                                }));
                                                                            } catch (e) {
                                                                                console.error('Plate lookup failed', e);
                                                                                setError('Plate lookup failed');
                                                                            } finally { setIsLoading(false); }
                                                                    }}>Lookup</button>
                                                                </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Start Time</label>
                        <input
                            type="datetime-local"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>End Time (Optional)</label>
                        <input
                            type="datetime-local"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Purpose of Visit</label>
                        <textarea
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            rows="3"
                            required
                        />
                    </div>

                    {error && <div className={styles.error} style={{ whiteSpace: 'pre-line' }}>{error}</div>}

                    <div className={styles.formActions}>
                        <button 
                            type="button" 
                            onClick={onHide}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={styles.submitButton}
                        >
                            {isLoading ? 'Assigning...' : 'Assign Space'}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};

export default ParkingAssignment;
