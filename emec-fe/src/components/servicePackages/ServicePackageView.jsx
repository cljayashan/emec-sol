import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { servicePackageService } from '../../services/servicePackageService';

const ServicePackageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [servicePackage, setServicePackage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServicePackage();
  }, [id]);

  const loadServicePackage = async () => {
    try {
      const response = await servicePackageService.getById(id);
      setServicePackage(response.data.data);
    } catch (error) {
      toast.error('Failed to load service package');
      navigate('/service-packages');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!servicePackage) return <div>Service package not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Service Package Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/service-packages')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Name:</strong> {servicePackage.name}
        </div>
        <div>
          <strong>Description:</strong> {servicePackage.description || 'N/A'}
        </div>
        <div>
          <strong>Services:</strong>
          {servicePackage.services && servicePackage.services.length > 0 ? (
            <div style={{ marginTop: '10px', border: '1px solid #ddd', borderRadius: '4px', padding: '10px', backgroundColor: '#fafafa' }}>
              {servicePackage.services.map((service, index) => (
                <div key={service.id} style={{ 
                  padding: '8px',
                  marginBottom: index < servicePackage.services.length - 1 ? '5px' : '0',
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{service.name}</div>
                    {service.remarks && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{service.remarks}</div>
                    )}
                  </div>
                  <div style={{ fontWeight: 500, color: '#28a745' }}>
                    Rs. {parseFloat(service.price || 0).toFixed(2)}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd', fontWeight: 600 }}>
                Total: Rs. {servicePackage.services.reduce((sum, service) => sum + parseFloat(service.price || 0), 0).toFixed(2)}
              </div>
            </div>
          ) : (
            <span style={{ color: '#999', fontStyle: 'italic' }}>No services added</span>
          )}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(servicePackage.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/service-packages/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default ServicePackageView;
