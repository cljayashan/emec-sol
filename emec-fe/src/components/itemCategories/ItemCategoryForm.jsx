import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { itemCategoryService } from '../../services/itemCategoryService';
import { useForm } from '../../hooks/useForm';

const ItemCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, reset } = useForm({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      const response = await itemCategoryService.getById(id);
      setValue('name', response.data.data.name);
      setValue('description', response.data.data.description || '');
    } catch (error) {
      toast.error('Failed to load category');
      navigate('/item-categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await itemCategoryService.update(id, values);
        toast.success('Category updated successfully');
      } else {
        await itemCategoryService.create(values);
        toast.success('Category created successfully');
      }
      navigate('/item-categories');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Category' : 'Add New Category'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={values.description}
            onChange={handleChange}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/item-categories')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemCategoryForm;

