import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from '../pages/ParkingAssignmentPage.module.css';

const ParkingSpaceTooltip = ({ assignment, slot, anchorEl, onUnassign }) => {
    const [mounted, setMounted] = useState(false);
    const portalRef = useRef(document.createElement('div'));

    useEffect(() => {
        const el = portalRef.current;
        el.id = 'tooltip-portal';
        document.body.appendChild(el);
        setMounted(true);

        return () => {
            document.body.removeChild(el);
        };
    }, []);

    if (!mounted || !anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const tooltipStyle = {
        position: 'fixed',
        top: rect.top - 120,
        left: rect.left + (rect.width / 2),
        transform: 'translateX(-50%)',
        zIndex: 999999
    };

    return ReactDOM.createPortal(
        <div className={`${styles.tooltip} ${assignment?.is_reserved ? styles.reservedTooltip : ''}`} style={tooltipStyle}>
            <div className={styles.tooltipContent}>
                {assignment ? (
                    <>
                        <div className={styles.tooltipRow}>
                            <span className={styles.tooltipLabel}>Name:</span>
                            <span>{assignment.name}</span>
                        </div>
                        <div className={styles.tooltipRow}>
                            <span className={styles.tooltipLabel}>Contact:</span>
                            <span>{assignment.contact_number}</span>
                        </div>
                        <div className={styles.tooltipRow}>
                            <span className={styles.tooltipLabel}>Vehicle:</span>
                            <span>{assignment.vehicle_details}</span>
                        </div>
                        <div className={styles.tooltipRow}>
                            <span className={styles.tooltipLabel}>Type:</span>
                            <span>{assignment.assignee_type === 'faculty' ? 'Faculty' : 'Guest'}</span>
                        </div>
                        {assignment.assignee_type === 'faculty' && (
                            <div className={styles.tooltipRow}>
                                <span className={styles.tooltipLabel}>Faculty Position:</span>
                                <span>{assignment.faculty_position || '-'}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className={styles.tooltipRow}>
                            <span className={styles.tooltipLabel}>Status:</span>
                            <span>Available</span>
                        </div>
                        <div className={styles.tooltipRow}>
                            <span className={styles.tooltipLabel}>Space Type:</span>
                            <span>{slot.space_type ? slot.space_type.charAt(0).toUpperCase() + slot.space_type.slice(1) : 'Standard'}</span>
                        </div>
                        <div className={styles.tooltipRow}>
                            <span className={styles.tooltipLabel}>Space #:</span>
                            <span>{slot.name || slot.space_number || slot.slot_number}</span>
                        </div>
                    </>
                )}
            </div>
            {assignment && (
                <button
                    className={styles.unassignButton}
                    style={{ pointerEvents: 'auto', zIndex: 1000 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onUnassign(assignment.id);
                    }}
                >
                    Unassign
                </button>
            )}
        </div>,
        portalRef.current
    );
};

export default ParkingSpaceTooltip;
