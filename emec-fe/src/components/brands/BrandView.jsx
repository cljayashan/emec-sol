import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { brandService } from '../../services/brandService';

const BrandView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrand();
  }, [id]);

  const loadBrand = async () => {
    try {
      const response = await brandService.getById(id);
      setBrand(response.data.data);
    } catch (error) {
      toast.error('Failed to load vehicle brand');
      navigate('/brands');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!brand) return <div>Vehicle brand not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Vehicle Brand Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/brands')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Name:</strong> {brand.name}
        </div>
        <div>
          <strong>Description:</strong> {brand.description || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(brand.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/brands/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default BrandView;

