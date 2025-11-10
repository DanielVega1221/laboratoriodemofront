import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrder, getResults } from '../services/api';
import IconCheck from '../components/icons/IconCheck';
import IconPrint from '../components/icons/IconPrint';
import '../styles/Worklist.css';

const Worklist = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleToggleSample = async (orderId, currentValue) => {
    try {
      await updateOrder(orderId, { sampleTaken: !currentValue });
      loadOrders();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleStartOrder = async (orderId) => {
    try {
      await updateOrder(orderId, { status: 'in-process' });
      loadOrders();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleLoadResults = async (order) => {
    setSelectedOrder(order);
    setShowResultsModal(true);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'pending',
      'in-process': 'in-process',
      'completed': 'completed'
    };
    return statusMap[status] || status;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="worklist-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Hoja de Ruta</h1>
          <p className="page-description">Gestiona las órdenes, toma de muestras y carga de resultados</p>
        </div>
        <div className="filter-buttons">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={`btn ${filter === 'pending' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendientes
          </button>
          <button 
            className={`btn ${filter === 'in-process' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('in-process')}
          >
            En Proceso
          </button>
          <button 
            className={`btn ${filter === 'completed' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completadas
          </button>
        </div>
      </div>

      <div className="worklist-container">
        <table className="worklist-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Estudios</th>
              <th>Obra Social</th>
              <th>Autorizada</th>
              <th>Muestra</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div className="empty-state-message">
                    <p style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '16px', fontWeight: '600' }}>
                      {filter === 'all' ? 'No hay órdenes registradas' : `No hay órdenes ${filter === 'pending' ? 'pendientes' : filter === 'in-process' ? 'en proceso' : 'completadas'}`}
                    </p>
                    <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                      {filter === 'all' ? 'Las órdenes creadas aparecerán aquí' : 'Cambia el filtro para ver otras órdenes'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order._id}>
                  <td>
                    <div className="patient-info">
                      <div className="patient-name">
                        {order.patientId.firstName} {order.patientId.lastName}
                      </div>
                      <div className="patient-dni">DNI: {order.patientId.dni}</div>
                    </div>
                  </td>
                  <td>
                    <div className="studies-info">
                      {order.studies.map(s => s.displayName).join(', ')}
                    </div>
                  </td>
                  <td>{order.obraSocial || '-'}</td>
                  <td>
                    <span className={`badge ${order.authorized ? 'badge-success' : 'badge-error'}`}>
                      {order.authorized ? 'Autorizada' : 'No autorizada'}
                    </span>
                  </td>
                  <td>
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={order.sampleTaken || false}
                        onChange={() => handleToggleSample(order._id, order.sampleTaken)}
                        className="sample-checkbox"
                      />
                      {order.sampleTaken && <IconCheck />}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${order.status}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {order.status === 'pending' && (
                        <button 
                          className="btn btn-sm"
                          onClick={() => handleStartOrder(order._id)}
                        >
                          Iniciar
                        </button>
                      )}
                      {order.status !== 'completed' && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleLoadResults(order)}
                        >
                          Cargar Resultados
                        </button>
                      )}
                      {order.status === 'completed' && (
                        <button 
                          className="btn btn-sm"
                          onClick={() => navigate(`/report/${order._id}`)}
                        >
                          Ver Informe
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showResultsModal && selectedOrder && (
        <ResultsModal 
          order={selectedOrder} 
          onClose={() => {
            setShowResultsModal(false);
            setSelectedOrder(null);
            loadOrders();
          }} 
        />
      )}
    </div>
  );
};

const ResultsModal = ({ order, onClose }) => {
  const [results, setResults] = useState({});
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inicializar resultados vacíos para cada estudio
    const initialResults = {};
    order.studies.forEach(study => {
      const protocolId = study.protocolId?._id || study.protocolId;
      initialResults[protocolId] = {};
    });
    setResults(initialResults);
  }, [order]);

  const handleValueChange = (protocolId, fieldKey, value) => {
    setResults(prev => ({
      ...prev,
      [protocolId]: {
        ...prev[protocolId],
        [fieldKey]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { createResult } = await import('../services/api');
      
      // Crear un resultado por cada estudio
      for (const study of order.studies) {
        const protocolId = study.protocolId?._id || study.protocolId;
        await createResult({
          orderId: order._id,
          patientId: order.patientId._id,
          protocolId: protocolId,
          values: results[protocolId],
          comments
        });
      }

      // Actualizar el estado de la orden a completado
      await updateOrder(order._id, { status: 'completed' });

      alert('Resultados guardados exitosamente');
      onClose();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-results">
          <div>
            <h2>Cargar Resultados</h2>
            <p className="patient-info-header">
              <strong>Paciente:</strong> {order.patientId.firstName} {order.patientId.lastName} 
              <span className="dni-small">DNI: {order.patientId.dni}</span>
            </p>
            <p className="modal-subtitle">Ingresa los valores obtenidos en cada estudio. Los campos se guardarán al presionar "Guardar Resultados".</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {order.studies.map(study => {
            const protocol = study.protocolId;
            const protocolId = protocol?._id || study.protocolId;
            
            return (
              <div key={protocolId} className="protocol-section">
                <h3>{study.displayName} ({study.protocolCode})</h3>
                
                {protocol?.fields?.map(field => (
                  <div key={field.key} className="form-group">
                    <label>
                      {field.label} {field.unit && `(${field.unit})`}
                      {field.reference?.low !== undefined && field.reference?.high !== undefined && (
                        <small> Ref: {field.reference.low} - {field.reference.high}</small>
                      )}
                    </label>
                    
                    {field.type === 'number' && (
                      <input
                        type="number"
                        step="0.01"
                        value={results[protocolId]?.[field.key] || ''}
                        onChange={(e) => handleValueChange(protocolId, field.key, e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    )}
                    
                    {field.type === 'text' && (
                      <textarea
                        value={results[protocolId]?.[field.key] || ''}
                        onChange={(e) => handleValueChange(protocolId, field.key, e.target.value)}
                        rows="3"
                      />
                    )}
                    
                    {field.type === 'select' && (
                      <select
                        value={results[protocolId]?.[field.key] || ''}
                        onChange={(e) => handleValueChange(protocolId, field.key, e.target.value)}
                      >
                        <option value="">Seleccione...</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          <div className="form-group">
            <label>Comentarios Generales</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Resultados'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Worklist;
