import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { itemService } from '../../services/itemService';
import DataGrid from '../common/DataGrid';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { isOpen, message, confirm, handleConfirm, handleCancel } = useConfirm();
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadItems();
  }, [currentPage, searchTerm]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemService.getAll(currentPage, itemsPerPage, searchTerm);
      setItems(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/items/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/items/${row.id}/edit`);
    } else if (action === 'delete') {
      setDeleteId(row.id);
      confirm('Are you sure you want to delete this item?', handleDelete);
    }
  };

  const handleDelete = async () => {
    try {
      await itemService.delete(deleteId);
      toast.success('Item deleted successfully');
      loadItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const columns = [
    { key: 'item_name', label: 'Item Name' },
    { key: 'brand', label: 'Brand' },
    { key: 'category_name', label: 'Category' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'measurement_unit', label: 'Unit' }
  ];

  const actions = [
    { name: 'view', label: 'View', color: 'primary' },
    { name: 'edit', label: 'Edit', color: 'secondary' },
    { name: 'delete', label: 'Delete', color: 'danger' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Items</h2>
        <button className="btn btn-primary" onClick={() => navigate('/items/new')}>
          Add New Item
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '300px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataGrid columns={columns} data={items} actions={actions} onAction={handleAction} />
          <Paginator
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      
      <ConfirmDialog
        isOpen={isOpen}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ItemList;

