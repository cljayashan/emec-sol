import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceTypeService } from '../../services/serviceTypeService';

const ServiceTypeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceType();
  }, [id]);

  const loadServiceType = async () => {
    try {
      const response = await serviceTypeService.getById(id);
      setServiceType(response.data.data);
    } catch (error) {
      toast.error('Failed to load service type');
      navigate('/service-types');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!serviceType) return <div>Service type not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Service Type Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/service-types')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Name:</strong> {serviceType.name}
        </div>
        <div>
          <strong>Description:</strong> {serviceType.description || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(serviceType.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/service-types/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default ServiceTypeView;

