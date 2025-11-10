import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, getResults } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import IconPrint from '../components/icons/IconPrint';
import '../styles/Report.css';

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [orderData, resultsData] = await Promise.all([
        getOrder(id),
        getResults({ orderId: id })
      ]);
      setOrder(orderData);
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('LABORATORIO CLÍNICO', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Informe de Resultados', 105, 28, { align: 'center' });
    
    // Línea separadora
    doc.line(20, 32, 190, 32);
    
    // Información del paciente
    doc.setFontSize(10);
    doc.text(`Paciente: ${order.patientId.firstName} ${order.patientId.lastName}`, 20, 40);
    doc.text(`DNI: ${order.patientId.dni}`, 20, 46);
    doc.text(`Fecha: ${new Date(order.scheduledAt).toLocaleDateString('es-AR')}`, 20, 52);
    doc.text(`Obra Social: ${order.obraSocial || 'N/A'}`, 20, 58);
    
    let yPos = 70;

    // Resultados por estudio
    results.forEach((result, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const protocol = result.protocolId;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${protocol.name} (${protocol.code})`, 20, yPos);
      yPos += 8;

      // Tabla de resultados
      const tableData = protocol.fields
        .filter(field => field.key !== 'observaciones')
        .map(field => {
          const value = result.values[field.key];
          let displayValue = value !== undefined ? value : '-';
          
          // Verificar si está fuera de rango
          let status = '';
          if (field.reference?.low !== undefined && field.reference?.high !== undefined) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              if (numValue < field.reference.low) status = '↓';
              else if (numValue > field.reference.high) status = '↑';
            }
          }

          return [
            field.label,
            displayValue + (field.unit ? ` ${field.unit}` : ''),
            field.reference?.low && field.reference?.high 
              ? `${field.reference.low} - ${field.reference.high}` 
              : '-',
            status
          ];
        });

      doc.autoTable({
        startY: yPos,
        head: [['Parámetro', 'Valor', 'Rango de Referencia', '']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [11, 111, 242] },
        margin: { left: 20, right: 20 }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Observaciones
      if (result.values.observaciones) {
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text('Observaciones:', 20, yPos);
        yPos += 6;
        const splitText = doc.splitTextToSize(result.values.observaciones, 170);
        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 5 + 10;
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }

    return doc;
  };

  const handleDownloadPDF = () => {
    const doc = generatePDF();
    doc.save(`informe-${order.patientId.dni}-${new Date().getTime()}.pdf`);
  };

  const handlePrintPDF = () => {
    const doc = generatePDF();
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  if (loading) return <div>Cargando...</div>;
  if (!order) return <div>Orden no encontrada</div>;

  return (
    <div className="report-page">
      <div className="report-header">
        <button className="btn" onClick={() => navigate('/worklist')}>← Volver</button>
        <div className="report-actions">
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            Descargar PDF
          </button>
          <button className="btn" onClick={handlePrintPDF}>
            <IconPrint /> Imprimir
          </button>
        </div>
      </div>

      <div className="report-preview">
        <div className="report-content">
          <div className="report-title">
            <h1>LABORATORIO CLÍNICO</h1>
            <h2>Informe de Resultados</h2>
          </div>

          <div className="patient-info-section">
            <h3>Información del Paciente</h3>
            <div className="info-grid">
              <div><strong>Paciente:</strong> {order.patientId.firstName} {order.patientId.lastName}</div>
              <div><strong>DNI:</strong> {order.patientId.dni}</div>
              <div><strong>Fecha:</strong> {new Date(order.scheduledAt).toLocaleDateString('es-AR')}</div>
              <div><strong>Obra Social:</strong> {order.obraSocial || 'N/A'}</div>
            </div>
          </div>

          {results.map((result, index) => (
            <div key={index} className="result-section">
              <h3>{result.protocolId.name} ({result.protocolId.code})</h3>
              
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Parámetro</th>
                    <th>Valor</th>
                    <th>Rango de Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {result.protocolId.fields
                    .filter(field => field.key !== 'observaciones')
                    .map(field => {
                      const value = result.values[field.key];
                      let outOfRange = false;
                      
                      if (field.reference?.low !== undefined && field.reference?.high !== undefined) {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          outOfRange = numValue < field.reference.low || numValue > field.reference.high;
                        }
                      }

                      return (
                        <tr key={field.key} className={outOfRange ? 'out-of-range' : ''}>
                          <td>{field.label}</td>
                          <td>{value !== undefined ? value : '-'} {field.unit}</td>
                          <td>
                            {field.reference?.low && field.reference?.high 
                              ? `${field.reference.low} - ${field.reference.high}` 
                              : '-'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {result.values.observaciones && (
                <div className="observations">
                  <strong>Observaciones:</strong>
                  <p>{result.values.observaciones}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Report;
