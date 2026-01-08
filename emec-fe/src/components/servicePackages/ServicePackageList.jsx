import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { servicePackageService } from '../../services/servicePackageService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const ServicePackageList = () => {
  const [servicePackages, setServicePackages] = useState([]);
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
    loadServicePackages();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadServicePackages = async () => {
    try {
      setLoading(true);
      const response = await servicePackageService.getAll(currentPage, itemsPerPage, searchTerm);
      setServicePackages(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load service packages');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/service-packages/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/service-packages/${row.id}/edit`);
    } else if (action === 'delete') {
      setDeleteId(row.id);
      confirm('Are you sure you want to delete this service package?', handleDelete);
    }
  };

  const handleDelete = async () => {
    try {
      await servicePackageService.delete(deleteId);
      toast.success('Service package deleted successfully');
      loadServicePackages();
    } catch (error) {
      toast.error('Failed to delete service package');
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
        <h2 className="card-title">Service Packages</h2>
        <button className="btn btn-primary" onClick={() => navigate('/service-packages/new')}>
          Add New Service Package
        </button>
      </div>
      
      <PaginationFilters
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name or description..."
        showSearch={true}
        showItemsPerPage={true}
      />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {servicePackages.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No service packages found.</p>
            </div>
          ) : (
            <>
              <DataGrid columns={columns} data={servicePackages} actions={actions} onAction={handleAction} />
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

export default ServicePackageList;
