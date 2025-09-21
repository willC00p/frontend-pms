import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Image, Rect, Text, Group, Transformer } from 'react-konva';
import api from '../utils/api';
import styles from '../styles/ParkingLayout.module.css';

const ParkingManagement = () => {
  // Layout States
  const [layoutName, setLayoutName] = useState('Main Parking Layout');
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [mode, setMode] = useState('view');
  const [spaceColor, setSpaceColor] = useState('rgba(0, 255, 0, 0.3)');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const [showProperties, setShowProperties] = useState(true);

  // Editor States
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newSpaceStart, setNewSpaceStart] = useState(null);
  const stageRef = useRef(null);

  useEffect(() => {
    fetchLayout();
  }, []);

  const fetchLayout = async () => {
    try {
      await api.initCsrf();
      const response = await api.get('/parking-layout/main');
      const data = response.data;
      setLayoutName(data.name || 'Main Parking Layout');
      setParkingSpaces(data.spaces || []);
      if (data.backgroundImage) {
        setBackgroundImage(data.backgroundImage);
      }
    } catch (error) {
      console.error('Error fetching layout:', error);
    }
  };

  useEffect(() => {
    if (backgroundImage) {
      const loadImage = async () => {
        try {
          const img = new window.Image();
          img.src = backgroundImage;
          
          img.onload = () => {
            const maxWidth = window.innerWidth - (showProperties ? 364 : 64);
            const maxHeight = window.innerHeight - 64;
            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
            setImageSize({
              width: img.width * ratio,
              height: img.height * ratio
            });
            setImage(img);
          };
        } catch (error) {
          console.error('Error loading image:', error);
        }
      };
      
      loadImage();
    }
  }, [backgroundImage, showProperties]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      await api.initCsrf();
      const response = await api.post('/upload-background', formData);
      setBackgroundImage(response.data.url);
      
      // Save the layout with new background
      await saveLayout(response.data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
  window.showAlert('Failed to upload image. Please try again.', 'error');
    }
  };

  const saveLayout = async (newBackgroundImage = backgroundImage) => {
    try {
      const layoutData = {
        name: layoutName,
        spaces: parkingSpaces,
        backgroundImage: newBackgroundImage
      };
      await api.initCsrf();
      await api.put('/parking-layout/main', layoutData);
  window.showAlert('Layout saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving layout:', error);
  window.showAlert('Failed to save layout. Please try again.', 'error');
    }
  };

  const handleStageClick = (e) => {
    if (mode !== 'draw' || isDragging) return;
    
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const stagePoint = transform.point(point);

    if (!isDrawing) {
      setNewSpaceStart(stagePoint);
      setIsDrawing(true);
    } else {
      const newSpace = {
        id: Date.now(),
        x: Math.min(newSpaceStart.x, stagePoint.x),
        y: Math.min(newSpaceStart.y, stagePoint.y),
        width: Math.abs(stagePoint.x - newSpaceStart.x),
        height: Math.abs(stagePoint.y - newSpaceStart.y),
        status: 'available'
      };
      setParkingSpaces([...parkingSpaces, newSpace]);
      setNewSpaceStart(null);
      setIsDrawing(false);
    }
  };

  const handleSpaceClick = useCallback((space) => {
    if (mode === 'edit') {
      setSelectedSpace(space);
    }
  }, [mode]);

  const handleDragEnd = useCallback((e, id) => {
    const updates = parkingSpaces.map(space =>
      space.id === id ? { ...space, x: e.target.x(), y: e.target.y() } : space
    );
    setParkingSpaces(updates);
    setIsDragging(false);
  }, [parkingSpaces]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStagePosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const renderPropertyPanel = () => {
    if (!showProperties) return null;
    
    return (
      <div className={styles.propertyPanel}>
        <div className={styles.propertyGroup}>
          <h3>Layout Settings</h3>
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className={styles.inputField}
            placeholder="Layout Name"
          />
          <div style={{ marginTop: '1rem' }}>
            <label className={styles.fileInputLabel}>
              Upload Background Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
            </label>
          </div>
        </div>

        {selectedSpace && (
          <div className={styles.propertyGroup}>
            <h3>Space Properties</h3>
            <input
              type="text"
              value={selectedSpace.label || `Space ${selectedSpace.id}`}
              onChange={(e) => {
                const updatedSpaces = parkingSpaces.map(space =>
                  space.id === selectedSpace.id
                    ? { ...space, label: e.target.value }
                    : space
                );
                setParkingSpaces(updatedSpaces);
                setSelectedSpace({ ...selectedSpace, label: e.target.value });
              }}
              className={styles.inputField}
              placeholder="Space Label"
            />
            <select
              value={selectedSpace.status || 'available'}
              onChange={(e) => {
                const updatedSpaces = parkingSpaces.map(space =>
                  space.id === selectedSpace.id
                    ? { ...space, status: e.target.value }
                    : space
                );
                setParkingSpaces(updatedSpaces);
                setSelectedSpace({ ...selectedSpace, status: e.target.value });
              }}
              className={styles.inputField}
              style={{ marginTop: '0.5rem' }}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        )}

        <div className={styles.propertyGroup}>
          <h3>Parking Summary</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span>Total Spaces</span>
              <strong>{parkingSpaces.length}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Available</span>
              <strong>{parkingSpaces.filter(s => s.status === 'available').length}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Occupied</span>
              <strong>{parkingSpaces.filter(s => s.status === 'occupied').length}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Reserved</span>
              <strong>{parkingSpaces.filter(s => s.status === 'reserved').length}</strong>
            </div>
          </div>
        </div>

        <div className={styles.propertyGroup}>
          <h3>View Controls</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              className={styles.actionButton}
              onClick={() => setStageScale(scale => Math.min(scale + 0.1, 3))}
            >
              Zoom In
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setStageScale(scale => Math.max(scale - 0.1, 0.1))}
            >
              Zoom Out
            </button>
          </div>
          <button
            className={styles.actionButton}
            onClick={() => {
              setStageScale(1);
              setStagePosition({ x: 0, y: 0 });
            }}
          >
            Reset View
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.controls}>
          <h1 className={styles.pageTitle}>Parking Management</h1>
          <button 
            className={styles.actionButton}
            onClick={() => saveLayout()}
          >
            Save Changes
          </button>
        </div>
        <div className={styles.controls}>
          <button
            className={styles.actionButton}
            onClick={() => setShowProperties(!showProperties)}
          >
            {showProperties ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <button
          className={`${styles.toolButton} ${mode === 'view' ? styles.active : ''}`}
          onClick={() => setMode('view')}
          title="View Mode (H)"
        >
          👁
        </button>
        <button
          className={`${styles.toolButton} ${mode === 'draw' ? styles.active : ''}`}
          onClick={() => setMode('draw')}
          title="Draw Mode (D)"
        >
          ✏️
        </button>
        <button
          className={`${styles.toolButton} ${mode === 'edit' ? styles.active : ''}`}
          onClick={() => setMode('edit')}
          title="Edit Mode (V)"
        >
          🔧
        </button>
        {mode === 'edit' && selectedSpace && (
          <button
            className={styles.toolButton}
            onClick={() => {
              setParkingSpaces(spaces => spaces.filter(space => space.id !== selectedSpace.id));
              setSelectedSpace(null);
            }}
            title="Delete Space (Del)"
          >
            🗑️
          </button>
        )}
      </div>

      <div className={styles.canvas}>
        <Stage
          ref={stageRef}
          width={window.innerWidth - (showProperties ? 364 : 64)}
          height={window.innerHeight - 64}
          onWheel={handleWheel}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          draggable={mode === 'view' || (mode === 'edit' && !selectedSpace)}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onClick={handleStageClick}
          style={{ cursor: mode === 'draw' ? 'crosshair' : 'default' }}
        >
          <Layer>
            {image && (
              <Image
                image={image}
                width={imageSize.width}
                height={imageSize.height}
              />
            )}
            {isDrawing && newSpaceStart && (
              <Rect
                x={newSpaceStart.x}
                y={newSpaceStart.y}
                width={0}
                height={0}
                stroke="#3b82f6"
                strokeWidth={2}
                dash={[5, 5]}
              />
            )}
            {parkingSpaces.map(space => (
              <Group 
                key={space.id}
                onMouseEnter={() => {
                  if (mode === 'edit') {
                    document.body.style.cursor = 'move';
                  }
                }}
                onMouseLeave={() => {
                  document.body.style.cursor = 'default';
                }}
              >
                <Rect
                  x={space.x}
                  y={space.y}
                  width={space.width}
                  height={space.height}
                  fill={space.status === 'occupied' ? 'rgba(239, 68, 68, 0.3)' : 
                        space.status === 'reserved' ? 'rgba(245, 158, 11, 0.3)' :
                        space.status === 'disabled' ? 'rgba(107, 114, 128, 0.3)' :
                        spaceColor}
                  stroke={selectedSpace?.id === space.id ? '#3b82f6' : '#1e1e1e'}
                  strokeWidth={selectedSpace?.id === space.id ? 2 : 1}
                  draggable={mode === 'edit'}
                  onClick={() => handleSpaceClick(space)}
                  onDragEnd={(e) => handleDragEnd(e, space.id)}
                  cornerRadius={5}
                />
                <Text
                  x={space.x}
                  y={space.y + space.height / 2 - 7}
                  width={space.width}
                  align="center"
                  text={space.label || `Space ${space.id}`}
                  fontSize={14}
                  fill="#ffffff"
                  fontStyle="bold"
                />
                {selectedSpace?.id === space.id && mode === 'edit' && (
                  <Transformer
                    ref={node => {
                      if (node) {
                        node.getLayer().batchDraw();
                      }
                    }}
                    boundBoxFunc={(oldBox, newBox) => {
                      const minWidth = 50;
                      const minHeight = 50;
                      return {
                        ...newBox,
                        width: Math.max(minWidth, Math.min(newBox.width, 500)),
                        height: Math.max(minHeight, Math.min(newBox.height, 500))
                      };
                    }}
                    rotateEnabled={false}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    anchorFill="#FFFFFF"
                    anchorStroke="#3b82f6"
                    anchorSize={8}
                    borderStroke="#3b82f6"
                    borderDash={[6, 2]}
                  />
                )}
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>

      {renderPropertyPanel()}
    </div>
  );
};

export default ParkingManagement;
