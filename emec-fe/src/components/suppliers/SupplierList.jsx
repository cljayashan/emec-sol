import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supplierService } from '../../services/supplierService';
import DataGrid from '../common/DataGrid';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { isOpen, message, confirm, handleConfirm, handleCancel } = useConfirm();
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, [currentPage]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getAll(currentPage, itemsPerPage);
      console.log('Suppliers response:', response.data);
      if (response.data.success) {
        setSuppliers(response.data.data.data || []);
        setTotalItems(response.data.data.total || 0);
      } else {
        toast.error(response.data.message || 'Failed to load suppliers');
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load suppliers';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/suppliers/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/suppliers/${row.id}/edit`);
    } else if (action === 'delete') {
      setDeleteId(row.id);
      confirm('Are you sure you want to delete this supplier?', handleDelete);
    }
  };

  const handleDelete = async () => {
    try {
      await supplierService.delete(deleteId);
      toast.success('Supplier deleted successfully');
      loadSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' }
  ];

  const actions = [
    { name: 'view', label: 'View', color: 'primary' },
    { name: 'edit', label: 'Edit', color: 'secondary' },
    { name: 'delete', label: 'Delete', color: 'danger' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Suppliers</h2>
        <button className="btn btn-primary" onClick={() => navigate('/suppliers/new')}>
          Add New Supplier
        </button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataGrid columns={columns} data={suppliers} actions={actions} onAction={handleAction} />
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

export default SupplierList;

