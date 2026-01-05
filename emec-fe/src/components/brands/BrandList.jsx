import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { brandService } from '../../services/brandService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
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
    loadBrands();
  }, [currentPage, searchTerm, itemsPerPage]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await brandService.getAll(currentPage, itemsPerPage, searchTerm);
      setBrands(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load vehicle brands');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/brands/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/brands/${row.id}/edit`);
    } else if (action === 'delete') {
      setDeleteId(row.id);
      confirm('Are you sure you want to delete this vehicle brand?', handleDelete);
    }
  };

  const handleDelete = async () => {
    try {
      await brandService.delete(deleteId);
      toast.success('Vehicle brand deleted successfully');
      loadBrands();
    } catch (error) {
      toast.error('Failed to delete vehicle brand');
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
        <h2 className="card-title">Vehicle Brands</h2>
        <button className="btn btn-primary" onClick={() => navigate('/brands/new')}>
          Add New Vehicle Brand
        </button>
      </div>
      
      <PaginationFilters
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by brand name..."
        showSearch={true}
      />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataGrid columns={columns} data={brands} actions={actions} onAction={handleAction} />
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

export default BrandList;

