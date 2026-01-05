import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vehicleService } from '../../services/vehicleService';
import { brandService } from '../../services/brandService';
import { vehicleModelService } from '../../services/vehicleModelService';
import { useForm } from '../../hooks/useForm';
import AutoComplete from '../common/AutoComplete';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, setValues } = useForm({ 
    customer: '',
    vehicle_type: '',
    reg_no: '',
    brand_id: '',
    model_id: '',
    version: '',
    year_of_manufacture: '',
    year_of_registration: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    loadBrands();
    if (isEdit && id) {
      loadVehicle();
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

  useEffect(() => {
    // Update selected model when models are loaded and we have a model_id
    if (models.length > 0 && values.model_id) {
      const model = models.find(m => m.id === values.model_id);
      if (model && (!selectedModel || selectedModel.id !== model.id)) {
        setSelectedModel(model);
      }
    } else if (!values.model_id) {
      setSelectedModel(null);
    }
  }, [models, values.model_id]);

  useEffect(() => {
    // Load models when brand changes - ONLY load if brand is selected
    if (selectedBrand && selectedBrand.id) {
      loadModels(selectedBrand.id);
    } else {
      // Clear models when no brand is selected
      setModels([]);
      setSelectedModel(null);
      setValue('model_id', '');
    }
  }, [selectedBrand]);

  const loadBrands = async () => {
    try {
      const response = await brandService.getAll(1, 1000);
      setBrands(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load vehicle brands');
    }
  };

  const loadModels = async (brandId) => {
    if (!brandId) {
      // Don't load models if no brandId is provided
      setModels([]);
      return;
    }
    try {
      const response = await vehicleModelService.getAll(1, 1000, '', brandId);
      setModels(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load vehicle models');
      setModels([]);
    }
  };

  const loadVehicle = async () => {
    try {
      setLoadingData(true);
      const response = await vehicleService.getById(id);
      
      if (response.data && response.data.success && response.data.data) {
        const vehicle = response.data.data;
        
        setValues({
          customer: vehicle.customer || '',
          vehicle_type: vehicle.vehicle_type || '',
          reg_no: vehicle.reg_no || '',
          brand_id: vehicle.brand_id || '',
          model_id: vehicle.model_id || '',
          version: vehicle.version || '',
          year_of_manufacture: vehicle.year_of_manufacture || '',
          year_of_registration: vehicle.year_of_registration || ''
        });
      } else {
        toast.error('Failed to load vehicle data');
        navigate('/vehicles');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load vehicle';
      toast.error(errorMessage);
      navigate('/vehicles');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...values,
        year_of_manufacture: values.year_of_manufacture ? parseInt(values.year_of_manufacture) : null,
        year_of_registration: values.year_of_registration ? parseInt(values.year_of_registration) : null
      };
      
      if (isEdit) {
        await vehicleService.update(id, data);
        toast.success('Vehicle updated successfully');
      } else {
        await vehicleService.create(data);
        toast.success('Vehicle registered successfully');
      }
      navigate('/vehicles');
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
          <h2 className="card-title">{isEdit ? 'Edit Vehicle' : 'Register New Vehicle'}</h2>
        </div>
        <p>Loading vehicle data...</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear; year >= 1900; year--) {
    yearOptions.push(year);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Vehicle' : 'Register New Vehicle'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer *</label>
          <input
            type="text"
            name="customer"
            value={values.customer || ''}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Vehicle Type</label>
          <input
            type="text"
            name="vehicle_type"
            value={values.vehicle_type || ''}
            onChange={handleChange}
            placeholder="e.g., Car, Motorcycle, Truck"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Registration Number *</label>
          <input
            type="text"
            name="reg_no"
            value={values.reg_no || ''}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="e.g., ABC-1234"
          />
        </div>

        <div className="form-group">
          <label>Brand *</label>
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
          <label>Model *</label>
          <AutoComplete
            items={models}
            onSelect={(model) => {
              if (model) {
                setSelectedModel(model);
                setValue('model_id', model.id);
              } else {
                setSelectedModel(null);
                setValue('model_id', '');
              }
            }}
            placeholder={selectedBrand ? "Search vehicle model..." : "Select a brand first"}
            searchKey="name"
            value={selectedModel?.name || ''}
            disabled={!selectedBrand}
          />
        </div>

        <div className="form-group">
          <label>Version</label>
          <input
            type="text"
            name="version"
            value={values.version || ''}
            onChange={handleChange}
            placeholder="e.g., 1.5L, EX, LX"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Year of Manufacture</label>
          <select
            name="year_of_manufacture"
            value={values.year_of_manufacture || ''}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select Year</option>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Year of Registration</label>
          <select
            name="year_of_registration"
            value={values.year_of_registration || ''}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select Year</option>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || loadingData}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Register'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/vehicles')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;

