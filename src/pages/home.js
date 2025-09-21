import React from 'react';
import {Outlet} from 'react-router-dom';
import 'assets/home.css'; 
import Sidebar from './sidebar';


function Home() {
  return (
    <div className="main-app-container home-container">
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default Home;