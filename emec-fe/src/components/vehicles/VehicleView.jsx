import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vehicleService } from '../../services/vehicleService';

const VehicleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    try {
      const response = await vehicleService.getById(id);
      setVehicle(response.data.data);
    } catch (error) {
      toast.error('Failed to load vehicle');
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!vehicle) return <div>Vehicle not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Vehicle Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/vehicles')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Registration Number:</strong> {vehicle.reg_no}
        </div>
        <div>
          <strong>Customer:</strong> {vehicle.customer}
        </div>
        <div>
          <strong>Vehicle Type:</strong> {vehicle.vehicle_type || 'N/A'}
        </div>
        <div>
          <strong>Brand:</strong> {vehicle.brand_name || 'N/A'}
        </div>
        <div>
          <strong>Model:</strong> {vehicle.model_name || 'N/A'}
        </div>
        <div>
          <strong>Version:</strong> {vehicle.version || 'N/A'}
        </div>
        <div>
          <strong>Year of Manufacture:</strong> {vehicle.year_of_manufacture || 'N/A'}
        </div>
        <div>
          <strong>Year of Registration:</strong> {vehicle.year_of_registration || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(vehicle.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/vehicles/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default VehicleView;

