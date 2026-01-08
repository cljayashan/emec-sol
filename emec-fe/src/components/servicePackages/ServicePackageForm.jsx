import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { servicePackageService } from '../../services/servicePackageService';
import { serviceService } from '../../services/serviceService';
import { useForm } from '../../hooks/useForm';
import AutoComplete from '../common/AutoComplete';

const ServicePackageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, reset } = useForm({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceListSearch, setServiceListSearch] = useState('');
  const nameInputRef = useRef(null);

  useEffect(() => {
    loadServices();
    if (isEdit) {
      loadServicePackage();
    } else {
      // Auto-focus name field when creating new record
      nameInputRef.current?.focus();
    }
  }, [id]);

  const loadServices = async () => {
    try {
      const response = await serviceService.getAll(1, 1000);
      setServices(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  const loadServicePackage = async () => {
    try {
      const response = await servicePackageService.getById(id);
      const packageData = response.data.data;
      setValue('name', packageData.name);
      setValue('description', packageData.description || '');
      
      // Set selected services
      if (packageData.services && Array.isArray(packageData.services)) {
        setSelectedServices(packageData.services.map(s => s.id));
      }
    } catch (error) {
      toast.error('Failed to load service package');
      navigate('/service-packages');
    }
  };

  const handleAddService = () => {
    if (selectedService && !selectedServices.includes(selectedService.id)) {
      setSelectedServices(prev => [...prev, selectedService.id]);
      setSelectedService(null);
    }
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(prev => prev.filter(id => id !== serviceId));
  };

  // Calculate total price from selected services
  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + parseFloat(service?.price || 0);
    }, 0);
  }, [selectedServices, services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...values,
        service_ids: selectedServices
      };
      
      if (isEdit) {
        await servicePackageService.update(id, data);
        toast.success('Service package updated successfully');
      } else {
        await servicePackageService.create(data);
        toast.success('Service package created successfully');
      }
      navigate('/service-packages');
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
        <h2 className="card-title">{isEdit ? 'Edit Service Package' : 'Add New Service Package'}</h2>
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

        <div className="form-group">
          <label>Services</label>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            {/* Left Column - Selection */}
            <div style={{ flex: 1 }}>
              <AutoComplete
                items={services.filter(service => !selectedServices.includes(service.id))}
                onSelect={(service) => setSelectedService(service)}
                placeholder="Search and select service..."
                searchKey="name"
                value={selectedService?.name || ''}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddService}
                disabled={!selectedService}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Add Service
              </button>
            </div>
            
            {/* Right Column - Selected List */}
            <div style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              backgroundColor: '#fafafa'
            }}>
              <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                <input
                  type="text"
                  placeholder="Search selected services..."
                  value={serviceListSearch}
                  onChange={(e) => setServiceListSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ 
                padding: '10px',
                height: '200px',
                overflowY: 'auto'
              }}>
                {selectedServices.length === 0 ? (
                  <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: '80px' }}>
                    No services selected
                  </p>
                ) : (() => {
                  const filteredServices = selectedServices.filter(serviceId => {
                    if (!serviceListSearch.trim()) return true;
                    const service = services.find(s => s.id === serviceId);
                    if (!service) return false;
                    const searchLower = serviceListSearch.toLowerCase();
                    return service.name.toLowerCase().includes(searchLower) ||
                           (service.remarks && service.remarks.toLowerCase().includes(searchLower));
                  });
                  
                  if (filteredServices.length === 0) {
                    return (
                      <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: '80px' }}>
                        No services match your search
                      </p>
                    );
                  }
                  
                  return filteredServices.map(serviceId => {
                    const service = services.find(s => s.id === serviceId);
                    if (!service) return null;
                    return (
                      <div key={serviceId} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        marginBottom: '5px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{service.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Price: Rs. {parseFloat(service.price || 0).toFixed(2)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(serviceId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '5px 10px'
                          }}
                          title="Remove service"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
              {selectedServices.length > 0 && (
                <div style={{ 
                  padding: '15px', 
                  borderTop: '2px solid #ddd',
                  backgroundColor: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>
                    Total:
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '18px', color: '#28a745' }}>
                    Rs. {totalPrice.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/service-packages')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicePackageForm;
