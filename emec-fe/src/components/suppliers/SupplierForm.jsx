import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supplierService } from '../../services/supplierService';
import { useForm } from '../../hooks/useForm';

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, setValues, reset } = useForm({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadSupplier();
    }
  }, [id]);

  const loadSupplier = async () => {
    try {
      setLoadingData(true);
      const response = await supplierService.getById(id);
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const supplier = response.data.data;
        console.log('Supplier data:', supplier);
        
        // Update all values at once
        setValues({
          name: supplier.name || '',
          description: supplier.description || ''
        });
        
        console.log('Form values set:', { name: supplier.name, description: supplier.description });
      } else {
        console.error('Invalid response:', response.data);
        toast.error('Failed to load supplier data');
        navigate('/suppliers');
      }
    } catch (error) {
      console.error('Error loading supplier:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load supplier';
      toast.error(errorMessage);
      navigate('/suppliers');
    } finally {
      setLoadingData(false);
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

  if (loadingData) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</h2>
        </div>
        <p>Loading supplier data...</p>
      </div>
    );
  }

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
            value={values.name || ''}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={values.description || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || loadingData}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/suppliers')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;

