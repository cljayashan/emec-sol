import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customerService } from '../../services/customerService';
import { useForm } from '../../hooks/useForm';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id;
  const returnTo = location.state?.returnTo;
  const { values, handleChange, setValue, setValues } = useForm({ 
    full_name: '', 
    name_with_initials: '',
    nic: '',
    mobile1: '',
    mobile2: '',
    address: '',
    email_address: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadCustomer();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoadingData(true);
      const response = await customerService.getById(id);
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const customer = response.data.data;
        console.log('Customer data:', customer);
        
        // Update all values at once
        setValues({
          full_name: customer.full_name || '',
          name_with_initials: customer.name_with_initials || '',
          nic: customer.nic || '',
          mobile1: customer.mobile1 || '',
          mobile2: customer.mobile2 || '',
          address: customer.address || '',
          email_address: customer.email_address || ''
        });
        
        console.log('Form values set');
      } else {
        console.error('Invalid response:', response.data);
        toast.error('Failed to load customer data');
        navigate('/customers');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load customer';
      toast.error(errorMessage);
      navigate('/customers');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await customerService.update(id, values);
        toast.success('Customer updated successfully');
        navigate(returnTo || '/customers');
      } else {
        await customerService.create(values);
        toast.success('Customer created successfully');
        // Navigate back to the return path if provided, otherwise go to customers list
        navigate(returnTo || '/customers');
      }
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
          <h2 className="card-title">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h2>
        </div>
        <p>Loading customer data...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={values.full_name || ''}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Name with Initials</label>
          <input
            type="text"
            name="name_with_initials"
            value={values.name_with_initials || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>NIC</label>
          <input
            type="text"
            name="nic"
            value={values.nic || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Mobile 1</label>
          <input
            type="text"
            name="mobile1"
            value={values.mobile1 || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Mobile 2</label>
          <input
            type="text"
            name="mobile2"
            value={values.mobile2 || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={values.address || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email_address"
            value={values.email_address || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || loadingData}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(returnTo || '/customers')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;

