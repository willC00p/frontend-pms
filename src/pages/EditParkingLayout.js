import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from 'utils/api';
import ParkingLayoutEditor from '../components/ParkingLayoutEditor';
import normalizeImageUrl from '../utils/imageUrl';
import EditorToolbar from '../components/EditorToolbar';
import styles from './EditParkingLayout.module.css';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const EditParkingLayout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [layout, setLayout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('select');
    const [spaceColor, setSpaceColor] = useState('#10B981');
    const [lineColor, setLineColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [textSize, setTextSize] = useState(14);
    const [textColor, setTextColor] = useState('#000000');
    const [textInput, setTextInput] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [textRotation, setTextRotation] = useState(0);

    useEffect(() => {
        fetchLayout();
    }, [id]);

    const fetchLayout = async () => {
        try {
            await api.initCsrf();
            const response = await api.get(`/parking-layouts/${id}`);
            setLayout(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching layout:', error);
            setError(error.response?.data?.message || 'Failed to load layout');
            setLoading(false);
        }
    };

    const handleSave = async (layoutData) => {
        try {
            setLoading(true);
            await api.initCsrf();
            // Ensure every parking slot has layout_id set
            const fixedLayoutData = {
                ...layoutData,
                parking_slots: (layoutData.parking_slots || []).map(slot => ({
                    ...slot,
                    layout_id: id
                }))
            };
            const updateData = {
                name: layout.name,
                layout_data: fixedLayoutData
            };
            await api.put(`/parking-layouts/${id}`, updateData);

            setHasUnsavedChanges(false);
            window.showAlert('Layout saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving layout:', error);
            window.showAlert('Failed to save layout: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUndoStateChange = (canUndo) => {
        setHasUnsavedChanges(canUndo);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <p>Loading layout...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button 
                    className={styles.backButton}
                    onClick={() => navigate('/home/parkingspaces')}
                >
                    Back to Layouts
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={() => {
                        if (hasUnsavedChanges) {
                            const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                            if (!confirm) return;
                        }
                        navigate('/home/parkingspaces');
                    }}
                >
                    <FaArrowLeft /> Back
                </button>
                <h1 className={styles.title}>Edit Layout: {layout?.name}</h1>
            </div>

            <div className={styles.editorContainer}>
                <div className={styles.toolbar}>
                    <EditorToolbar
                        mode={mode}
                        setMode={setMode}
                        spaceColor={spaceColor}
                        setSpaceColor={setSpaceColor}
                        lineColor={lineColor}
                        setLineColor={setLineColor}
                        lineWidth={lineWidth}
                        setLineWidth={setLineWidth}
                        textSize={textSize}
                        setTextSize={setTextSize}
                        textColor={textColor}
                        setTextColor={setTextColor}
                        textInput={textInput}
                        onTextInputChange={setTextInput}
                    />
                    <div style={{ marginTop: 8 }}>
                        <label>Text Rotation: </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={textRotation}
                            onChange={e => setTextRotation(Number(e.target.value))}
                        />
                        <span style={{ marginLeft: 8 }}>{textRotation}&deg;</span>
                    </div>
                </div>

                <div className={styles.canvasContainer}>
                    {layout && (
                        <ParkingLayoutEditor
                            layoutId={id}
                            backgroundImage={normalizeImageUrl(layout.background_image)}
                            initialLayoutData={layout.layout_data}
                            mode={mode}
                            spaceColor={spaceColor}
                            lineColor={lineColor}
                            lineWidth={lineWidth}
                            textSize={textSize}
                            textColor={textColor}
                            textInput={textInput}
                            onTextInputChange={setTextInput}
                            onSave={handleSave}
                            onUndoStateChange={handleUndoStateChange}
                            textRotation={textRotation}
                            setTextRotation={setTextRotation}
                        />
                    )}
                </div>
            </div>

            <div className={styles.footer}>
                {/* Save button removed since saving is handled by the editor component */}
            </div>
        </div>
    );
};

export default EditParkingLayout;
