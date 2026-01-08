import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceService } from '../../services/serviceService';
import { useForm } from '../../hooks/useForm';

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, setValues, reset } = useForm({ name: '', price: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isEdit && id) {
      loadService();
    } else {
      // Focus name field when creating new service
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }
  }, [id]);

  const loadService = async () => {
    try {
      setLoadingData(true);
      const response = await serviceService.getById(id);
      
      if (response.data && response.data.success && response.data.data) {
        const service = response.data.data;
        
        setValues({
          name: service.name || '',
          price: service.price !== null && service.price !== undefined ? service.price : '',
          remarks: service.remarks || ''
        });
      } else {
        toast.error('Failed to load service data');
        navigate('/services');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load service';
      toast.error(errorMessage);
      navigate('/services');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate price is provided
    if (values.price === '' || values.price === null || values.price === undefined) {
      toast.error('Price is required');
      return;
    }
    
    const priceValue = parseFloat(values.price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Price must be a valid number greater than or equal to 0');
      return;
    }
    
    setLoading(true);
    try {
      const formData = {
        ...values,
        price: priceValue
      };
      
      if (isEdit) {
        await serviceService.update(id, formData);
        toast.success('Service updated successfully');
      } else {
        await serviceService.create(formData);
        toast.success('Service created successfully');
      }
      navigate('/services');
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
          <h2 className="card-title">{isEdit ? 'Edit Service' : 'Add New Service'}</h2>
        </div>
        <p>Loading service data...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Service' : 'Add New Service'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            ref={nameInputRef}
            type="text"
            name="name"
            value={values.name || ''}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            value={values.price ?? ''}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Remarks</label>
          <textarea
            name="remarks"
            value={values.remarks || ''}
            onChange={handleChange}
            disabled={loading}
            rows="4"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || loadingData}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/services')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
