import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { purchaseService } from '../../services/purchaseService';
import { supplierService } from '../../services/supplierService';
import { itemService } from '../../services/itemService';
import AutoComplete from '../common/AutoComplete';
import { generateBillNumber } from '../../utils/helpers';
import { formatDate } from '../../utils/helpers';

const PurchaseForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bill_number: generateBillNumber('PUR'),
    supplier_id: '',
    purchase_date: formatDate(new Date()),
    items: []
  });
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    item_id: '',
    batch_number: '',
    quantity: '',
    free_quantity: '',
    unit_price: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
    loadItems();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll(1, 1000);
      setSuppliers(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    }
  };

  const loadItems = async () => {
    try {
      const response = await itemService.getAll(1, 1000);
      setItems(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load items');
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setItemForm({
      ...itemForm,
      item_id: item.id,
      batch_number: `BATCH-${Date.now()}`
    });
  };

  const handleAddItem = () => {
    if (!itemForm.item_id || !itemForm.quantity || !itemForm.unit_price) {
      toast.error('Please fill all required fields');
      return;
    }

    const totalPrice = parseFloat(itemForm.quantity) * parseFloat(itemForm.unit_price);
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
      batch_number: '',
      quantity: '',
      free_quantity: '',
      unit_price: ''
    });
    setSelectedItem(null);
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
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
        supplier_id: formData.supplier_id,
        total_amount: calculateTotal(),
        items: formData.items.map(item => ({
          ...item,
          item_id: item.item_id,
          quantity: parseFloat(item.quantity),
          free_quantity: parseFloat(item.free_quantity || 0),
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price)
        }))
      };
      await purchaseService.create(data);
      toast.success('Purchase bill created successfully');
      navigate('/purchases');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Add New Purchase</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Bill Number *</label>
            <input
              type="text"
              value={formData.bill_number}
              onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Purchase Date *</label>
            <input
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Supplier *</label>
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '30px', marginBottom: '20px' }}>
          <h3>Add Items</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <AutoComplete
              items={items}
              onSelect={handleItemSelect}
              placeholder="Search item..."
              searchKey="item_name"
              value={selectedItem?.item_name || ''}
            />
            <input
              type="text"
              placeholder="Batch Number"
              value={itemForm.batch_number}
              onChange={(e) => setItemForm({ ...itemForm, batch_number: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity *"
              value={itemForm.quantity}
              onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
              step="0.01"
              min="0"
            />
            <input
              type="number"
              placeholder="Free Qty"
              value={itemForm.free_quantity}
              onChange={(e) => setItemForm({ ...itemForm, free_quantity: e.target.value })}
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
                  <th>Batch</th>
                  <th>Quantity</th>
                  <th>Free Qty</th>
                  <th>Unit Price</th>
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
                      <td>{item.batch_number}</td>
                      <td>{item.quantity}</td>
                      <td>{item.free_quantity || 0}</td>
                      <td>{parseFloat(item.unit_price).toFixed(2)}</td>
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
              <tfoot>
                <tr>
                  <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Amount:</td>
                  <td style={{ fontWeight: 'bold' }}>{calculateTotal().toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Purchase'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/purchases')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;

