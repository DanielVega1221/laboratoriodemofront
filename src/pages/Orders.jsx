import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPatients, getProtocols, createOrder } from '../services/api';
import IconAdd from '../components/icons/IconAdd';
import '../styles/Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedPatientId = searchParams.get('patientId');

  const [patients, setPatients] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedStudies, setSelectedStudies] = useState([]);
  const [obraSocial, setObraSocial] = useState('');
  const [authNumber, setAuthNumber] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');

  useEffect(() => {
    loadPatients();
    loadProtocols();
  }, []);

  useEffect(() => {
    if (preSelectedPatientId) {
      setSelectedPatient(preSelectedPatientId);
      const patient = patients.find(p => p._id === preSelectedPatientId);
      if (patient?.obraSocial) {
        setObraSocial(patient.obraSocial);
      }
    }
  }, [preSelectedPatientId, patients]);

  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadProtocols = async () => {
    try {
      const data = await getProtocols();
      setProtocols(data);
    } catch (error) {
      console.error('Error loading protocols:', error);
    }
  };

  const handleAddStudy = (protocolId) => {
    const protocol = protocols.find(p => p._id === protocolId);
    if (protocol && !selectedStudies.find(s => s.protocolId === protocolId)) {
      setSelectedStudies([...selectedStudies, {
        protocolId: protocol._id,
        protocolCode: protocol.code,
        displayName: protocol.name
      }]);
    }
  };

  const handleRemoveStudy = (protocolId) => {
    setSelectedStudies(selectedStudies.filter(s => s.protocolId !== protocolId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      alert('Debe seleccionar un paciente');
      return;
    }
    
    if (selectedStudies.length === 0) {
      alert('Debe agregar al menos un estudio');
      return;
    }

    try {
      await createOrder({
        patientId: selectedPatient,
        studies: selectedStudies,
        obraSocial,
        authNumber,
        authorized,
        scheduledAt: new Date()
      });
      
      alert('Orden creada exitosamente');
      navigate('/worklist');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.dni.includes(searchPatient) ||
    p.firstName.toLowerCase().includes(searchPatient.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchPatient.toLowerCase())
  );

  return (
    <div className="orders-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Nueva Orden</h1>
          <p className="page-description">Crea una nueva orden de laboratorio para un paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-section">
          <div className="section-header">
            <span className="section-number">1</span>
            <div>
              <h2>Seleccionar Paciente</h2>
              <p className="section-description">Busca y selecciona el paciente para esta orden</p>
            </div>
          </div>
          <div className="form-group">
            <label>Buscar Paciente</label>
            <input
              type="text"
              placeholder="Buscar por DNI o nombre..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="form-group">
            <label>Paciente *</label>
            <select
              value={selectedPatient}
              onChange={(e) => {
                setSelectedPatient(e.target.value);
                const patient = patients.find(p => p._id === e.target.value);
                if (patient?.obraSocial) setObraSocial(patient.obraSocial);
              }}
              required
            >
              <option value="">Seleccione un paciente</option>
              {filteredPatients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.dni} - {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <span className="section-number">2</span>
            <div>
              <h2>Autorización</h2>
              <p className="section-description">Información sobre la cobertura y autorización de la obra social</p>
            </div>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
              />
              <span>Obra social autorizada</span>
            </label>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Obra Social</label>
              <input
                type="text"
                value={obraSocial}
                onChange={(e) => setObraSocial(e.target.value)}
                placeholder="Ej: OSDE, Swiss Medical..."
              />
            </div>
            <div className="form-group">
              <label>Número de Autorización</label>
              <input
                type="text"
                value={authNumber}
                onChange={(e) => setAuthNumber(e.target.value)}
                placeholder="Número de autorización"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <span className="section-number">3</span>
            <div>
              <h2>Estudios</h2>
              <p className="section-description">Agrega los estudios que se realizarán en esta orden</p>
            </div>
          </div>
          <div className="form-group">
            <label>Agregar Estudio</label>
            <div className="select-with-icon">
              <select onChange={(e) => { handleAddStudy(e.target.value); e.target.value = ''; }} value="">
                <option value="">Seleccionar estudio...</option>
                {protocols.map(protocol => (
                  <option key={protocol._id} value={protocol._id}>
                    {protocol.code} - {protocol.name}
                  </option>
                ))}
              </select>
              <IconAdd />
            </div>
          </div>

          <div className="selected-studies">
            {selectedStudies.length === 0 ? (
              <div className="empty-state">
                <p>📋 No hay estudios agregados</p>
                <small>Selecciona estudios del menú desplegable de arriba. Puedes agregar múltiples estudios a la orden.</small>
              </div>
            ) : (
              <div className="studies-list">
                {selectedStudies.map(study => (
                  <div key={study.protocolId} className="study-item">
                    <div className="study-info">
                      <span className="study-code">{study.protocolCode}</span>
                      <span className="study-name">{study.displayName}</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-remove"
                      onClick={() => handleRemoveStudy(study.protocolId)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/worklist')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Crear Orden
          </button>
        </div>
      </form>
    </div>
  );
};

export default Orders;
