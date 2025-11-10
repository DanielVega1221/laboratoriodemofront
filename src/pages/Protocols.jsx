import React, { useState, useEffect } from 'react';
import { getProtocols, createProtocol, updateProtocol, deleteProtocol } from '../services/api';
import IconAdd from '../components/icons/IconAdd';
import '../styles/Protocols.css';

const Protocols = () => {
  const [protocols, setProtocols] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    fields: []
  });

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    try {
      const data = await getProtocols();
      setProtocols(data);
    } catch (error) {
      console.error('Error loading protocols:', error);
    }
  };

  const handleEdit = (protocol) => {
    setEditingProtocol(protocol);
    setFormData({
      name: protocol.name,
      code: protocol.code,
      fields: [...protocol.fields]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este protocolo?')) return;
    
    try {
      await deleteProtocol(id);
      loadProtocols();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, {
        key: '',
        label: '',
        unit: '',
        type: 'text',
        reference: { low: '', high: '' }
      }]
    });
  };

  const handleRemoveField = (index) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...formData.fields];
    if (field.includes('reference.')) {
      const refField = field.split('.')[1];
      newFields[index].reference[refField] = value;
    } else {
      newFields[index][field] = value;
    }
    setFormData({ ...formData, fields: newFields });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProtocol) {
        await updateProtocol(editingProtocol._id, formData);
      } else {
        await createProtocol(formData);
      }
      
      setShowModal(false);
      setEditingProtocol(null);
      setFormData({ name: '', code: '', fields: [] });
      loadProtocols();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProtocol(null);
    setFormData({ name: '', code: '', fields: [] });
  };

  return (
    <div className="protocols-page">
      <div className="protocols-header">
        <div>
          <h1>Protocolos de Estudios</h1>
          <p className="page-description">
            Define las plantillas de resultados para cada tipo de estudio, incluyendo los campos necesarios y sus valores de referencia
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <IconAdd /> Nuevo Protocolo
        </button>
      </div>

      {protocols.length === 0 ? (
        <div className="empty-state">
          <p>📋 No hay protocolos configurados</p>
          <small>Crea tu primer protocolo para definir los campos de resultados de tus estudios</small>
        </div>
      ) : (
        <div className="protocols-grid">
          {protocols.map(protocol => (
            <div key={protocol._id} className="protocol-card">
              <div className="protocol-header">
                <h3>{protocol.name}</h3>
                <span className="protocol-code">{protocol.code}</span>
              </div>
              <p className="protocol-fields">
                {protocol.fields.length} {protocol.fields.length === 1 ? 'campo' : 'campos'} configurados
              </p>
              <div className="protocol-actions">
                <button className="btn btn-sm" onClick={() => handleEdit(protocol)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(protocol._id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingProtocol ? 'Editar Protocolo' : 'Nuevo Protocolo'}</h2>
                <p className="modal-subtitle">
                  {editingProtocol 
                    ? 'Modifica la información y campos del protocolo' 
                    : 'Define el nombre, código y campos que tendrá este tipo de estudio'}
                </p>
              </div>
              <button className="btn-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="section-number">1</div>
              <h3 className="section-title">Información General</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Protocolo *</label>
                  <input
                    type="text"
                    placeholder="Ej: Hemograma Completo"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Código *</label>
                  <input
                    type="text"
                    placeholder="Ej: HEMO"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
              </div>

              <div className="fields-section">
                <div className="section-number">2</div>
                <div className="fields-header">
                  <div>
                    <h3 className="section-title">Campos del Protocolo</h3>
                    <p className="section-subtitle">Agrega los campos que se cargarán al ingresar resultados</p>
                  </div>
                  <button type="button" className="btn btn-sm" onClick={handleAddField}>
                    <IconAdd /> Agregar Campo
                  </button>
                </div>

                {formData.fields.length === 0 ? (
                  <div className="empty-fields">
                    <p>Aún no hay campos agregados</p>
                    <small>Usa el botón "Agregar Campo" para comenzar</small>
                  </div>
                ) : (
                  formData.fields.map((field, index) => (
                    <div key={index} className="field-item">
                      <div className="field-number">{index + 1}</div>
                      <div className="field-content">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Key (identificador) *</label>
                            <input
                              type="text"
                              placeholder="Ej: hemoglobin"
                              value={field.key}
                              onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Etiqueta (nombre visible) *</label>
                            <input
                              type="text"
                              placeholder="Ej: Hemoglobina"
                              value={field.label}
                              onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Unidad</label>
                            <input
                              type="text"
                              placeholder="Ej: g/dL"
                              value={field.unit}
                              onChange={(e) => handleFieldChange(index, 'unit', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Tipo de Dato *</label>
                            <select
                              value={field.type}
                              onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                            >
                              <option value="text">Texto</option>
                              <option value="number">Número</option>
                              <option value="select">Selección</option>
                            </select>
                          </div>
                        </div>

                        {field.type === 'number' && (
                          <div className="reference-section">
                            <label className="reference-label">Valores de Referencia</label>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Mínimo</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={field.reference?.low || ''}
                                  onChange={(e) => handleFieldChange(index, 'reference.low', parseFloat(e.target.value))}
                                />
                              </div>
                              <div className="form-group">
                                <label>Máximo</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={field.reference?.high || ''}
                                  onChange={(e) => handleFieldChange(index, 'reference.high', parseFloat(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <button 
                          type="button" 
                          className="btn-remove-field"
                          onClick={() => handleRemoveField(index)}
                        >
                          Quitar Campo
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editingProtocol ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Protocols;
