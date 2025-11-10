import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import IconDashboard from './icons/IconDashboard';
import IconPatients from './icons/IconPatients';
import IconOrders from './icons/IconOrders';
import IconWorklist from './icons/IconWorklist';
import IconProtocols from './icons/IconProtocols';
import IconLogout from './icons/IconLogout';
import '../styles/Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Lab System</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <IconDashboard /> Dashboard
          </NavLink>
          <NavLink to="/patients" className={({ isActive }) => isActive ? 'active' : ''}>
            <IconPatients /> Pacientes
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>
            <IconOrders /> Órdenes
          </NavLink>
          <NavLink to="/worklist" className={({ isActive }) => isActive ? 'active' : ''}>
            <IconWorklist /> Hoja de Ruta
          </NavLink>
          <NavLink to="/protocols" className={({ isActive }) => isActive ? 'active' : ''}>
            <IconProtocols /> Protocolos
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <IconLogout /> Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-user">
            <span>{user?.username}</span>
            <span className="badge">{user?.role}</span>
          </div>
          <div className="topbar-date">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
