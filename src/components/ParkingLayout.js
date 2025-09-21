import React from 'react';
import './ParkingLayout.css';
import normalizeImageUrl from '../utils/imageUrl';

const ParkingLayout = ({ layout, onSlotClick, onDuplicateSlot, isThumbnail = false }) => {
    if (!layout || !layout.parking_slots) {
        return null;
    }

    const containerClassName = `parking-layout-container ${isThumbnail ? 'thumbnail-view' : 'full-view'}`;

    const handleSlotClick = (e, slot) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSlotClick) {
            onSlotClick(e, slot);
        }
    };

    const handleDuplicateSlot = (e, slot) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDuplicateSlot) {
            // Create a new slot with the same dimensions but slightly offset
            const newSlot = {
                ...slot,
                x_coordinate: slot.x_coordinate + 10,
                y_coordinate: slot.y_coordinate + 10,
                id: undefined // Let the backend generate a new ID
            };
            onDuplicateSlot(newSlot);
        }
    };

    return (
        <div className={containerClassName}>
            {layout.background_image && (
                <img
                    src={normalizeImageUrl(layout.background_image)}
                    alt={layout.name}
                    className="layout-background"
                />
            )}
            <div className="parking-slots-overlay">
                {layout.parking_slots.map((slot) => {
                    const style = {
                        position: 'absolute',
                        left: `${slot.x_coordinate}px`,
                        top: `${slot.y_coordinate}px`,
                        width: `${slot.width}px`,
                        height: `${slot.height}px`,
                        transform: `rotate(${slot.rotation || 0}deg)`
                    };

                    return (
                        <div
                            key={slot.id}
                            className={`parking-slot ${slot.space_status || 'available'}`}
                            style={style}
                        >
                            <div onClick={(e) => handleSlotClick(e, slot)}>
                                <div style={{ transform: `rotate(${-(slot.rotation || 0)}deg)` }}>
                                    <span className="slot-number">{slot.space_number}</span>
                                    <span className="slot-status">{slot.space_status}</span>
                                </div>
                            </div>
                            {!isThumbnail && (
                                <button
                                    className="duplicate-button"
                                    onClick={(e) => handleDuplicateSlot(e, slot)}
                                    title="Duplicate slot"
                                >
                                    <span>+</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ParkingLayout;
