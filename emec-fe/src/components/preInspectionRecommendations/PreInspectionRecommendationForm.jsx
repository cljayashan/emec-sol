import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { preInspectionRecommendationService } from '../../services/preInspectionRecommendationService';
import { useForm } from '../../hooks/useForm';

const PreInspectionRecommendationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, reset } = useForm({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      loadPreInspectionRecommendation();
    } else {
      // Auto-focus name field when creating new record
      nameInputRef.current?.focus();
    }
  }, [id]);

  const loadPreInspectionRecommendation = async () => {
    try {
      const response = await preInspectionRecommendationService.getById(id);
      setValue('name', response.data.data.name);
      setValue('description', response.data.data.description || '');
    } catch (error) {
      toast.error('Failed to load pre inspection recommendation');
      navigate('/pre-inspection-recommendations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await preInspectionRecommendationService.update(id, values);
        toast.success('Pre inspection recommendation updated successfully');
      } else {
        await preInspectionRecommendationService.create(values);
        toast.success('Pre inspection recommendation created successfully');
      }
      navigate('/pre-inspection-recommendations');
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
        <h2 className="card-title">{isEdit ? 'Edit Pre Inspection Recommendation' : 'Add New Pre Inspection Recommendation'}</h2>
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/pre-inspection-recommendations')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreInspectionRecommendationForm;

