import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatients, createPatient } from '../services/api';
import '../styles/Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    dob: '',
    phone: '',
    obraSocial: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form data
    const validationErrors = {};
    if (!formData.firstName) validationErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName) validationErrors.lastName = 'El apellido es requerido';
    if (!formData.dni) validationErrors.dni = 'El DNI es requerido';
    if (!formData.dob) validationErrors.dob = 'La fecha de nacimiento es requerida';
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const newPatient = await createPatient(formData);
      setPatients([...patients, newPatient]);
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        dni: '',
        dob: '',
        phone: '',
        obraSocial: ''
      });
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="patients-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Pacientes</h1>
          <p className="page-description">Gestiona la información de todos los pacientes del laboratorio</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Agregar Paciente
        </button>
      </div>

      <div className="patients-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre Completo</th>
              <th>Fecha de Nacimiento</th>
              <th>Teléfono</th>
              <th>Obra Social</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div className="empty-state-message">
                    <p style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '16px', fontWeight: '600' }}>
                      No hay pacientes registrados
                    </p>
                    <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                      Comienza agregando tu primer paciente usando el botón "Agregar Paciente"
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              patients.map(patient => (
                <tr key={patient._id}>
                  <td>
                    <span className="dni-badge">{patient.dni}</span>
                  </td>
                  <td>
                    <div className="patient-name">
                      {patient.firstName} {patient.lastName}
                    </div>
                  </td>
                  <td>{new Date(patient.dob).toLocaleDateString('es-AR')}</td>
                  <td>{patient.phone || '-'}</td>
                  <td>{patient.obraSocial || '-'}</td>
                  <td>
                    <Link to={`/patient/${patient._id}`} className="btn btn-sm btn-primary">
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal patient-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Nuevo Paciente</h2>
                <p className="modal-subtitle">Completa la información del paciente. Los campos con * son obligatorios.</p>
              </div>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className={errors.firstName ? 'error' : ''}
                    placeholder="Ingrese el nombre"
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className={errors.lastName ? 'error' : ''}
                    placeholder="Ingrese el apellido"
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>DNI *</label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                    className={errors.dni ? 'error' : ''}
                    placeholder="12345678"
                  />
                  {errors.dni && <span className="error-text">{errors.dni}</span>}
                </div>

                <div className="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className={errors.dob ? 'error' : ''}
                  />
                  {errors.dob && <span className="error-text">{errors.dob}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Número de teléfono"
                  />
                </div>

                <div className="form-group">
                  <label>Obra Social</label>
                  <input
                    type="text"
                    value={formData.obraSocial}
                    onChange={(e) => setFormData({...formData, obraSocial: e.target.value})}
                    placeholder="Ej: OSDE, Swiss Medical..."
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;