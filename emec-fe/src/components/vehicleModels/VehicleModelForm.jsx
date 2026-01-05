import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vehicleModelService } from '../../services/vehicleModelService';
import { brandService } from '../../services/brandService';
import { useForm } from '../../hooks/useForm';
import AutoComplete from '../common/AutoComplete';

const VehicleModelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, setValues } = useForm({ 
    brand_id: '', 
    name: '', 
    description: '' 
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    loadBrands();
    if (isEdit && id) {
      loadVehicleModel();
    }
  }, [id]);

  useEffect(() => {
    // Update selected brand when brands are loaded and we have a brand_id
    if (brands.length > 0 && values.brand_id) {
      const brand = brands.find(b => b.id === values.brand_id);
      if (brand && (!selectedBrand || selectedBrand.id !== brand.id)) {
        setSelectedBrand(brand);
      }
    } else if (!values.brand_id) {
      setSelectedBrand(null);
    }
  }, [brands, values.brand_id]);

  const loadBrands = async () => {
    try {
      const response = await brandService.getAll(1, 1000);
      setBrands(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load vehicle brands');
    }
  };

  const loadVehicleModel = async () => {
    try {
      setLoadingData(true);
      const response = await vehicleModelService.getById(id);
      
      if (response.data && response.data.success && response.data.data) {
        const vehicleModel = response.data.data;
        
        setValues({
          brand_id: vehicleModel.brand_id || '',
          name: vehicleModel.name || '',
          description: vehicleModel.description || ''
        });
      } else {
        toast.error('Failed to load vehicle model data');
        navigate('/vehicle-models');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load vehicle model';
      toast.error(errorMessage);
      navigate('/vehicle-models');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await vehicleModelService.update(id, values);
        toast.success('Vehicle model updated successfully');
      } else {
        await vehicleModelService.create(values);
        toast.success('Vehicle model created successfully');
      }
      navigate('/vehicle-models');
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
          <h2 className="card-title">{isEdit ? 'Edit Vehicle Model' : 'Add New Vehicle Model'}</h2>
        </div>
        <p>Loading vehicle model data...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Vehicle Model' : 'Add New Vehicle Model'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vehicle Brand *</label>
          <AutoComplete
            items={brands}
            onSelect={(brand) => {
              if (brand) {
                setSelectedBrand(brand);
                setValue('brand_id', brand.id);
              } else {
                setSelectedBrand(null);
                setValue('brand_id', '');
              }
            }}
            placeholder="Search vehicle brand..."
            searchKey="name"
            value={selectedBrand?.name || ''}
          />
        </div>
        
        <div className="form-group">
          <label>Model Name *</label>
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/vehicle-models')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleModelForm;

