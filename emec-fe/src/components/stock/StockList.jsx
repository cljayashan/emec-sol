import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { stockService } from '../../services/stockService';
import { itemService } from '../../services/itemService';
import DataGrid from '../common/DataGrid';
import Paginator from '../common/Paginator';

const StockList = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemId, setItemId] = useState('');
  const [items, setItems] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    loadStock();
  }, [currentPage, itemId]);

  const loadItems = async () => {
    try {
      const response = await itemService.getAll(1, 1000);
      setItems(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load items');
    }
  };

  const loadStock = async () => {
    try {
      setLoading(true);
      const response = await stockService.getAll(currentPage, itemsPerPage, itemId || null);
      setStock(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'item_name', label: 'Item Name' },
    { key: 'batch_number', label: 'Batch Number' },
    { key: 'quantity', label: 'Quantity', render: (val) => parseFloat(val || 0).toFixed(2) },
    { key: 'available_quantity', label: 'Available Quantity', render: (val) => parseFloat(val || 0).toFixed(2) }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Stock</h2>
        <button className="btn btn-primary" onClick={() => navigate('/stock/adjust')}>
          Stock Adjustment
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Item:</label>
        <select
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          style={{ padding: '8px', width: '300px', marginLeft: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">All Items</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.item_name}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataGrid columns={columns} data={stock} />
          <Paginator
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default StockList;

