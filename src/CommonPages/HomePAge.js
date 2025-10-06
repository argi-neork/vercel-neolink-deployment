import React, { useState } from 'react';
import {
    Users,
    FileText,
    UserCheck,
    LogOut,
    Menu,
    Camera,
    Settings,
    AlertTriangle   
} from 'lucide-react';
import EmployeeList from './EmployeeList';
import EnrollmentPage from './EnrollmentPage';
import ReportPage from './ReportPage';
import CameraPage from './CameraPage';
import SettingPage from './SettingPage';
import IntrudeReport from './IntrudeReport';
import avathar from '../images/avatar.png';

// Main App Component
const HomePage = () => {
    const [activeComponent, setActiveComponent] = useState('intrudr');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const menuItems = [
        { id: 'intrudr', label: 'Intruder Report', icon: AlertTriangle },
        { id: 'employees', label: 'Employee List', icon: Users },
        { id: 'enrollment', label: 'Enroll Employees', icon: UserCheck },
        { id: 'camera', label: 'Camera Integration', icon: Camera },
        { id: 'report', label: 'Report Section', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings }

    ];

    const renderContent = () => {
        switch (activeComponent) {
            case 'intrudr':
                return <IntrudeReport />;
            case 'employees':
                return <EmployeeList />;
            case 'enrollment':
                return <EnrollmentPage />;
            case 'camera':
                return <CameraPage />;
            case 'report':
                return <ReportPage />;
            case 'settings':
                return <SettingPage />;
            default:
                return <IntrudeReport />;
        }
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <div
                className="d-flex flex-column text-white"
                style={{
                    width: sidebarCollapsed ? '70px' : '250px',
                    minHeight: '100vh',
                    backgroundColor: "#113B4A",
                    transition: 'width 0.3s ease'
                }}
            >
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-sm">
                        {sidebarCollapsed ? 'NL' : 'NeoLink System'}
                    </h5>
                    <button
                        className="btn btn-link text-white p-0 border-0 ms-2"
                        onClick={toggleSidebar}
                        style={{ minWidth: 'auto' }}
                    >
                        <Menu size={15} />
                    </button>
                </div>


                {/* Scrollable Menu Items */}
                <div className="flex-grow-1 overflow-auto">
                    <nav className="nav flex-column p-3">
                        {menuItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    className={`nav-link text-white border-0 bg-transparent text-start p-2 mb-2 rounded d-flex align-items-center ${activeComponent === item.id ? 'bg-secondary' : ''
                                        }`}
                                    onClick={() => setActiveComponent(item.id)}
                                    style={{
                                        transition: 'background-color 0.2s ease',
                                        minHeight: '40px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeComponent !== item.id) {
                                            e.target.style.backgroundColor = '#212529';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeComponent !== item.id) {
                                            e.target.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <Icon size={18} className={sidebarCollapsed ? 'mx-auto' : 'me-2'} />
                                    {!sidebarCollapsed && item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout Button - Fixed at Bottom */}
                <div className="p-3 mt-auto">
                    <button
                        className="nav-link text-white border-0 bg-transparent text-start p-2 rounded d-flex align-items-center w-100"
                        style={{
                            transition: 'background-color 0.2s ease',
                            minHeight: '40px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#212529';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <LogOut size={18} className={sidebarCollapsed ? 'mx-auto' : 'me-2'} />
                        {!sidebarCollapsed && 'Logout'}
                    </button>
                </div> 
            </div>

            {/* Main Content */}
            <div className="flex-grow-1">
                {/* Header */}
                <header className="text-white p-3" style={{ backgroundColor: "#113B4A" }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">
                            {menuItems.find(item => item.id === activeComponent)?.label || 'Dashboard'}
                        </h4>
                        <div className="d-flex align-items-center">
                            <a
                                className="nav-link d-flex align-items-center"
                                id="navbarDropdown"
                                href=""
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <img
                                    src={avathar}
                                    alt="profile-img"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        border: '2px solid white'
                                    }}
                                />
                            </a>
                        </div>
                    </div>
                </header>
                {/* Page Content */}
                <main className="p-4 bg-light" style={{ minHeight: 'calc(100vh - 80px)' }}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default HomePage;