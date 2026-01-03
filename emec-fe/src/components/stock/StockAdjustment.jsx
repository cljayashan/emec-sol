import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { stockService } from '../../services/stockService';
import { itemService } from '../../services/itemService';
import AutoComplete from '../common/AutoComplete';

const StockAdjustment = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await itemService.getAll(1, 1000);
      setItems(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load items');
    }
  };

  const handleItemSelect = async (item) => {
    setSelectedItem(item);
    try {
      const response = await stockService.getBatchesByItemId(item.id);
      setBatches(response.data.data);
    } catch (error) {
      toast.error('Failed to load batches');
    }
  };

  const handleAdjustment = (batch, newQuantity) => {
    const existingIndex = adjustments.findIndex(
      a => a.item_id === selectedItem.id && a.batch_number === batch.batch_number
    );

    const adjustment = {
      item_id: selectedItem.id,
      batch_number: batch.batch_number,
      old_quantity: batch.available_quantity,
      new_quantity: parseFloat(newQuantity),
      adjustment_quantity: parseFloat(newQuantity) - parseFloat(batch.available_quantity),
      reason: ''
    };

    if (existingIndex >= 0) {
      const newAdjustments = [...adjustments];
      newAdjustments[existingIndex] = adjustment;
      setAdjustments(newAdjustments);
    } else {
      setAdjustments([...adjustments, adjustment]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (adjustments.length === 0) {
      toast.error('Please make at least one adjustment');
      return;
    }

    setLoading(true);
    try {
      for (const adjustment of adjustments) {
        await stockService.adjust({
          ...adjustment,
          adjusted_by: 'User'
        });
      }
      toast.success('Stock adjusted successfully');
      navigate('/stock');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Stock Adjustment</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/stock')}>
          Back to Stock
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Item</label>
          <AutoComplete
            items={items}
            onSelect={handleItemSelect}
            placeholder="Search item..."
            searchKey="item_name"
            value={selectedItem?.item_name || ''}
          />
        </div>

        {selectedItem && batches.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Batches for {selectedItem.item_name}</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Current Quantity</th>
                  <th>Available Quantity</th>
                  <th>New Quantity</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, index) => {
                  const adjustment = adjustments.find(
                    a => a.item_id === selectedItem.id && a.batch_number === batch.batch_number
                  );
                  return (
                    <tr key={index}>
                      <td>{batch.batch_number}</td>
                      <td>{parseFloat(batch.quantity).toFixed(2)}</td>
                      <td>{parseFloat(batch.available_quantity).toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          defaultValue={adjustment ? adjustment.new_quantity : batch.available_quantity}
                          step="0.01"
                          min="0"
                          onChange={(e) => handleAdjustment(batch, e.target.value)}
                          style={{ width: '100px', padding: '4px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          defaultValue={adjustment ? adjustment.reason : ''}
                          onChange={(e) => {
                            const adj = adjustments.find(
                              a => a.item_id === selectedItem.id && a.batch_number === batch.batch_number
                            );
                            if (adj) {
                              adj.reason = e.target.value;
                              setAdjustments([...adjustments]);
                            }
                          }}
                          placeholder="Reason for adjustment"
                          style={{ width: '200px', padding: '4px' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {adjustments.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Adjustments Summary</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Old Quantity</th>
                  <th>New Quantity</th>
                  <th>Adjustment</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adj, index) => (
                  <tr key={index}>
                    <td>{adj.batch_number}</td>
                    <td>{parseFloat(adj.old_quantity).toFixed(2)}</td>
                    <td>{parseFloat(adj.new_quantity).toFixed(2)}</td>
                    <td style={{ color: adj.adjustment_quantity >= 0 ? 'green' : 'red' }}>
                      {adj.adjustment_quantity >= 0 ? '+' : ''}{adj.adjustment_quantity.toFixed(2)}
                    </td>
                    <td>{adj.reason || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || adjustments.length === 0}>
            {loading ? 'Saving...' : 'Save Adjustments'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/stock')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockAdjustment;

