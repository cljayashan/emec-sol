import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vehicleDefectService } from '../../services/vehicleDefectService';

const VehicleDefectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicleDefect, setVehicleDefect] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicleDefect();
  }, [id]);

  const loadVehicleDefect = async () => {
    try {
      const response = await vehicleDefectService.getById(id);
      setVehicleDefect(response.data.data);
    } catch (error) {
      toast.error('Failed to load vehicle defect');
      navigate('/vehicle-defects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!vehicleDefect) return <div>Vehicle defect not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Vehicle Defect Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/vehicle-defects')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Name:</strong> {vehicleDefect.name}
        </div>
        <div>
          <strong>Description:</strong> {vehicleDefect.description || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(vehicleDefect.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/vehicle-defects/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default VehicleDefectView;

