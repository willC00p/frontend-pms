import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from "pages/Login";
import Dashboard from 'pages/dashboard';
import Home from 'pages/home';
import Parkingspaces from 'pages/parkingspaces';
import UserList from 'pages/userlist';
import EditParking from 'pages/editparkingspace';
import ForgotPassword from 'pages/forgotpassword'; 
import Messages from 'pages/messages';
import PendingList from 'pages/pendinglist';
import ManageParkingLayout from 'pages/ManageParkingLayout';
import ParkingAssignmentPage from 'pages/ParkingAssignmentPage';
import EditParkingLayout from 'pages/EditParkingLayout';
import Settings from 'pages/Settings';

const MainRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/home" element={<Home />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="parkingspaces" element={<Parkingspaces />} />
                    <Route path="parking-assignment/:layoutId" element={<ParkingAssignmentPage />} />
                    <Route path="manage-parking-layout" element={<ManageParkingLayout />} />
                    <Route path="edit-parking-layout/:id" element={<EditParkingLayout />} />
                    <Route path="userlist" element={<UserList />} />
                    <Route path="editparkingspace" element={<EditParking />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="pendinglist" element={<PendingList />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default MainRoutes;
