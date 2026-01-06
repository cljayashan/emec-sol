import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceTypeService } from '../../services/serviceTypeService';
import { useForm } from '../../hooks/useForm';

const ServiceTypeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, reset } = useForm({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      loadServiceType();
    } else {
      // Auto-focus name field when creating new record
      nameInputRef.current?.focus();
    }
  }, [id]);

  const loadServiceType = async () => {
    try {
      const response = await serviceTypeService.getById(id);
      setValue('name', response.data.data.name);
      setValue('description', response.data.data.description || '');
    } catch (error) {
      toast.error('Failed to load service type');
      navigate('/service-types');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await serviceTypeService.update(id, values);
        toast.success('Service type updated successfully');
      } else {
        await serviceTypeService.create(values);
        toast.success('Service type created successfully');
      }
      navigate('/service-types');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Operation failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Service Type' : 'Add New Service Type'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            ref={nameInputRef}
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            autoFocus
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/service-types')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceTypeForm;

