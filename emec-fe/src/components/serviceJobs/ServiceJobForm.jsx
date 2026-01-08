import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceJobService } from '../../services/serviceJobService';
import { vehicleService } from '../../services/vehicleService';
import { vehicleDefectService } from '../../services/vehicleDefectService';
import { preInspectionRecommendationService } from '../../services/preInspectionRecommendationService';
import { servicePackageService } from '../../services/servicePackageService';
import { serviceService } from '../../services/serviceService';
import { brandService } from '../../services/brandService';
import { vehicleModelService } from '../../services/vehicleModelService';
import { customerService } from '../../services/customerService';
import { useForm } from '../../hooks/useForm';
import AutoComplete from '../common/AutoComplete';
import Modal from '../common/Modal';
import ItemSelectionModal from '../common/ItemSelectionModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { VEHICLE_TYPES, VEHICLE_REGISTRATION_PREFIXES } from '../../utils/constants';

const ServiceJobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue } = useForm({ 
    vehicle_id: '',
    service_package_id: '',
    fuel_level: '',
    odometer_reading: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [servicePackages, setServicePackages] = useState([]);
  const [selectedServicePackage, setSelectedServicePackage] = useState(null);
  const [ownerName, setOwnerName] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');
  const [vehicleDefects, setVehicleDefects] = useState([]);
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [defectListSearch, setDefectListSearch] = useState('');
  const [preInspectionRecommendations, setPreInspectionRecommendations] = useState([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [recommendationListSearch, setRecommendationListSearch] = useState('');
  
  // Vehicle registration form state
  const [vehicleFormData, setVehicleFormData] = useState({
    customer: '',
    vehicle_type: '',
    reg_no: '',
    brand_id: '',
    model_id: '',
    version: '',
    year_of_manufacture: '',
    year_of_registration: '',
    remarks: ''
  });
  const [vehicleFormLoading, setVehicleFormLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [regPrefix, setRegPrefix] = useState('');
  const [regNumber, setRegNumber] = useState('');

  // Items/Parts management state
  const [serviceJobItems, setServiceJobItems] = useState([]);
  const [showItemsModal, setShowItemsModal] = useState(false);
  
  // Services management state
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceListSearch, setServiceListSearch] = useState('');
  
  // Track services from selected package to prevent duplicates
  const [packageServices, setPackageServices] = useState([]);
  
  // Confirmation dialog for duplicate services
  const { isOpen, message, confirm, handleConfirm, handleCancel } = useConfirm();
  const [pendingService, setPendingService] = useState(null);

  const fuelLevels = ['Empty', '1/4', '1/2', '3/4', 'Full'];

  const vehicleTypesList = useMemo(() => {
    return VEHICLE_TYPES.map(type => ({ name: type }));
  }, []);

  const yearOptionsList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push({ name: year.toString(), value: year });
    }
    return years;
  }, []);

  // Calculate total amount for the service job
  const totalAmount = useMemo(() => {
    let total = 0;

    // Add service package total
    if (selectedServicePackage && selectedServicePackage.total_price) {
      total += parseFloat(selectedServicePackage.total_price || 0);
    }

    // Add additional services total
    total += selectedServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);

    // Add items/parts total
    total += serviceJobItems.reduce((sum, item) => {
      const itemTotal = (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)) + parseFloat(item.labour_charge || 0);
      return sum + itemTotal;
    }, 0);

    return total;
  }, [selectedServicePackage, selectedServices, serviceJobItems]);

  useEffect(() => {
    loadVehicles();
    loadVehicleDefects();
    loadPreInspectionRecommendations();
    loadServicePackages();
    loadServices();
    loadCustomers();
    if (isEdit && id) {
      loadServiceJob();
    }
  }, [id]);

  useEffect(() => {
    if (showVehicleModal) {
      loadBrands();
      loadCustomers();
    }
  }, [showVehicleModal]);

  useEffect(() => {
    if (selectedBrand && selectedBrand.id) {
      loadModels(selectedBrand.id);
    } else {
      setModels([]);
      setSelectedModel(null);
    }
  }, [selectedBrand]);

  const loadVehicles = async () => {
    try {
      const response = await vehicleService.getAll(1, 1000);
      setVehicles(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load vehicles');
    }
  };

  const loadVehicleDefects = async () => {
    try {
      const response = await vehicleDefectService.getAll(1, 1000);
      setVehicleDefects(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load vehicle defects');
    }
  };

  const loadPreInspectionRecommendations = async () => {
    try {
      const response = await preInspectionRecommendationService.getAll(1, 1000);
      setPreInspectionRecommendations(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load pre inspection recommendations');
    }
  };

  const loadServicePackages = async () => {
    try {
      const response = await servicePackageService.getAll(1, 1000);
      setServicePackages(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load service packages');
    }
  };

  const loadServices = async () => {
    try {
      const response = await serviceService.getAll(1, 1000);
      setServices(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  const loadServiceJob = async () => {
    try {
      // Ensure vehicles, service packages, and customers are loaded first
      if (vehicles.length === 0) {
        await loadVehicles();
      }
      if (servicePackages.length === 0) {
        await loadServicePackages();
      }
      if (customers.length === 0) {
        await loadCustomers();
      }
      
      const response = await serviceJobService.getById(id);
      const job = response.data.data;
      setValue('vehicle_id', job.vehicle_id);
      setValue('service_package_id', job.service_package_id || '');
      setValue('fuel_level', job.fuel_level || '');
      setValue('odometer_reading', job.odometer_reading ? Math.floor(job.odometer_reading).toString() : '');
      setValue('remarks', job.remarks || '');
      
      // Set selected vehicle - create vehicle object from job data
      if (job.vehicle_id) {
        const displayVehicle = {
          id: job.vehicle_id,
          reg_no: job.vehicle_reg_no,
          customer: job.vehicle_customer,
          brand_name: job.vehicle_brand_name,
          model_name: job.vehicle_model_name
        };
        setSelectedVehicle(displayVehicle);
        setOwnerName(job.vehicle_customer || '');
        
        // Set owner mobile from job data (from backend) or try to find customer
        if (job.owner_mobile) {
          setOwnerMobile(job.owner_mobile);
        } else if (job.vehicle_customer && customers.length > 0) {
          const customer = customers.find(c => c.full_name === job.vehicle_customer);
          if (customer) {
            setOwnerMobile(customer.mobile1 || customer.mobile2 || '');
          } else {
            setOwnerMobile('');
          }
        } else {
          setOwnerMobile('');
        }
      }
      
      // Set selected service package
      if (job.service_package_id && servicePackages.length > 0) {
        const servicePackage = servicePackages.find(sp => sp.id === job.service_package_id);
        if (servicePackage) {
          // Load full package details including services
          try {
            const packageResponse = await servicePackageService.getById(servicePackage.id);
            const fullPackage = packageResponse.data.data;
            if (fullPackage.services && Array.isArray(fullPackage.services)) {
              setPackageServices(fullPackage.services);
              // Calculate total_price from services
              const calculatedTotalPrice = fullPackage.services.reduce((sum, service) => {
                return sum + parseFloat(service.price || 0);
              }, 0);
              // Update selectedServicePackage with calculated total_price
              setSelectedServicePackage({
                ...servicePackage,
                total_price: calculatedTotalPrice
              });
            } else {
              setPackageServices([]);
              setSelectedServicePackage({
                ...servicePackage,
                total_price: servicePackage.total_price || 0
              });
            }
          } catch (error) {
            console.error('Failed to load service package details:', error);
            setPackageServices([]);
            setSelectedServicePackage({
              ...servicePackage,
              total_price: servicePackage.total_price || 0
            });
          }
        }
      } else if (job.service_package_id && job.service_package_name) {
        // Fallback: create service package object from job data
        // Try to load package services to calculate price
        try {
          const packageResponse = await servicePackageService.getById(job.service_package_id);
          const fullPackage = packageResponse.data.data;
          let calculatedTotalPrice = 0;
          if (fullPackage.services && Array.isArray(fullPackage.services)) {
            setPackageServices(fullPackage.services);
            // Calculate total_price from services
            calculatedTotalPrice = fullPackage.services.reduce((sum, service) => {
              return sum + parseFloat(service.price || 0);
            }, 0);
          } else {
            setPackageServices([]);
          }
          setSelectedServicePackage({
            id: job.service_package_id,
            name: job.service_package_name,
            total_price: calculatedTotalPrice
          });
        } catch (error) {
          setPackageServices([]);
          setSelectedServicePackage({
            id: job.service_package_id,
            name: job.service_package_name,
            total_price: 0
          });
        }
      } else {
        setPackageServices([]);
      }
      
      // Set defects
      if (job.defects) {
        setSelectedDefects(job.defects.map(d => d.id));
      }
      
      // Set recommendations
      if (job.recommendations) {
        setSelectedRecommendations(job.recommendations.map(r => r.id));
      }
      
      // Load services
      if (job.services && Array.isArray(job.services)) {
        setSelectedServices(job.services);
      }
      
      // Load items
      if (job.items) {
        setServiceJobItems(job.items || []);
      }
    } catch (error) {
      toast.error('Failed to load service job');
      navigate('/service-jobs');
    }
  };

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

  const loadModels = async (brandId) => {
    if (!brandId) {
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

  const handleVehicleSelect = (vehicle) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setValue('vehicle_id', vehicle.id);
      
      // Set owner name from vehicle customer field (check both customer_name and customer for compatibility)
      const customerName = vehicle.customer_name || vehicle.customer || '';
      setOwnerName(customerName);
      
      // Try to find customer by name to get mobile number
      if (customerName && customers.length > 0) {
        const customer = customers.find(c => c.full_name === customerName);
        if (customer) {
          setOwnerMobile(customer.mobile1 || customer.mobile2 || '');
        } else {
          // Try to get mobile from vehicle data if available
          setOwnerMobile(vehicle.customer_mobile1 || vehicle.customer_mobile2 || '');
        }
      } else {
        // Try to get mobile from vehicle data if available
        setOwnerMobile(vehicle.customer_mobile1 || vehicle.customer_mobile2 || '');
      }
    } else {
      setSelectedVehicle(null);
      setValue('vehicle_id', '');
      setOwnerName('');
      setOwnerMobile('');
    }
  };

  const handleServicePackageSelect = async (servicePackage) => {
    if (servicePackage) {
      setValue('service_package_id', servicePackage.id);
      
      // Load full package details including services to track duplicates
      try {
        const response = await servicePackageService.getById(servicePackage.id);
        const fullPackage = response.data.data;
        if (fullPackage.services && Array.isArray(fullPackage.services)) {
          setPackageServices(fullPackage.services);
          // Calculate total_price from services
          const calculatedTotalPrice = fullPackage.services.reduce((sum, service) => {
            return sum + parseFloat(service.price || 0);
          }, 0);
          // Update selectedServicePackage with calculated total_price
          setSelectedServicePackage({
            ...servicePackage,
            total_price: calculatedTotalPrice
          });
        } else {
          setPackageServices([]);
          setSelectedServicePackage({
            ...servicePackage,
            total_price: servicePackage.total_price || 0
          });
        }
      } catch (error) {
        console.error('Failed to load service package details:', error);
        setPackageServices([]);
        setSelectedServicePackage({
          ...servicePackage,
          total_price: servicePackage.total_price || 0
        });
      }
    } else {
      setSelectedServicePackage(null);
      setValue('service_package_id', '');
      setPackageServices([]);
    }
  };

  const handleAddDefect = () => {
    if (selectedDefect && !selectedDefects.includes(selectedDefect.id)) {
      setSelectedDefects(prev => [...prev, selectedDefect.id]);
      setSelectedDefect(null);
    }
  };

  const handleRemoveDefect = (defectId) => {
    setSelectedDefects(prev => prev.filter(id => id !== defectId));
  };

  const handleAddRecommendation = () => {
    if (selectedRecommendation && !selectedRecommendations.includes(selectedRecommendation.id)) {
      setSelectedRecommendations(prev => [...prev, selectedRecommendation.id]);
      setSelectedRecommendation(null);
    }
  };

  const handleRemoveRecommendation = (recommendationId) => {
    setSelectedRecommendations(prev => prev.filter(id => id !== recommendationId));
  };

  const handleAddItem = (item) => {
    // Check if item is already in the list
    const isAlreadyAdded = serviceJobItems.some(existingItem => existingItem.item_id === item.item_id);
    if (isAlreadyAdded) {
      toast.warning(`This item (${item.item_name || 'N/A'}) has already been added to the service job.`);
      return;
    }
    
    // Check if item corresponds to a service that's already in the selected package
    // Note: This checks if the item name matches any service name in the package
    // You may need to adjust this logic based on how items and services are related
    if (packageServices.length > 0) {
      const matchingService = packageServices.find(service => 
        service.name && item.item_name && 
        service.name.toLowerCase() === item.item_name.toLowerCase()
      );
      
      if (matchingService) {
        toast.warning(
          `This service "${matchingService.name}" is already included in the selected service package "${selectedServicePackage?.name || ''}". Adding it separately would create a duplicate.`
        );
        return;
      }
    }
    
    // Add single item to the list
    setServiceJobItems(prev => [...prev, item]);
    toast.success('Item added successfully');
  };

  const handleAddService = () => {
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }

    // Check if service is already added
    const isAlreadyAdded = selectedServices.some(service => service.id === selectedService.id);
    if (isAlreadyAdded) {
      toast.warning(`Service "${selectedService.name}" has already been added.`);
      setSelectedService(null);
      return;
    }

    // Check if service is already in the selected package
    if (packageServices.length > 0) {
      const isInPackage = packageServices.some(pkgService => pkgService.id === selectedService.id);
      if (isInPackage) {
        // Ask for confirmation before adding duplicate
        const serviceToAdd = selectedService;
        setPendingService(serviceToAdd);
        setSelectedService(null); // Clear the autocomplete input
        confirm(
          `Service "${serviceToAdd.name}" is already included in the selected service package "${selectedServicePackage?.name || ''}". Do you want to add it as a duplicate?`,
          handleConfirmDuplicateService
        );
        return;
      }
    }

    // Add service to the list
    addServiceToList(selectedService);
  };

  const handleConfirmDuplicateService = () => {
    if (pendingService) {
      addServiceToList(pendingService);
      setPendingService(null);
    }
  };

  const addServiceToList = (service) => {
    setSelectedServices(prev => [...prev, service]);
    setSelectedService(null);
    toast.success('Service added successfully');
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(prev => prev.filter(service => service.id !== serviceId));
    toast.success('Service removed successfully');
  };

  const handleRemoveItem = async (itemId) => {
    if (isEdit && id) {
      // Remove item from existing service job
      try {
        await serviceJobService.removeItem(id, itemId);
        setServiceJobItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Item removed successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to remove item');
      }
    } else {
      // Remove item from local state
      setServiceJobItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleVehicleFormSubmit = async (e) => {
    e.preventDefault();
    setVehicleFormLoading(true);
    try {
      const fullRegNo = regPrefix && regNumber 
        ? `${regPrefix} ${regNumber}`.trim()
        : regNumber || regPrefix;
      
      const vehicleData = {
        ...vehicleFormData,
        reg_no: fullRegNo,
        year_of_manufacture: vehicleFormData.year_of_manufacture ? parseInt(vehicleFormData.year_of_manufacture) : null,
        year_of_registration: vehicleFormData.year_of_registration ? parseInt(vehicleFormData.year_of_registration) : null
      };

      const response = await vehicleService.create(vehicleData);
      toast.success('Vehicle registered successfully');
      setShowVehicleModal(false);
      
      // Reset vehicle form
      setVehicleFormData({
        customer: '',
        vehicle_type: '',
        reg_no: '',
        brand_id: '',
        model_id: '',
        version: '',
        year_of_manufacture: '',
        year_of_registration: '',
        remarks: ''
      });
      setRegPrefix('');
      setRegNumber('');
      setSelectedBrand(null);
      setSelectedModel(null);
      setSelectedCustomer(null);
      
      // Reload vehicles and select the newly created one
      await loadVehicles();
      if (response.data && response.data.data) {
        const newVehicle = response.data.data;
        setSelectedVehicle(newVehicle);
        setValue('vehicle_id', newVehicle.id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register vehicle');
    } finally {
      setVehicleFormLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!values.vehicle_id) {
      toast.error('Please select a vehicle');
      return;
    }

    setLoading(true);
    try {
      const data = {
        vehicle_id: values.vehicle_id,
        service_package_id: values.service_package_id || null,
        fuel_level: values.fuel_level || null,
        odometer_reading: values.odometer_reading ? parseInt(values.odometer_reading, 10) : null,
        remarks: values.remarks || null,
        defects: selectedDefects,
        recommendations: selectedRecommendations,
        services: selectedServices.map(service => service.id),
        items: serviceJobItems.map(item => ({
          item_id: item.item_id,
          batch_number: item.batch_number || null,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          labour_charge: parseFloat(item.labour_charge || 0)
        })),
        status: 'pending'
      };

      if (isEdit) {
        await serviceJobService.update(id, data);
        toast.success('Service job updated successfully');
        navigate('/service-jobs');
      } else {
        await serviceJobService.create(data);
        toast.success('Service job created successfully');
        
        // Reset form for creating another job
        setValue('vehicle_id', '');
        setValue('service_package_id', '');
        setValue('fuel_level', '');
        setValue('odometer_reading', '');
        setValue('remarks', '');
        setSelectedVehicle(null);
        setSelectedServicePackage(null);
        setPackageServices([]);
        setSelectedServices([]);
        setSelectedService(null);
        setServiceListSearch('');
        setSelectedDefects([]);
        setSelectedRecommendations([]);
        setSelectedDefect(null);
        setSelectedRecommendation(null);
        setDefectListSearch('');
        setRecommendationListSearch('');
        setServiceJobItems([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const renderVehicleItem = (vehicle) => {
    const customerName = vehicle.customer_name || vehicle.customer || 'No Customer';
    const brandName = vehicle.brand_name || vehicle.vehicle_brand_name || '';
    const modelName = vehicle.model_name || vehicle.vehicle_model_name || '';
    const brandModel = brandName && modelName ? `${brandName} ${modelName}` : '';
    const parts = [vehicle.reg_no, customerName];
    if (brandModel) {
      parts.push(brandModel);
    }
    return parts.join(' | ');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Service Job' : 'Create New Service Job'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vehicle *</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <AutoComplete
                items={vehicles}
                onSelect={handleVehicleSelect}
                placeholder="Search vehicle by registration number or customer..."
                searchKey="reg_no"
                value={selectedVehicle ? renderVehicleItem(selectedVehicle) : ''}
                renderItem={renderVehicleItem}
              />
              {selectedVehicle && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setValue('vehicle_id', '');
                    setOwnerName('');
                    setOwnerMobile('');
                  }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '35%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '5px',
                    zIndex: 10
                  }}
                  title="Clear vehicle selection"
                >
                  &times;
                </button>
              )}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowVehicleModal(true)}
              style={{ whiteSpace: 'nowrap' }}
            >
              Register Vehicle
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Owner Name</label>
            <input
              type="text"
              value={ownerName}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-group">
            <label>Owner Mobile</label>
            <input
              type="text"
              value={ownerMobile}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Service Package</label>
          <div style={{ position: 'relative' }}>
            <AutoComplete
              items={servicePackages}
              onSelect={handleServicePackageSelect}
              placeholder="Search and select service package..."
              searchKey="name"
              value={selectedServicePackage ? `${selectedServicePackage.name} | Rs. ${parseFloat(selectedServicePackage.total_price || 0).toFixed(2)}` : ''}
              renderItem={(packageItem) => {
                const price = parseFloat(packageItem.total_price || 0).toFixed(2);
                return `${packageItem.name} | Rs. ${price}`;
              }}
            />
            {selectedServicePackage && (
              <button
                type="button"
                onClick={() => {
                  setSelectedServicePackage(null);
                  setValue('service_package_id', '');
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '35%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '5px',
                  zIndex: 10
                }}
                title="Clear service package selection"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Fuel Level</label>
          <select
            name="fuel_level"
            value={values.fuel_level}
            onChange={handleChange}
          >
            <option value="">Select fuel level</option>
            {fuelLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Odometer Reading</label>
          <input
            type="text"
            name="odometer_reading"
            value={values.odometer_reading}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow integers, max 6 digits
              if (value === '' || (/^\d+$/.test(value) && value.length <= 6)) {
                handleChange(e);
              }
            }}
            placeholder="Enter odometer reading"
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label>Vehicle Defects (Complaints by customer)</label>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            {/* Left Column - Selection */}
            <div style={{ flex: 1 }}>
              <AutoComplete
                items={vehicleDefects.filter(defect => !selectedDefects.includes(defect.id))}
                onSelect={(defect) => setSelectedDefect(defect)}
                placeholder="Search and select defect..."
                searchKey="name"
                value={selectedDefect?.name || ''}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddDefect}
                disabled={!selectedDefect}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Add
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
                  placeholder="Search selected defects..."
                  value={defectListSearch}
                  onChange={(e) => setDefectListSearch(e.target.value)}
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
                height: '150px',
                overflowY: 'auto'
              }}>
                {selectedDefects.length === 0 ? (
                  <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>
                    No defects selected
                  </p>
                ) : (() => {
                  const filteredDefects = selectedDefects.filter(defectId => {
                    if (!defectListSearch.trim()) return true;
                    const defect = vehicleDefects.find(d => d.id === defectId);
                    if (!defect) return false;
                    const searchLower = defectListSearch.toLowerCase();
                    return defect.name.toLowerCase().includes(searchLower) ||
                           (defect.description && defect.description.toLowerCase().includes(searchLower));
                  });
                  
                  if (filteredDefects.length === 0) {
                    return (
                      <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>
                        No defects match your search
                      </p>
                    );
                  }
                  
                  return filteredDefects.map(defectId => {
                    const defect = vehicleDefects.find(d => d.id === defectId);
                    if (!defect) return null;
                    return (
                      <div key={defectId} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#fff',
                        marginBottom: '5px',
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0'
                      }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', marginBottom: '2px' }}>{defect.name}</span>
                        {defect.description && (
                          <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>
                            {defect.description}
                          </span>
                        )}
                      </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDefect(defectId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '0 8px',
                            flexShrink: 0
                          }}
                          title="Remove"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Pre Inspection Recommendations</label>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            {/* Left Column - Selection */}
            <div style={{ flex: 1 }}>
              <AutoComplete
                items={preInspectionRecommendations.filter(rec => !selectedRecommendations.includes(rec.id))}
                onSelect={(rec) => setSelectedRecommendation(rec)}
                placeholder="Search and select recommendation..."
                searchKey="name"
                value={selectedRecommendation?.name || ''}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddRecommendation}
                disabled={!selectedRecommendation}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Add
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
                  placeholder="Search selected recommendations..."
                  value={recommendationListSearch}
                  onChange={(e) => setRecommendationListSearch(e.target.value)}
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
                height: '150px',
                overflowY: 'auto'
              }}>
                {selectedRecommendations.length === 0 ? (
                  <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>
                    No recommendations selected
                  </p>
                ) : (() => {
                  const filteredRecommendations = selectedRecommendations.filter(recId => {
                    if (!recommendationListSearch.trim()) return true;
                    const rec = preInspectionRecommendations.find(r => r.id === recId);
                    if (!rec) return false;
                    const searchLower = recommendationListSearch.toLowerCase();
                    return rec.name.toLowerCase().includes(searchLower) ||
                           (rec.description && rec.description.toLowerCase().includes(searchLower));
                  });
                  
                  if (filteredRecommendations.length === 0) {
                    return (
                      <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>
                        No recommendations match your search
                      </p>
                    );
                  }
                  
                  return filteredRecommendations.map(recId => {
                    const rec = preInspectionRecommendations.find(r => r.id === recId);
                    if (!rec) return null;
                    return (
                      <div key={recId} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#fff',
                        marginBottom: '5px',
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', marginBottom: '2px' }}>{rec.name}</span>
                          {rec.description && (
                            <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>
                              {rec.description}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRecommendation(recId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '0 8px',
                            flexShrink: 0
                          }}
                          title="Remove"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="form-group">
          <label>Additional Services</label>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            {/* Left Column - Selection */}
            <div style={{ flex: 1 }}>
              <AutoComplete
                items={services.filter(service => 
                  !selectedServices.some(s => s.id === service.id)
                )}
                onSelect={(service) => setSelectedService(service)}
                placeholder="Search and select service..."
                searchKey="name"
                value={selectedService?.name || ''}
                getItemStyle={(service) => {
                  // Check if service is already in the package
                  const isInPackage = packageServices.some(pkgService => pkgService.id === service.id);
                  if (isInPackage) {
                    return {
                      backgroundColor: '#ffebee',
                      color: '#c62828',
                      fontWeight: 500
                    };
                  }
                  return {};
                }}
                renderItem={(service) => {
                  const isInPackage = packageServices.some(pkgService => pkgService.id === service.id);
                  return (
                    <div>
                      <span>{service.name}</span>
                      {isInPackage && (
                        <span style={{ 
                          marginLeft: '10px', 
                          fontSize: '12px', 
                          color: '#c62828',
                          fontStyle: 'italic'
                        }}>
                          (Already in package)
                        </span>
                      )}
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Rs. {parseFloat(service.price || 0).toFixed(2)}
                      </div>
                    </div>
                  );
                }}
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
                  const filteredServices = selectedServices.filter(service => {
                    if (!serviceListSearch.trim()) return true;
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
                  
                  return filteredServices.map(service => (
                    <div key={service.id} style={{ 
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
                        {service.remarks && (
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                            {service.remarks}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service.id)}
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
                  ));
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
                    Rs. {selectedServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items/Parts Section */}
        <div className="form-group">
          <label>Parts/Items to Replace</label>
          <div style={{ marginBottom: '15px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowItemsModal(true)}
            >
              Add Item
            </button>
          </div>
          
          {serviceJobItems.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Batch</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Labour</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceJobItems.map((item) => {
                    const totalPrice = (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)) + parseFloat(item.labour_charge || 0);
                    return (
                      <tr key={item.id}>
                        <td>{item.item_name || 'N/A'}</td>
                        <td>{item.batch_number || '-'}</td>
                        <td>{parseFloat(item.quantity || 0).toFixed(2)}</td>
                        <td>{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                        <td>{parseFloat(item.labour_charge || 0).toFixed(2)}</td>
                        <td>{totalPrice.toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleRemoveItem(item.id)}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Remarks</label>
          <textarea
            name="remarks"
            value={values.remarks}
            onChange={handleChange}
            placeholder="Enter any additional recommendations or remarks..."
            rows="4"
          />
        </div>

        {/* Total Amount Section */}
        <div style={{
          marginTop: '20px',
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '2px solid #28a745',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#333' }}>
              Total Amount
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {selectedServicePackage && (
                <div>Service Package: Rs. {parseFloat(selectedServicePackage.total_price || 0).toFixed(2)}</div>
              )}
              {selectedServices.length > 0 && (
                <div>Additional Services: Rs. {selectedServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0).toFixed(2)}</div>
              )}
              {serviceJobItems.length > 0 && (
                <div>Items/Parts: Rs. {serviceJobItems.reduce((sum, item) => {
                  const itemTotal = (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)) + parseFloat(item.labour_charge || 0);
                  return sum + itemTotal;
                }, 0).toFixed(2)}</div>
              )}
            </div>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#28a745'
          }}>
            Rs. {totalAmount.toFixed(2)}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/service-jobs')}>
            Cancel
          </button>
        </div>
      </form>

      {/* Items Selection Modal */}
      <ItemSelectionModal
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        onAdd={handleAddItem}
      />

      {/* Confirmation Dialog for Duplicate Services */}
      <ConfirmDialog
        isOpen={isOpen}
        message={message}
        onConfirm={handleConfirm}
        onCancel={() => {
          handleCancel();
          setPendingService(null);
          setSelectedService(null);
        }}
      />

      {/* Vehicle Registration Modal */}
      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title="Register New Vehicle"
        size="large"
      >
        <form onSubmit={handleVehicleFormSubmit}>
          <div className="form-group">
            <label>Customer *</label>
            <AutoComplete
              items={customers}
              onSelect={(customer) => {
                if (customer) {
                  setSelectedCustomer(customer);
                  setVehicleFormData(prev => ({ ...prev, customer: customer.full_name }));
                } else {
                  setSelectedCustomer(null);
                  setVehicleFormData(prev => ({ ...prev, customer: '' }));
                }
              }}
              placeholder="Search customer..."
              searchKey="full_name"
              value={selectedCustomer?.full_name || ''}
            />
          </div>

          <div className="form-group">
            <label>Vehicle Type</label>
            <AutoComplete
              items={vehicleTypesList}
              onSelect={(type) => {
                setVehicleFormData(prev => ({ ...prev, vehicle_type: type?.name || '' }));
              }}
              placeholder="Search vehicle type..."
              searchKey="name"
              value={vehicleFormData.vehicle_type}
            />
          </div>

          <div className="form-group">
            <label>Registration Number *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: '0 0 120px' }}>
                <select
                  value={regPrefix}
                  onChange={(e) => setRegPrefix(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Prefix</option>
                  {VEHICLE_REGISTRATION_PREFIXES.map(prefix => (
                    <option key={prefix} value={prefix}>{prefix}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g., BJB 2929"
                  required
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
                  setVehicleFormData(prev => ({ ...prev, brand_id: brand.id }));
                } else {
                  setSelectedBrand(null);
                  setVehicleFormData(prev => ({ ...prev, brand_id: '' }));
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
                  setVehicleFormData(prev => ({ ...prev, model_id: model.id }));
                } else {
                  setSelectedModel(null);
                  setVehicleFormData(prev => ({ ...prev, model_id: '' }));
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
              value={vehicleFormData.version}
              onChange={(e) => setVehicleFormData(prev => ({ ...prev, version: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Year of Manufacture</label>
              <AutoComplete
                items={yearOptionsList}
                onSelect={(year) => {
                  setVehicleFormData(prev => ({ 
                    ...prev, 
                    year_of_manufacture: year?.value?.toString() || '' 
                  }));
                }}
                placeholder="Select year..."
                searchKey="name"
                value={vehicleFormData.year_of_manufacture}
              />
            </div>

            <div className="form-group">
              <label>Year of Registration</label>
              <AutoComplete
                items={yearOptionsList}
                onSelect={(year) => {
                  setVehicleFormData(prev => ({ 
                    ...prev, 
                    year_of_registration: year?.value?.toString() || '' 
                  }));
                }}
                placeholder="Select year..."
                searchKey="name"
                value={vehicleFormData.year_of_registration}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea
              value={vehicleFormData.remarks}
              onChange={(e) => setVehicleFormData(prev => ({ ...prev, remarks: e.target.value }))}
              rows="3"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowVehicleModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={vehicleFormLoading}
            >
              {vehicleFormLoading ? 'Registering...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceJobForm;

