import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supplierService } from '../../services/supplierService';

const SupplierView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupplier();
  }, [id]);

  const loadSupplier = async () => {
    try {
      const response = await supplierService.getById(id);
      setSupplier(response.data.data);
    } catch (error) {
      toast.error('Failed to load supplier');
      navigate('/suppliers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!supplier) return <div>Supplier not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Supplier Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/suppliers')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>ID:</strong> {supplier.id}
        </div>
        <div>
          <strong>Name:</strong> {supplier.name}
        </div>
        <div>
          <strong>Description:</strong> {supplier.description || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(supplier.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/suppliers/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default SupplierView;

