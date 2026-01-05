import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { brandService } from '../../services/brandService';
import { useForm } from '../../hooks/useForm';

const BrandForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, setValues } = useForm({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadBrand();
    }
  }, [id]);

  const loadBrand = async () => {
    try {
      setLoadingData(true);
      const response = await brandService.getById(id);
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const brand = response.data.data;
        console.log('Brand data:', brand);
        
        // Update all values at once
        setValues({
          name: brand.name || '',
          description: brand.description || ''
        });
        
        console.log('Form values set:', { name: brand.name, description: brand.description });
      } else {
        console.error('Invalid response:', response.data);
        toast.error('Failed to load vehicle brand data');
        navigate('/brands');
      }
    } catch (error) {
      console.error('Error loading vehicle brand:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load vehicle brand';
      toast.error(errorMessage);
      navigate('/brands');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await brandService.update(id, values);
        toast.success('Vehicle brand updated successfully');
      } else {
        await brandService.create(values);
        toast.success('Vehicle brand created successfully');
      }
      navigate('/brands');
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
          <h2 className="card-title">{isEdit ? 'Edit Vehicle Brand' : 'Add New Vehicle Brand'}</h2>
        </div>
        <p>Loading vehicle brand data...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Vehicle Brand' : 'Add New Vehicle Brand'}</h2>
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/brands')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandForm;

