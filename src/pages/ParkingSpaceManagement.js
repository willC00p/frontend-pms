import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import styles from './ParkingSpaceManagement.module.css';

const ParkingSpaceManagement = () => {
  const [layouts, setLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch layouts and drivers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await api.initCsrf();
        const [layoutsResponse, driversResponse] = await Promise.all([
          api.get('/parking-layouts'),
          api.get('/drivers')
        ]);
        
        setLayouts(layoutsResponse.data || layoutsResponse.data.data || []);
        setDrivers(driversResponse.data || driversResponse.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch space assignments when a layout is selected
  useEffect(() => {
    if (selectedLayout) {
      const fetchAssignments = async () => {
        try {
          await api.initCsrf();
          const response = await api.get(`/parking-layouts/${selectedLayout.id}/assignments`);
          setAssignments(response.data || response.data.data || {});
        } catch (error) {
          console.error('Error fetching assignments:', error);
          setError('Failed to load assignments');
        }
      };

      fetchAssignments();
    }
  }, [selectedLayout]);

  const handleAssignDriver = async (spaceId, driverId) => {
    try {
      await api.initCsrf();
      await api.post('/parking-assignments', {
        space_id: spaceId,
        driver_id: driverId
      });
      
      // Refresh assignments
      const response = await api.get(`/parking-layouts/${selectedLayout.id}/assignments`);
      setAssignments(response.data || response.data.data || {});
    } catch (error) {
      console.error('Error assigning driver:', error);
      setError('Failed to assign driver');
    }
  };

  const handleUnassignDriver = async (spaceId) => {
    try {
      await api.initCsrf();
      await api.delete(`/parking-assignments/${spaceId}`);
      
      // Refresh assignments
      const response = await api.get(`/parking-layouts/${selectedLayout.id}/assignments`);
      setAssignments(response.data || response.data.data || {});
    } catch (error) {
      console.error('Error unassigning driver:', error);
      setError('Failed to unassign driver');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Parking Layouts</h2>
        <div className={styles.layoutList}>
          {layouts.map(layout => (
            <div
              key={layout.id}
              className={`${styles.layoutItem} ${selectedLayout?.id === layout.id ? styles.selected : ''}`}
              onClick={() => setSelectedLayout(layout)}
            >
              <h3>{layout.name}</h3>
              <p>{layout.layout_data?.spaces?.length || 0} spaces</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {selectedLayout ? (
          <>
            <div className={styles.header}>
              <h1>{selectedLayout.name}</h1>
              <p>{selectedLayout.layout_data?.spaces?.length || 0} total spaces</p>
            </div>

            <div className={styles.spacesGrid}>
              {selectedLayout.layout_data?.spaces?.map(space => (
                <div key={space.id} className={styles.spaceCard}>
                  <h3>{space.label || `Space ${space.id}`}</h3>
                  <div className={styles.spaceInfo}>
                    <p>Status: {space.status}</p>
                    {assignments[space.id] ? (
                      <div className={styles.assignment}>
                        <p>Assigned to: {assignments[space.id].driver_name}</p>
                        <button
                          className={styles.unassignButton}
                          onClick={() => handleUnassignDriver(space.id)}
                        >
                          Unassign
                        </button>
                      </div>
                    ) : (
                      <div className={styles.assignmentForm}>
                        <select
                          className={styles.driverSelect}
                          onChange={(e) => handleAssignDriver(space.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Select Driver</option>
                          {drivers.map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.noSelection}>
            <h2>Select a layout to manage parking spaces</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingSpaceManagement;
