import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vehicleModelService } from '../../services/vehicleModelService';

const VehicleModelView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicleModel, setVehicleModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicleModel();
  }, [id]);

  const loadVehicleModel = async () => {
    try {
      const response = await vehicleModelService.getById(id);
      setVehicleModel(response.data.data);
    } catch (error) {
      toast.error('Failed to load vehicle model');
      navigate('/vehicle-models');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!vehicleModel) return <div>Vehicle model not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Vehicle Model Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/vehicle-models')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Model Name:</strong> {vehicleModel.name}
        </div>
        <div>
          <strong>Brand:</strong> {vehicleModel.brand_name || 'N/A'}
        </div>
        <div>
          <strong>Description:</strong> {vehicleModel.description || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(vehicleModel.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/vehicle-models/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default VehicleModelView;

