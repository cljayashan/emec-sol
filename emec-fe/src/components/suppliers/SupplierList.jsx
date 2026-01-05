import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supplierService } from '../../services/supplierService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isOpen, message, confirm, handleConfirm, handleCancel } = useConfirm();
  const [deleteId, setDeleteId] = useState(null);
  
  const {
    currentPage,
    itemsPerPage,
    searchTerm,
    totalItems,
    setTotalItems,
    setSearchTerm,
    setItemsPerPage,
    setCurrentPage
  } = useTablePagination({
    initialItemsPerPage: 10,
    enableSearch: true
  });

  useEffect(() => {
    loadSuppliers();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getAll(currentPage, itemsPerPage, searchTerm);
      console.log('Full API response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data.data:', response.data?.data);
      
      if (response.data && response.data.success) {
        // Backend returns: { success: true, data: { data: [...], total: ... } }
        const responseData = response.data.data;
        const suppliersData = Array.isArray(responseData) ? responseData : (responseData?.data || []);
        const total = responseData?.total || (Array.isArray(responseData) ? responseData.length : 0);
        
        console.log('Suppliers array:', suppliersData);
        console.log('Total items:', total);
        console.log('Suppliers count:', suppliersData.length);
        
        setSuppliers(suppliersData);
        setTotalItems(total);
        
        if (suppliersData.length === 0) {
          console.warn('No suppliers found in response');
        }
      } else {
        console.error('Invalid response structure:', response.data);
        toast.error(response.data?.message || 'Failed to load suppliers');
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
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
      
      <PaginationFilters
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by supplier name..."
        showSearch={true}
        showItemsPerPage={true}
      />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {suppliers.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No suppliers found.</p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                Debug: suppliers array length = {suppliers.length}, totalItems = {totalItems}
              </p>
            </div>
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

