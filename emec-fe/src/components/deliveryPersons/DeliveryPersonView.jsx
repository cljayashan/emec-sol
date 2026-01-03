import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deliveryPersonService } from '../../services/deliveryPersonService';

const DeliveryPersonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveryPerson();
  }, [id]);

  const loadDeliveryPerson = async () => {
    try {
      const response = await deliveryPersonService.getById(id);
      setDeliveryPerson(response.data.data);
    } catch (error) {
      toast.error('Failed to load delivery person');
      navigate('/delivery-persons');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!deliveryPerson) return <div>Delivery person not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Delivery Person Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/delivery-persons')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>ID:</strong> {deliveryPerson.id}
        </div>
        <div>
          <strong>Name:</strong> {deliveryPerson.name}
        </div>
        <div>
          <strong>Description:</strong> {deliveryPerson.description || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(deliveryPerson.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/delivery-persons/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default DeliveryPersonView;

