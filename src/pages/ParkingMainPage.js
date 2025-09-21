import React, { useState } from 'react';
import styles from '../styles/ParkingMain.module.css';

const ParkingMainPage = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [layouts, setLayouts] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(null);

  const handleNewLayout = () => {
    setCurrentLayout(null);
    setShowEditor(true);
  };

  const handleEditLayout = (layout) => {
    setCurrentLayout(layout);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setCurrentLayout(null);
    // Refresh layouts after editing
    fetchLayouts();
  };

  return (
    <div className={styles.mainContainer}>
      {!showEditor ? (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Parking Layout Management</h1>
            <button 
              className={styles.actionButton}
              onClick={handleNewLayout}
            >
              Create New Layout
            </button>
          </div>
          
          <div className={styles.content}>
            <div className={styles.layoutGrid}>
              {layouts.map(layout => (
                <div 
                  key={layout.id} 
                  className={styles.layoutCard}
                  onClick={() => handleEditLayout(layout)}
                >
                  <div className={styles.layoutPreview}>
                    {layout.backgroundImage && (
                      <img 
                        src={layout.backgroundImage} 
                        alt={layout.name}
                        className={styles.previewImage} 
                      />
                    )}
                  </div>
                  <div className={styles.layoutInfo}>
                    <h3>{layout.name}</h3>
                    <p>{layout.spaces?.length || 0} spaces</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.editorOverlay}>
          <div className={styles.editorModal}>
            <ParkingLayoutEditor
              layout={currentLayout}
              onClose={handleCloseEditor}
              onSave={() => {
                handleCloseEditor();
                // Refresh layouts after save
                fetchLayouts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMainPage;
