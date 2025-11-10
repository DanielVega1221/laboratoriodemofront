import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient, getOrders } from '../services/api';
import '../styles/PatientDetail.css';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadPatient();
    loadOrders();
  }, [id]);

  const loadPatient = async () => {
    try {
      const data = await getPatient(id);
      setPatient(data);
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const allOrders = await getOrders();
      const patientOrders = allOrders.filter(o => o.patientId._id === id);
      setOrders(patientOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  if (!patient) return <div>Cargando...</div>;

  return (
    <div className="patient-detail">
      <button className="btn" onClick={() => navigate('/patients')}>← Volver</button>
      
      <div className="patient-card">
        <h1>{patient.firstName} {patient.lastName}</h1>
        <div className="patient-info">
          <div className="info-item">
            <label>DNI:</label>
            <span>{patient.dni}</span>
          </div>
          <div className="info-item">
            <label>Fecha de Nacimiento:</label>
            <span>{new Date(patient.dob).toLocaleDateString('es-AR')}</span>
          </div>
          <div className="info-item">
            <label>Teléfono:</label>
            <span>{patient.phone || '-'}</span>
          </div>
          <div className="info-item">
            <label>Obra Social:</label>
            <span>{patient.obraSocial || '-'}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/orders?patientId=${id}`)}>
          Nueva Orden
        </button>
      </div>

      <div className="orders-history">
        <h2>Historial de Órdenes</h2>
        {orders.length === 0 ? (
          <p>No hay órdenes registradas</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estudios</th>
                <th>Estado</th>
                <th>Autorizada</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{new Date(order.scheduledAt).toLocaleDateString('es-AR')}</td>
                  <td>{order.studies.map(s => s.displayName).join(', ')}</td>
                  <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                  <td><span className={`badge ${order.authorized ? 'badge-success' : 'badge-error'}`}>
                    {order.authorized ? 'Sí' : 'No'}
                  </span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
