import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatients, getOrders } from '../services/api';
import IconPatients from '../components/icons/IconPatients';
import IconOrders from '../components/icons/IconOrders';
import IconAdd from '../components/icons/IconAdd';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayOrders: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [patients, orders] = await Promise.all([
        getPatients(),
        getOrders()
      ]);

      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => 
        new Date(o.scheduledAt).toDateString() === today
      ).length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setStats({
        totalPatients: patients.length,
        todayOrders,
        pendingOrders
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="page-description">Vista general del laboratorio y estadísticas principales</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <IconPatients />
          </div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>Total Pacientes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <IconOrders />
          </div>
          <div className="stat-content">
            <h3>{stats.todayOrders}</h3>
            <p>Órdenes Hoy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <IconOrders />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingOrders}</h3>
            <p>Órdenes Pendientes</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Accesos Rápidos</h2>
        <p className="section-subtitle">Accede directamente a las funciones más utilizadas</p>
        <div className="actions-grid">
          <Link to="/patients" className="action-card">
            <IconAdd />
            <div>
              <span className="action-title">Nuevo Paciente</span>
              <span className="action-description">Registrar un nuevo paciente</span>
            </div>
          </Link>
          <Link to="/orders" className="action-card">
            <IconAdd />
            <div>
              <span className="action-title">Nueva Orden</span>
              <span className="action-description">Crear orden de laboratorio</span>
            </div>
          </Link>
          <Link to="/worklist" className="action-card">
            <IconOrders />
            <div>
              <span className="action-title">Ver Hoja de Ruta</span>
              <span className="action-description">Gestionar órdenes y resultados</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
