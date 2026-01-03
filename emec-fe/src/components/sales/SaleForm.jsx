import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { saleService } from '../../services/saleService';
import { itemService } from '../../services/itemService';
import { stockService } from '../../services/stockService';
import AutoComplete from '../common/AutoComplete';
import { generateBillNumber } from '../../utils/helpers';
import { formatDate } from '../../utils/helpers';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../utils/constants';

const SaleForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bill_number: generateBillNumber('SALE'),
    sale_date: formatDate(new Date()),
    items: [],
    subtotal: 0,
    labour_charge: 0,
    discount: 0,
    total_amount: 0,
    payment_method: PAYMENT_METHODS.CASH,
    payment_details: []
  });
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [itemForm, setItemForm] = useState({
    item_id: '',
    batch_number: '',
    quantity: '',
    unit_price: '',
    labour_charge: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    payment_method: PAYMENT_METHODS.CASH,
    amount: '',
    bank_name: '',
    card_type: '',
    card_last_four: '',
    reference_number: '',
    cheque_date: '',
    cheque_name: '',
    remarks: ''
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

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

  const handleBarcodeScan = async (e) => {
    if (e.key === 'Enter' && barcodeInput) {
      try {
        const response = await itemService.getByBarcode(barcodeInput);
        const item = response.data.data;
        handleItemSelect(item);
        setBarcodeInput('');
      } catch (error) {
        toast.error('Item not found with this barcode');
      }
    }
  };

  const handleItemSelect = async (item) => {
    setSelectedItem(item);
    try {
      const batches = await stockService.getBatchesByItemId(item.id);
      if (batches.data.data.length > 0) {
        const firstBatch = batches.data.data[0];
        setItemForm({
          ...itemForm,
          item_id: item.id,
          batch_number: firstBatch.batch_number,
          unit_price: '0',
          quantity: '1',
          labour_charge: '0'
        });
      } else {
        toast.error('No stock available for this item');
      }
    } catch (error) {
      toast.error('Failed to load stock batches');
    }
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
      batch_number: '',
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

  const handleAddPayment = () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setFormData({
      ...formData,
      payment_details: [...formData.payment_details, { ...paymentForm, amount: parseFloat(paymentForm.amount) }]
    });

    setPaymentForm({
      payment_method: PAYMENT_METHODS.CASH,
      amount: '',
      bank_name: '',
      card_type: '',
      card_last_four: '',
      reference_number: '',
      cheque_date: '',
      cheque_name: '',
      remarks: ''
    });
    setShowPaymentModal(false);
  };

  const handleRemovePayment = (index) => {
    setFormData({
      ...formData,
      payment_details: formData.payment_details.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const totalPaid = formData.payment_details.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    if (totalPaid !== formData.total_amount) {
      toast.error('Payment amount must equal total amount');
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
        })),
        payment_details: formData.payment_details.map(p => ({
          ...p,
          amount: parseFloat(p.amount)
        }))
      };
      await saleService.create(data);
      toast.success('Sale bill created successfully');
      navigate('/sales');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Add New Sale</h2>
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
            <label>Sale Date *</label>
            <input
              type="date"
              value={formData.sale_date}
              onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Scan Barcode</label>
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyPress={handleBarcodeScan}
            placeholder="Scan or enter barcode and press Enter"
            style={{ width: '100%', padding: '8px' }}
          />
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
              placeholder="Batch"
              value={itemForm.batch_number}
              onChange={(e) => setItemForm({ ...itemForm, batch_number: e.target.value })}
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
                  <th>Batch</th>
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
                      <td>{item.batch_number}</td>
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

        <div style={{ marginTop: '20px' }}>
          <h3>Payment Details</h3>
          <button type="button" className="btn btn-primary" onClick={() => setShowPaymentModal(true)}>
            Add Payment
          </button>
          
          {formData.payment_details.length > 0 && (
            <table className="table" style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.payment_details.map((payment, index) => (
                  <tr key={index}>
                    <td>{PAYMENT_METHOD_LABELS[payment.payment_method]}</td>
                    <td>{parseFloat(payment.amount).toFixed(2)}</td>
                    <td>
                      {payment.reference_number && `Ref: ${payment.reference_number}`}
                      {payment.card_last_four && `Card: ****${payment.card_last_four}`}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleRemovePayment(index)}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showPaymentModal && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Payment</h3>
                <button className="modal-close" onClick={() => setShowPaymentModal(false)}>&times;</button>
              </div>
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              {paymentForm.payment_method === PAYMENT_METHODS.CARD && (
                <>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      value={paymentForm.bank_name}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Card Type</label>
                    <input
                      type="text"
                      value={paymentForm.card_type}
                      onChange={(e) => setPaymentForm({ ...paymentForm, card_type: e.target.value })}
                      placeholder="e.g., Visa, Mastercard"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last 4 Digits</label>
                    <input
                      type="text"
                      value={paymentForm.card_last_four}
                      onChange={(e) => setPaymentForm({ ...paymentForm, card_last_four: e.target.value })}
                      maxLength="4"
                    />
                  </div>
                  <div className="form-group">
                    <label>Reference Number</label>
                    <input
                      type="text"
                      value={paymentForm.reference_number}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                    />
                  </div>
                </>
              )}
              {paymentForm.payment_method === PAYMENT_METHODS.BANK_TRANSFER && (
                <>
                  <div className="form-group">
                    <label>Reference Number</label>
                    <input
                      type="text"
                      value={paymentForm.reference_number}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Remarks</label>
                    <textarea
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    />
                  </div>
                </>
              )}
              {paymentForm.payment_method === PAYMENT_METHODS.CHEQUE && (
                <>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      value={paymentForm.bank_name}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cheque Name</label>
                    <input
                      type="text"
                      value={paymentForm.cheque_name}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cheque_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cheque Date</label>
                    <input
                      type="date"
                      value={paymentForm.cheque_date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cheque_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Remarks</label>
                    <textarea
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-primary" onClick={handleAddPayment}>
                  Add Payment
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Sale'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/sales')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SaleForm;

