import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import styles from '../styles/ParkingLayout.module.css';
import normalizeImageUrl from '../utils/imageUrl';

const ParkingLayouts = () => {
  const [layouts, setLayouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      await api.initCsrf();
      const response = await api.get('/parking-layouts');
      
      // Process the response to ensure we have all required data
      const layouts = response.data?.data || response.data || [];
      const processedLayouts = layouts.map(layout => ({
        ...layout,
        spaces: layout.parking_slots || [], // Map parking_slots to spaces for backward compatibility
        backgroundImage: layout.background_image, // Map the image field
        updatedAt: layout.updated_at // Map the update timestamp
      }));
      
      setLayouts(processedLayouts);
    } catch (error) {
      console.error('Error fetching layouts:', error);
    }
  };

  const handleDeleteLayout = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this layout?')) return;

    try {
      await api.initCsrf();
      await api.delete(`/parking-layouts/${id}`);
      // Update state directly instead of re-fetching
      setLayouts(prevLayouts => prevLayouts.filter(layout => layout.id !== id));
    } catch (error) {
      console.error('Error deleting layout:', error);
    }
  };

  const filteredLayouts = layouts.filter(layout =>
    layout && layout.name && layout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search layouts..."
            className={styles.searchBar}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className={styles.actionButton}
            onClick={() => navigate('/parking-layout/new')}
          >
            Create New Layout
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.layoutGrid}>
          {filteredLayouts.map(layout => (
            <div
              key={layout.id}
              className={styles.layoutCard}
              onClick={() => navigate(`/parking-layout/edit/${layout.id}`)}
            >
              <div className={styles.layoutPreview}>
                {layout.backgroundImage && (
                  <img src={normalizeImageUrl(layout.backgroundImage)} alt={layout.name} />
                )}
              </div>
              <div className={styles.layoutTitle}>{layout.name}</div>
              <div className={styles.layoutInfo}>
                <span>{layout.parking_slots?.length || layout.spaces?.length || 0} spaces</span>
                <span>Last modified: {new Date(layout.updated_at || layout.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.iconButton}
                  onClick={(e) => handleDeleteLayout(layout.id, e)}
                  title="Delete layout"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParkingLayouts;
