import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vehicleService } from '../../services/vehicleService';
import { brandService } from '../../services/brandService';
import { vehicleModelService } from '../../services/vehicleModelService';
import { customerService } from '../../services/customerService';
import { useForm } from '../../hooks/useForm';
import AutoComplete from '../common/AutoComplete';
import { VEHICLE_TYPES, VEHICLE_REGISTRATION_PREFIXES } from '../../utils/constants';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, setValues } = useForm({ 
    customer_id: '',
    vehicle_type: '',
    reg_no: '',
    brand_id: '',
    model_id: '',
    version: '',
    year_of_manufacture: '',
    year_of_registration: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [selectedYearOfManufacture, setSelectedYearOfManufacture] = useState(null);
  const [selectedYearOfRegistration, setSelectedYearOfRegistration] = useState(null);
  const [regPrefix, setRegPrefix] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    full_name: '',
    name_with_initials: '',
    nic: '',
    mobile1: '',
    mobile2: '',
    address: '',
    email_address: ''
  });
  const [customerFormLoading, setCustomerFormLoading] = useState(false);

  // Transform vehicle types array into objects for AutoComplete
  const vehicleTypesList = useMemo(() => {
    return VEHICLE_TYPES.map(type => ({ name: type }));
  }, []);

  // Generate year options for autocomplete (from current year down to 1900)
  const yearOptionsList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push({ name: year.toString(), value: year });
    }
    return years;
  }, []);

  useEffect(() => {
    loadBrands();
    loadCustomers();
    if (isEdit && id) {
      loadVehicle();
    }
  }, [id]);

  useEffect(() => {
    // Update selected customer when customers are loaded and we have a customer_id
    if (customers.length > 0 && values.customer_id) {
      const customer = customers.find(c => c.id === values.customer_id);
      if (customer && (!selectedCustomer || selectedCustomer.id !== customer.id)) {
        setSelectedCustomer(customer);
      }
    } else if (!values.customer_id) {
      setSelectedCustomer(null);
    }
  }, [customers, values.customer_id]);

  useEffect(() => {
    // Update selected vehicle type when vehicle_type value changes
    if (values.vehicle_type) {
      const vehicleType = vehicleTypesList.find(vt => vt.name === values.vehicle_type);
      if (vehicleType && (!selectedVehicleType || selectedVehicleType.name !== vehicleType.name)) {
        setSelectedVehicleType(vehicleType);
      }
    } else {
      setSelectedVehicleType(null);
    }
  }, [values.vehicle_type, vehicleTypesList]);

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
    // Update selected year of manufacture when year_of_manufacture value changes
    if (values.year_of_manufacture) {
      const year = yearOptionsList.find(y => y.value.toString() === values.year_of_manufacture.toString());
      if (year && (!selectedYearOfManufacture || selectedYearOfManufacture.value !== year.value)) {
        setSelectedYearOfManufacture(year);
      }
    } else {
      setSelectedYearOfManufacture(null);
    }
  }, [values.year_of_manufacture, yearOptionsList]);

  useEffect(() => {
    // Update selected year of registration when year_of_registration value changes
    if (values.year_of_registration) {
      const year = yearOptionsList.find(y => y.value.toString() === values.year_of_registration.toString());
      if (year && (!selectedYearOfRegistration || selectedYearOfRegistration.value !== year.value)) {
        setSelectedYearOfRegistration(year);
      }
    } else {
      setSelectedYearOfRegistration(null);
    }
  }, [values.year_of_registration, yearOptionsList]);

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

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll(1, 1000);
      setCustomers(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCustomerFormLoading(true);
    try {
      const response = await customerService.create(customerFormData);
      toast.success('Customer created successfully');
      setShowCustomerModal(false);
      // Reset form
      setCustomerFormData({
        full_name: '',
        name_with_initials: '',
        nic: '',
        mobile1: '',
        mobile2: '',
        address: '',
        email_address: ''
      });
      // Reload customers and select the newly created one
      await loadCustomers();
      if (response.data && response.data.data) {
        const newCustomer = response.data.data;
        setSelectedCustomer(newCustomer);
        setValue('customer_id', newCustomer.id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create customer');
    } finally {
      setCustomerFormLoading(false);
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
          customer_id: vehicle.customer_id || '',
          vehicle_type: vehicle.vehicle_type || '',
          reg_no: vehicle.reg_no || '',
          brand_id: vehicle.brand_id || '',
          model_id: vehicle.model_id || '',
          version: vehicle.version || '',
          year_of_manufacture: vehicle.year_of_manufacture || '',
          year_of_registration: vehicle.year_of_registration || '',
          remarks: vehicle.remarks || ''
        });
        
        // Split registration number into prefix and number
        if (vehicle.reg_no) {
          const parts = vehicle.reg_no.split(' ');
          if (parts.length >= 2) {
            setRegPrefix(parts[0]);
            setRegNumber(parts.slice(1).join(' '));
          } else {
            // If no space, check if it starts with a known prefix
            const foundPrefix = VEHICLE_REGISTRATION_PREFIXES.find(prefix => 
              vehicle.reg_no.toUpperCase().startsWith(prefix)
            );
            if (foundPrefix) {
              setRegPrefix(foundPrefix);
              setRegNumber(vehicle.reg_no.substring(foundPrefix.length).trim());
            } else {
              setRegPrefix('');
              setRegNumber(vehicle.reg_no);
            }
          }
        } else {
          setRegPrefix('');
          setRegNumber('');
        }
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
      // Combine prefix and number to form full registration number
      const fullRegNo = regPrefix && regNumber 
        ? `${regPrefix} ${regNumber}`.trim()
        : regNumber || regPrefix;
      
      // Validate required fields
      if (!fullRegNo || !fullRegNo.trim()) {
        toast.error('Registration number is required');
        setLoading(false);
        return;
      }
      
      if (!values.brand_id || !values.brand_id.trim()) {
        toast.error('Brand is required');
        setLoading(false);
        return;
      }
      
      if (!values.model_id || !values.model_id.trim()) {
        toast.error('Model is required');
        setLoading(false);
        return;
      }
      
      const data = {
        ...values,
        reg_no: fullRegNo.trim(),
        customer_id: values.customer_id && values.customer_id.trim() ? values.customer_id.trim() : undefined,
        brand_id: values.brand_id.trim(),
        model_id: values.model_id.trim(),
        year_of_manufacture: values.year_of_manufacture ? parseInt(values.year_of_manufacture) : undefined,
        year_of_registration: values.year_of_registration ? parseInt(values.year_of_registration) : undefined,
        vehicle_type: values.vehicle_type && values.vehicle_type.trim() ? values.vehicle_type.trim() : undefined,
        version: values.version && values.version.trim() ? values.version.trim() : undefined,
        remarks: values.remarks && values.remarks.trim() ? values.remarks.trim() : undefined
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
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        toast.error(errorMessages || 'Validation failed');
      } else {
        toast.error(error.response?.data?.message || error.response?.data?.error || 'Operation failed');
      }
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

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Vehicle' : 'Register New Vehicle'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer *</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <AutoComplete
                items={customers}
                onSelect={(customer) => {
                  if (customer) {
                    setSelectedCustomer(customer);
                    setValue('customer_id', customer.id);
                  } else {
                    setSelectedCustomer(null);
                    setValue('customer_id', '');
                  }
                }}
                placeholder="Search customer..."
                searchKey="full_name"
                value={selectedCustomer?.full_name || ''}
                renderItem={(customer) => {
                  const mobile = customer.mobile1 || '';
                  const nic = customer.nic || '';
                  const parts = [customer.full_name, mobile, nic].filter(part => part);
                  return parts.join(' | ');
                }}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCustomerModal(true)}
              disabled={loading}
              style={{ whiteSpace: 'nowrap' }}
            >
              Add Customer
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Vehicle Type</label>
          <AutoComplete
            items={vehicleTypesList}
            onSelect={(vehicleType) => {
              if (vehicleType) {
                setSelectedVehicleType(vehicleType);
                setValue('vehicle_type', vehicleType.name);
              } else {
                setSelectedVehicleType(null);
                setValue('vehicle_type', '');
              }
            }}
            placeholder="Search vehicle type..."
            searchKey="name"
            value={selectedVehicleType?.name || values.vehicle_type || ''}
          />
        </div>
        
        <div className="form-group">
          <label>Registration Number *</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '120px' }}>
              <label style={{ fontSize: '12px', marginBottom: '5px', display: 'block', color: '#666' }}>Prefix</label>
              <select
                value={regPrefix}
                onChange={(e) => setRegPrefix(e.target.value)}
                required
                disabled={loading}
                className="form-group input"
                style={{ width: '100%' }}
              >
                <option value="">Select</option>
                {VEHICLE_REGISTRATION_PREFIXES.map(prefix => (
                  <option key={prefix} value={prefix}>{prefix}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', marginBottom: '5px', display: 'block', color: '#666' }}>Number</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., BJB 2929"
                className="form-group input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
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
          <AutoComplete
            items={yearOptionsList}
            onSelect={(year) => {
              if (year) {
                setSelectedYearOfManufacture(year);
                setValue('year_of_manufacture', year.value.toString());
              } else {
                setSelectedYearOfManufacture(null);
                setValue('year_of_manufacture', '');
              }
            }}
            placeholder="Search year..."
            searchKey="name"
            value={selectedYearOfManufacture?.name || values.year_of_manufacture || ''}
          />
        </div>

        <div className="form-group">
          <label>Year of Registration</label>
          <AutoComplete
            items={yearOptionsList}
            onSelect={(year) => {
              if (year) {
                setSelectedYearOfRegistration(year);
                setValue('year_of_registration', year.value.toString());
              } else {
                setSelectedYearOfRegistration(null);
                setValue('year_of_registration', '');
              }
            }}
            placeholder="Search year..."
            searchKey="name"
            value={selectedYearOfRegistration?.name || values.year_of_registration || ''}
          />
        </div>

        <div className="form-group">
          <label>Remarks</label>
          <textarea
            name="remarks"
            value={values.remarks || ''}
            onChange={handleChange}
            placeholder="Enter any additional remarks..."
            disabled={loading}
            rows={4}
          />
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

      {showCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Add New Customer</h3>
              <button className="modal-close" onClick={() => setShowCustomerModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateCustomer}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={customerFormData.full_name}
                  onChange={handleCustomerFormChange}
                  required
                  disabled={customerFormLoading}
                />
              </div>
              
              <div className="form-group">
                <label>Name with Initials</label>
                <input
                  type="text"
                  name="name_with_initials"
                  value={customerFormData.name_with_initials}
                  onChange={handleCustomerFormChange}
                  disabled={customerFormLoading}
                />
              </div>

              <div className="form-group">
                <label>NIC</label>
                <input
                  type="text"
                  name="nic"
                  value={customerFormData.nic}
                  onChange={handleCustomerFormChange}
                  disabled={customerFormLoading}
                />
              </div>

              <div className="form-group">
                <label>Mobile 1</label>
                <input
                  type="text"
                  name="mobile1"
                  value={customerFormData.mobile1}
                  onChange={handleCustomerFormChange}
                  disabled={customerFormLoading}
                />
              </div>

              <div className="form-group">
                <label>Mobile 2</label>
                <input
                  type="text"
                  name="mobile2"
                  value={customerFormData.mobile2}
                  onChange={handleCustomerFormChange}
                  disabled={customerFormLoading}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={customerFormData.address}
                  onChange={handleCustomerFormChange}
                  disabled={customerFormLoading}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email_address"
                  value={customerFormData.email_address}
                  onChange={handleCustomerFormChange}
                  disabled={customerFormLoading}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCustomerModal(false)}
                  disabled={customerFormLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={customerFormLoading}
                >
                  {customerFormLoading ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleForm;

