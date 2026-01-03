import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { itemCategoryService } from '../../services/itemCategoryService';

const ItemCategoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      const response = await itemCategoryService.getById(id);
      setCategory(response.data.data);
    } catch (error) {
      toast.error('Failed to load category');
      navigate('/item-categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Category Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/item-categories')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>ID:</strong> {category.id}
        </div>
        <div>
          <strong>Name:</strong> {category.name}
        </div>
        <div>
          <strong>Description:</strong> {category.description || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(category.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/item-categories/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default ItemCategoryView;

