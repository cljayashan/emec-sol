import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { itemService } from '../../services/itemService';
import { stockService } from '../../services/stockService';
import AutoComplete from './AutoComplete';
import Modal from './Modal';

const ItemSelectionModal = ({ isOpen, onClose, onAdd }) => {
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
  const [availableBatches, setAvailableBatches] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

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
        // Check if there's any available stock
        const hasStock = batches.data.data.some(batch => parseFloat(batch.available_quantity || 0) > 0);
        
        if (!hasStock) {
          toast.warning(`No stock available for ${item.item_name}. Quantity and other fields are disabled.`);
          setAvailableBatches([]);
          setItemForm({
            ...itemForm,
            item_id: item.id,
            batch_number: '',
            unit_price: '0',
            quantity: '0',
            labour_charge: '0'
          });
        } else {
          // Filter batches with stock and reverse order (newest first for display, but FIFO for default selection)
          const batchesWithStock = batches.data.data.filter(batch => parseFloat(batch.available_quantity || 0) > 0);
          // Reverse for display (newest first in dropdown)
          setAvailableBatches([...batchesWithStock].reverse());
          // Select oldest batch by default (FIFO - First In First Out)
          const oldestBatch = batchesWithStock[0]; // First batch is oldest (from backend ASC order)
          if (oldestBatch) {
            // Use sale_price from stock table, fallback to item.selling_price or 0
            const salePrice = oldestBatch.sale_price || item.selling_price || '0';
            setItemForm({
              ...itemForm,
              item_id: item.id,
              batch_number: oldestBatch.batch_number,
              unit_price: salePrice.toString(),
              quantity: '1',
              labour_charge: '0'
            });
          }
        }
      } else {
        toast.warning(`No stock available for ${item.item_name}. Quantity and other fields are disabled.`);
        setAvailableBatches([]);
        setItemForm({
          ...itemForm,
          item_id: item.id,
          batch_number: '',
          unit_price: '0',
          quantity: '0',
          labour_charge: '0'
        });
      }
    } catch (error) {
      toast.warning(`No stock available for ${item.item_name}. Quantity and other fields are disabled.`);
      setAvailableBatches([]);
      setItemForm({
        ...itemForm,
        item_id: item.id,
        batch_number: '',
        unit_price: '0',
        quantity: '0',
        labour_charge: '0'
      });
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
      id: `temp-${Date.now()}`,
      total_price: totalPrice,
      item_name: selectedItem?.item_name || 'N/A'
    };

    // Add item and close modal
    onAdd(newItem);
    
    // Reset form
    setItemForm({
      item_id: '',
      batch_number: '',
      quantity: '',
      unit_price: '',
      labour_charge: ''
    });
    setSelectedItem(null);
    setAvailableBatches([]);
    setBarcodeInput('');
    onClose();
  };

  const handleClose = () => {
    setItemForm({
      item_id: '',
      batch_number: '',
      quantity: '',
      unit_price: '',
      labour_charge: ''
    });
    setSelectedItem(null);
    setAvailableBatches([]);
    setBarcodeInput('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Parts/Items" size="large">
      <div style={{ marginBottom: '20px' }}>
        <h3>Add Items</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>Scan Barcode</label>
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={handleBarcodeScan}
              placeholder="Scan or enter barcode and press Enter"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>Product Name *</label>
            <AutoComplete
              items={items}
              onSelect={handleItemSelect}
              placeholder="Search by product name..."
              searchKey="item_name"
              value={selectedItem?.item_name || ''}
              searchOnlyKey={true}
              renderItem={(item) => {
                return `${item.item_name}${item.brand ? ` - ${item.brand}` : ''}${item.barcode ? ` (${item.barcode})` : ''}`;
              }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>Batch</label>
            {availableBatches.length > 0 ? (
            <select
              value={itemForm.batch_number}
              onChange={(e) => {
                const selectedBatchNumber = e.target.value;
                if (selectedBatchNumber) {
                  const selectedBatch = availableBatches.find(b => b.batch_number === selectedBatchNumber);
                  // Update unit_price from selected batch's sale_price
                  const salePrice = selectedBatch?.sale_price || '0';
                  setItemForm({ 
                    ...itemForm, 
                    batch_number: selectedBatchNumber,
                    unit_price: salePrice.toString()
                  });
                } else {
                  // Batch cleared, keep current unit_price
                  setItemForm({ 
                    ...itemForm, 
                    batch_number: ''
                  });
                }
              }}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', width: '100%' }}
            >
                <option value="">Select Batch</option>
                {availableBatches.map((batch) => {
                  const batchDate = batch.created_at ? new Date(batch.created_at).toLocaleDateString() : '';
                  return (
                    <option key={batch.id} value={batch.batch_number || ''}>
                      {batch.batch_number || 'No Batch'} (Qty: {parseFloat(batch.available_quantity || 0).toFixed(2)}){batchDate ? ` - ${batchDate}` : ''}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Batch (optional)"
                value={itemForm.batch_number}
                onChange={(e) => setItemForm({ ...itemForm, batch_number: e.target.value })}
                disabled={selectedItem && availableBatches.length === 0}
                style={{ 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  width: '100%',
                  backgroundColor: selectedItem && availableBatches.length === 0 ? '#f5f5f5' : 'white',
                  cursor: selectedItem && availableBatches.length === 0 ? 'not-allowed' : 'text'
                }}
              />
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>Qty *</label>
            <input
              type="text"
              placeholder="Qty"
              value={itemForm.quantity}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow integers (0-9) and limit to 5 digits
                if (value === '' || (/^\d+$/.test(value) && value.length <= 5 && parseInt(value) <= 99999)) {
                  setItemForm({ ...itemForm, quantity: value });
                }
              }}
              maxLength="5"
              disabled={selectedItem && availableBatches.length === 0}
              readOnly={selectedItem && availableBatches.length === 0}
              style={{ 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                width: '100%',
                backgroundColor: selectedItem && availableBatches.length === 0 ? '#f5f5f5' : 'white',
                cursor: selectedItem && availableBatches.length === 0 ? 'not-allowed' : 'text'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>Unit Price *</label>
            <input
              type="text"
              placeholder="Unit Price"
              value={itemForm.unit_price}
              onChange={(e) => {
                const value = e.target.value;
                // Allow numbers with optional decimal point and up to 2 decimal places
                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                  setItemForm({ ...itemForm, unit_price: value });
                }
              }}
              disabled={selectedItem && availableBatches.length === 0}
              readOnly={selectedItem && availableBatches.length === 0}
              style={{ 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                width: '100%',
                backgroundColor: selectedItem && availableBatches.length === 0 ? '#f5f5f5' : 'white',
                cursor: selectedItem && availableBatches.length === 0 ? 'not-allowed' : 'text'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>Labour Charge</label>
            <input
              type="text"
              placeholder="Labour Charge"
              value={itemForm.labour_charge}
              onChange={(e) => {
                const value = e.target.value;
                // Allow numbers with optional decimal point and up to 2 decimal places
                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                  setItemForm({ ...itemForm, labour_charge: value });
                }
              }}
              disabled={selectedItem && availableBatches.length === 0}
              readOnly={selectedItem && availableBatches.length === 0}
              style={{ 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                width: '100%',
                backgroundColor: selectedItem && availableBatches.length === 0 ? '#f5f5f5' : 'white',
                cursor: selectedItem && availableBatches.length === 0 ? 'not-allowed' : 'text'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>
          Cancel
        </button>
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={handleAddItem}
          disabled={!itemForm.item_id || !itemForm.quantity || !itemForm.unit_price || (selectedItem && availableBatches.length === 0)}
        >
          Add Item
        </button>
      </div>
    </Modal>
  );
};

export default ItemSelectionModal;
