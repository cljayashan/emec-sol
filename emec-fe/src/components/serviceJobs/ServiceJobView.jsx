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
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Job Number:</strong> {serviceJob.job_number}
        </div>
        <div>
          <strong>Vehicle Number:</strong> {serviceJob.vehicle_reg_no || 'N/A'}
        </div>
        <div>
          <strong>Owner Name:</strong> {serviceJob.vehicle_customer || 'N/A'}
        </div>
        <div>
          <strong>Owner Mobile:</strong> {serviceJob.owner_mobile || 'N/A'}
        </div>
        {serviceJob.vehicle_brand_name && (
          <div>
            <strong>Vehicle Details:</strong> {serviceJob.vehicle_brand_name} {serviceJob.vehicle_model_name || ''}
          </div>
        )}
        <div>
          <strong>Fuel Level:</strong> {serviceJob.fuel_level || 'N/A'}
        </div>
        <div>
          <strong>Odometer Reading:</strong> {serviceJob.odometer_reading ? Math.floor(serviceJob.odometer_reading) : 'N/A'}
        </div>
        <div>
          <strong>Status:</strong> <span style={{ 
            textTransform: 'capitalize',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: serviceJob.status === 'completed' ? '#d4edda' : 
                            serviceJob.status === 'in_progress' ? '#fff3cd' : '#f8d7da'
          }}>
            {serviceJob.status}
          </span>
        </div>
        
        {serviceJob.defects && serviceJob.defects.length > 0 && (
          <div>
            <strong>Vehicle Defects:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
              {serviceJob.defects.map(defect => (
                <li key={defect.id}>
                  {defect.name}
                  {defect.description && <span style={{ color: '#666', marginLeft: '8px' }}>- {defect.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {serviceJob.recommendations && serviceJob.recommendations.length > 0 && (
          <div>
            <strong>Pre Inspection Recommendations:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
              {serviceJob.recommendations.map(rec => (
                <li key={rec.id}>
                  {rec.name}
                  {rec.description && <span style={{ color: '#666', marginLeft: '8px' }}>- {rec.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {serviceJob.remarks && (
          <div>
            <strong>Remarks:</strong>
            <div style={{ marginTop: '5px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              {serviceJob.remarks}
            </div>
          </div>
        )}
        
        <div>
          <strong>Created At:</strong> {new Date(serviceJob.created_at).toLocaleString()}
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

