import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceService } from '../../services/serviceService';

const ServiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      const response = await serviceService.getById(id);
      if (response.data && response.data.success) {
        setService(response.data.data);
      } else {
        toast.error('Service not found');
        navigate('/services');
      }
    } catch (error) {
      toast.error('Failed to load service');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!service) return <div>Service not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Service Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/services')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Name:</strong> {service.name}
        </div>
        <div>
          <strong>Price:</strong> {parseFloat(service.price || 0).toFixed(2)}
        </div>
        <div>
          <strong>Remarks:</strong> {service.remarks || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(service.created_at).toLocaleString()}
        </div>
        {service.updated_at && service.updated_at !== service.created_at && (
          <div>
            <strong>Updated At:</strong> {new Date(service.updated_at).toLocaleString()}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/services/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default ServiceView;
