import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supplierService } from '../../services/supplierService';
import { useForm } from '../../hooks/useForm';

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, reset } = useForm({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadSupplier();
    }
  }, [id]);

  const loadSupplier = async () => {
    try {
      const response = await supplierService.getById(id);
      setValue('name', response.data.data.name);
      setValue('description', response.data.data.description || '');
    } catch (error) {
      toast.error('Failed to load supplier');
      navigate('/suppliers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await supplierService.update(id, values);
        toast.success('Supplier updated successfully');
      } else {
        await supplierService.create(values);
        toast.success('Supplier created successfully');
      }
      navigate('/suppliers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</h2>
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/suppliers')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;

