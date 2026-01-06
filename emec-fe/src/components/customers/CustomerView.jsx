import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customerService } from '../../services/customerService';

const CustomerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const response = await customerService.getById(id);
      setCustomer(response.data.data);
    } catch (error) {
      toast.error('Failed to load customer');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Customer Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/customers')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Full Name:</strong> {customer.full_name}
        </div>
        <div>
          <strong>Name with Initials:</strong> {customer.name_with_initials || 'N/A'}
        </div>
        <div>
          <strong>NIC:</strong> {customer.nic || 'N/A'}
        </div>
        <div>
          <strong>Mobile 1:</strong> {customer.mobile1 || 'N/A'}
        </div>
        <div>
          <strong>Mobile 2:</strong> {customer.mobile2 || 'N/A'}
        </div>
        <div>
          <strong>Address:</strong> {customer.address || 'N/A'}
        </div>
        <div>
          <strong>Email Address:</strong> {customer.email_address || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(customer.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/customers/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default CustomerView;

