import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { itemService } from '../../services/itemService';

const ItemView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      const response = await itemService.getById(id);
      setItem(response.data.data);
    } catch (error) {
      toast.error('Failed to load item');
      navigate('/items');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!item) return <div>Item not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Item Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/items')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Item Name:</strong> {item.item_name}
        </div>
        <div>
          <strong>Description:</strong> {item.description || 'N/A'}
        </div>
        <div>
          <strong>Brand:</strong> {item.brand || 'N/A'}
        </div>
        <div>
          <strong>Category:</strong> {item.category_name || 'N/A'}
        </div>
        <div>
          <strong>Barcode:</strong> {item.barcode || 'N/A'}
        </div>
        <div>
          <strong>Measurement Unit:</strong> {item.measurement_unit || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(item.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/items/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default ItemView;

