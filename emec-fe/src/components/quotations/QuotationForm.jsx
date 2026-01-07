import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { quotationService } from '../../services/quotationService';
import { itemService } from '../../services/itemService';
import { customerService } from '../../services/customerService';
import AutoComplete from '../common/AutoComplete';
import { generateQuotationNumber } from '../../utils/helpers';
import { formatDate } from '../../utils/helpers';
import { QUOTATION_STATUS, QUOTATION_STATUS_LABELS } from '../../utils/constants';

const QuotationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [formData, setFormData] = useState({
    quotation_number: generateQuotationNumber(),
    quotation_date: formatDate(new Date()),
    customer_id: '',
    items: [],
    subtotal: 0,
    labour_charge: 0,
    discount: 0,
    total_amount: 0,
    status: QUOTATION_STATUS.PENDING
  });
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [itemForm, setItemForm] = useState({
    item_id: '',
    quantity: '',
    unit_price: '',
    labour_charge: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
    loadCustomers();
  }, []);

  useEffect(() => {
    if (isEdit && customers.length > 0) {
      loadQuotation();
    }
  }, [id, customers]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.labour_charge, formData.discount]);

  const loadItems = async () => {
    try {
      const response = await itemService.getAll(1, 1000);
      setItems(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load items');
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

  const loadQuotation = async () => {
    try {
      const response = await quotationService.getById(id);
      const quotation = response.data.data;
      setFormData({
        quotation_number: quotation.quotation_number,
        quotation_date: formatDate(quotation.quotation_date),
        customer_id: quotation.customer_id || '',
        items: quotation.items || [],
        subtotal: quotation.subtotal || 0,
        labour_charge: quotation.labour_charge || 0,
        discount: quotation.discount || 0,
        total_amount: quotation.total_amount || 0,
        status: quotation.status || QUOTATION_STATUS.PENDING
      });
      
      // Set selected customer if customer_id exists
      if (quotation.customer_id && customers.length > 0) {
        const customer = customers.find(c => c.id === quotation.customer_id);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }
    } catch (error) {
      toast.error('Failed to load quotation');
      navigate('/quotations');
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setItemForm({
      ...itemForm,
      item_id: item.id,
      unit_price: '0',
      quantity: '1',
      labour_charge: '0'
    });
  };

  const handleAddItem = () => {
    if (!itemForm.item_id || !itemForm.quantity || !itemForm.unit_price) {
      toast.error('Please fill all required fields');
      return;
    }

    const totalPrice = (parseFloat(itemForm.quantity) * parseFloat(itemForm.unit_price)) + parseFloat(itemForm.labour_charge || 0);
    const newItem = {
      ...itemForm,
      total_price: totalPrice
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });

    setItemForm({
      item_id: '',
      quantity: '',
      unit_price: '',
      labour_charge: ''
    });
    setSelectedItem(null);
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0);
    const itemLabour = formData.items.reduce((sum, item) => sum + parseFloat(item.labour_charge || 0), 0);
    const totalLabour = itemLabour + parseFloat(formData.labour_charge || 0);
    const discount = parseFloat(formData.discount || 0);
    const total = subtotal + totalLabour - discount;

    setFormData({
      ...formData,
      subtotal,
      total_amount: total
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        items: formData.items.map(item => ({
          ...item,
          item_id: item.item_id,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          labour_charge: parseFloat(item.labour_charge || 0),
          total_price: parseFloat(item.total_price)
        }))
      };
      if (isEdit) {
        await quotationService.update(id, data);
        toast.success('Quotation updated successfully');
      } else {
        await quotationService.create(data);
        toast.success('Quotation created successfully');
      }
      navigate('/quotations');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Quotation' : 'Add New Quotation'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Quotation Number *</label>
            <input
              type="text"
              value={formData.quotation_number}
              onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Quotation Date *</label>
            <input
              type="date"
              value={formData.quotation_date}
              onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Customer</label>
            <AutoComplete
              items={customers}
              onSelect={(customer) => {
                if (customer) {
                  setSelectedCustomer(customer);
                  setFormData({ ...formData, customer_id: customer.id });
                } else {
                  setSelectedCustomer(null);
                  setFormData({ ...formData, customer_id: '' });
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
          
          {isEdit && (
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {Object.entries(QUOTATION_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', marginBottom: '20px' }}>
          <h3>Add Items</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <AutoComplete
              items={items}
              onSelect={handleItemSelect}
              placeholder="Search item..."
              searchKey="item_name"
              value={selectedItem?.item_name || ''}
            />
            <input
              type="number"
              placeholder="Qty *"
              value={itemForm.quantity}
              onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
              step="0.01"
              min="0"
            />
            <input
              type="number"
              placeholder="Unit Price *"
              value={itemForm.unit_price}
              onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })}
              step="0.01"
              min="0"
            />
            <input
              type="number"
              placeholder="Labour"
              value={itemForm.labour_charge}
              onChange={(e) => setItemForm({ ...itemForm, labour_charge: e.target.value })}
              step="0.01"
              min="0"
            />
            <button type="button" className="btn btn-primary" onClick={handleAddItem}>
              Add
            </button>
          </div>
        </div>

        {formData.items.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Items</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Labour</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => {
                  const itemName = items.find(i => i.id === item.item_id)?.item_name || 'N/A';
                  return (
                    <tr key={index}>
                      <td>{itemName}</td>
                      <td>{item.quantity}</td>
                      <td>{parseFloat(item.unit_price).toFixed(2)}</td>
                      <td>{parseFloat(item.labour_charge || 0).toFixed(2)}</td>
                      <td>{parseFloat(item.total_price).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleRemoveItem(index)}
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

        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Bill Level Labour Charge</label>
            <input
              type="number"
              value={formData.labour_charge}
              onChange={(e) => setFormData({ ...formData, labour_charge: e.target.value })}
              step="0.01"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Discount</label>
            <input
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Subtotal:</strong> <span>{formData.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Labour Charge:</strong> <span>{formData.labour_charge || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Discount:</strong> <span>{formData.discount || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
            <strong>Total Amount:</strong> <span>{formData.total_amount.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/quotations')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;

