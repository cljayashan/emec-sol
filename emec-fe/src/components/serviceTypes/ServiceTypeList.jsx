import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceTypeService } from '../../services/serviceTypeService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const ServiceTypeList = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
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
    loadServiceTypes();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadServiceTypes = async () => {
    try {
      setLoading(true);
      const response = await serviceTypeService.getAll(currentPage, itemsPerPage, searchTerm);
      setServiceTypes(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load service types');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/service-types/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/service-types/${row.id}/edit`);
    } else if (action === 'delete') {
      setDeleteId(row.id);
      confirm('Are you sure you want to delete this service type?', handleDelete);
    }
  };

  const handleDelete = async () => {
    try {
      await serviceTypeService.delete(deleteId);
      toast.success('Service type deleted successfully');
      loadServiceTypes();
    } catch (error) {
      toast.error('Failed to delete service type');
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
        <h2 className="card-title">Service Types</h2>
        <button className="btn btn-primary" onClick={() => navigate('/service-types/new')}>
          Add New Service Type
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
          {serviceTypes.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No service types found.</p>
            </div>
          ) : (
            <>
              <DataGrid columns={columns} data={serviceTypes} actions={actions} onAction={handleAction} />
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

export default ServiceTypeList;

