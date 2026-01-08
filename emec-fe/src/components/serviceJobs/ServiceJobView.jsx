import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceJobService } from '../../services/serviceJobService';

const ServiceJobView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceJob, setServiceJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceJob();
  }, [id]);

  const loadServiceJob = async () => {
    try {
      const response = await serviceJobService.getById(id);
      setServiceJob(response.data.data);
    } catch (error) {
      toast.error('Failed to load service job');
      navigate('/service-jobs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!serviceJob) return <div>Service job not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Service Job Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/service-jobs')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px', fontSize: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <strong style={{ fontSize: '17px' }}>Job Number:</strong> <span style={{ fontSize: '16px' }}>{serviceJob.job_number}</span>
          </div>
          <div>
            <strong style={{ fontSize: '17px' }}>Vehicle Number:</strong> <span style={{ fontSize: '16px' }}>{serviceJob.vehicle_reg_no || 'N/A'}</span>
          </div>
          <div>
            <strong style={{ fontSize: '17px' }}>Odometer Reading:</strong> <span style={{ fontSize: '16px' }}>{serviceJob.odometer_reading ? Math.floor(serviceJob.odometer_reading) : 'N/A'}</span>
          </div>
          <div>
            <strong style={{ fontSize: '17px' }}>Fuel Level:</strong> <span style={{ fontSize: '16px' }}>{serviceJob.fuel_level || 'N/A'}</span>
          </div>
        </div>
        {serviceJob.vehicle_brand_name && (
          <div>
            <strong style={{ fontSize: '17px' }}>Vehicle Details:</strong> <span style={{ fontSize: '16px' }}>{serviceJob.vehicle_brand_name} {serviceJob.vehicle_model_name || ''}</span>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <strong style={{ fontSize: '17px' }}>Owner Name:</strong> <span style={{ fontSize: '16px' }}>{serviceJob.vehicle_customer || 'N/A'}</span>
          </div>
          <div>
            <strong style={{ fontSize: '17px' }}>Owner Mobile:</strong> <span style={{ fontSize: '16px' }}>{serviceJob.owner_mobile || 'N/A'}</span>
          </div>
        </div>
        <div>
          <strong style={{ fontSize: '17px' }}>Status:</strong> <span style={{ 
            textTransform: 'capitalize',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '16px',
            backgroundColor: serviceJob.status === 'completed' ? '#d4edda' : 
                            serviceJob.status === 'in_progress' ? '#fff3cd' : '#f8d7da'
          }}>
            {serviceJob.status}
          </span>
        </div>
        
        {serviceJob.defects && serviceJob.defects.length > 0 && (
          <div>
            <strong style={{ fontSize: '17px' }}>Vehicle Defects:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '20px', fontSize: '16px' }}>
              {serviceJob.defects.map(defect => (
                <li key={defect.id} style={{ fontSize: '16px' }}>
                  {defect.name}
                  {defect.description && <span style={{ color: '#666', marginLeft: '8px', fontSize: '16px' }}>- {defect.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {serviceJob.recommendations && serviceJob.recommendations.length > 0 && (
          <div>
            <strong style={{ fontSize: '17px' }}>Pre Inspection Recommendations:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '20px', fontSize: '16px' }}>
              {serviceJob.recommendations.map(rec => (
                <li key={rec.id} style={{ fontSize: '16px' }}>
                  {rec.name}
                  {rec.description && <span style={{ color: '#666', marginLeft: '8px', fontSize: '16px' }}>- {rec.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {serviceJob.service_package_name && (
          <div style={{ 
            marginBottom: '10px',
            padding: '15px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '4px', 
            border: '2px solid #2196f3',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
              <strong style={{ fontSize: '18px', color: '#1976d2' }}>Service Package:</strong> <span style={{ fontSize: '17px' }}>{serviceJob.service_package_name}</span>
            </div>
            {serviceJob.service_package_price !== undefined && (
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                {parseFloat(serviceJob.service_package_price || 0).toFixed(2)}
              </span>
            )}
          </div>
        )}
        
        {serviceJob.services && serviceJob.services.length > 0 && (
          <div style={{ 
            marginBottom: '10px',
            padding: '15px', 
            backgroundColor: '#f3e5f5', 
            borderRadius: '4px', 
            border: '2px solid #9c27b0'
          }}>
            <strong style={{ fontSize: '18px', color: '#7b1fa2', display: 'block', marginBottom: '10px' }}>Additional Services:</strong>
            <table className="table" style={{ marginTop: '10px', width: '100%', backgroundColor: '#fff', fontSize: '16px' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '17px' }}>Service Name</th>
                  <th style={{ fontSize: '17px' }}>Remarks</th>
                  <th style={{ textAlign: 'right', fontSize: '17px' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {serviceJob.services.map((service) => (
                  <tr key={service.id}>
                    <td style={{ fontSize: '16px' }}>{service.name || 'N/A'}</td>
                    <td style={{ fontSize: '16px' }}>{service.remarks || '-'}</td>
                    <td style={{ textAlign: 'right', color: '#28a745', fontSize: '16px' }}>
                      {parseFloat(service.price || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                  <td colSpan="2" style={{ textAlign: 'right', fontSize: '17px' }}>Total:</td>
                  <td style={{ textAlign: 'right', color: '#28a745', fontSize: '17px' }}>
                    {serviceJob.services.reduce((sum, service) => {
                      return sum + parseFloat(service.price || 0);
                    }, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        
        {serviceJob.items && serviceJob.items.length > 0 && (
          <div style={{ 
            marginBottom: '10px',
            padding: '15px', 
            backgroundColor: '#fff3e0', 
            borderRadius: '4px', 
            border: '2px solid #ff9800'
          }}>
            <strong style={{ fontSize: '18px', color: '#e65100', display: 'block', marginBottom: '10px' }}>Parts/Items:</strong>
            <table className="table" style={{ marginTop: '10px', backgroundColor: '#fff', fontSize: '16px' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '17px' }}>Item Name</th>
                  <th style={{ fontSize: '17px' }}>Batch</th>
                  <th style={{ textAlign: 'right', fontSize: '17px' }}>Quantity</th>
                  <th style={{ textAlign: 'right', fontSize: '17px' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', fontSize: '17px' }}>Item Total</th>
                  <th style={{ textAlign: 'right', fontSize: '17px' }}>Labour Charge</th>
                  <th style={{ textAlign: 'right', fontSize: '17px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {serviceJob.items.map((item) => {
                  const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
                  const totalPrice = itemTotal + parseFloat(item.labour_charge || 0);
                  return (
                    <tr key={item.id}>
                      <td style={{ fontSize: '16px' }}>{item.item_name || 'N/A'}</td>
                      <td style={{ fontSize: '16px' }}>{item.batch_number || '-'}</td>
                      <td style={{ textAlign: 'right', fontSize: '16px' }}>{parseFloat(item.quantity || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: '#28a745', fontSize: '16px' }}>{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: '#28a745', fontSize: '16px' }}>{itemTotal.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: '#28a745', fontSize: '16px' }}>{parseFloat(item.labour_charge || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: '#28a745', fontSize: '16px' }}>{totalPrice.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                  <td colSpan="6" style={{ textAlign: 'right', fontSize: '17px' }}>Total:</td>
                  <td style={{ textAlign: 'right', color: '#28a745', fontSize: '17px' }}>
                    {serviceJob.items.reduce((sum, item) => {
                      const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
                      const totalPrice = itemTotal + parseFloat(item.labour_charge || 0);
                      return sum + totalPrice;
                    }, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        
        {/* Totals Summary */}
        {((serviceJob.service_package_price !== undefined && serviceJob.service_package_price > 0) || 
          (serviceJob.services && serviceJob.services.length > 0) || 
          (serviceJob.items && serviceJob.items.length > 0)) && (
          <div style={{ 
            marginTop: '10px',
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px', 
            border: '1px solid #dee2e6'
          }}>
            <table style={{ width: '100%', fontSize: '16px' }}>
              <tbody>
                {serviceJob.service_package_price !== undefined && serviceJob.service_package_price > 0 && (
                  <tr>
                    <td style={{ padding: '8px 0', fontSize: '17px' }}>Service Package Total:</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: '#28a745', fontSize: '17px' }}>
                      {parseFloat(serviceJob.service_package_price || 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                {serviceJob.services && serviceJob.services.length > 0 && (
                  <tr>
                    <td style={{ padding: '8px 0', fontSize: '17px' }}>Additional Services Total:</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: '#28a745', fontSize: '17px' }}>
                      {serviceJob.services.reduce((sum, service) => {
                        return sum + parseFloat(service.price || 0);
                      }, 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                {serviceJob.items && serviceJob.items.length > 0 && (
                  <tr>
                    <td style={{ padding: '8px 0', fontSize: '17px' }}>Parts Total (including Labour Charge):</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: '#28a745', fontSize: '17px' }}>
                      {serviceJob.items.reduce((sum, item) => {
                        const totalPrice = (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)) + parseFloat(item.labour_charge || 0);
                        return sum + totalPrice;
                      }, 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr style={{ borderTop: '2px solid #dee2e6', fontWeight: 'bold' }}>
                  <td style={{ padding: '12px 0', fontSize: '19px' }}>Grand Total:</td>
                  <td style={{ textAlign: 'right', padding: '12px 0', fontSize: '19px', color: '#28a745' }}>
                    {(
                      parseFloat(serviceJob.service_package_price || 0) +
                      (serviceJob.services ? serviceJob.services.reduce((sum, service) => sum + parseFloat(service.price || 0), 0) : 0) +
                      (serviceJob.items ? serviceJob.items.reduce((sum, item) => {
                        const totalPrice = (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)) + parseFloat(item.labour_charge || 0);
                        return sum + totalPrice;
                      }, 0) : 0)
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {serviceJob.remarks && (
          <div>
            <strong style={{ fontSize: '17px' }}>Remarks:</strong>
            <div style={{ marginTop: '5px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', fontSize: '16px' }}>
              {serviceJob.remarks}
            </div>
          </div>
        )}
        
        <div>
          <strong style={{ fontSize: '17px' }}>Created At:</strong> <span style={{ fontSize: '16px' }}>{new Date(serviceJob.created_at).toLocaleString()}</span>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/service-jobs/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default ServiceJobView;

