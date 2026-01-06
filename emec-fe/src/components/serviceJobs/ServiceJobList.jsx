import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceJobService } from '../../services/serviceJobService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const ServiceJobList = () => {
  const [serviceJobs, setServiceJobs] = useState([]);
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
    loadServiceJobs();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadServiceJobs = async () => {
    try {
      setLoading(true);
      const response = await serviceJobService.getAll(currentPage, itemsPerPage, searchTerm);
      setServiceJobs(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load service jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/service-jobs/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/service-jobs/${row.id}/edit`);
    } else if (action === 'delete') {
      setDeleteId(row.id);
      confirm('Are you sure you want to delete this service job?', handleDelete);
    }
  };

  const handleDelete = async () => {
    try {
      await serviceJobService.delete(deleteId);
      toast.success('Service job deleted successfully');
      loadServiceJobs();
    } catch (error) {
      toast.error('Failed to delete service job');
    }
  };

  const columns = [
    { key: 'job_number', label: 'Job Number' },
    { key: 'vehicle_reg_no', label: 'Vehicle' },
    { key: 'vehicle_customer', label: 'Customer' },
    { key: 'fuel_level', label: 'Fuel Level' },
    { key: 'status', label: 'Status' }
  ];

  const actions = [
    { name: 'view', label: 'View', color: 'primary' },
    { name: 'edit', label: 'Edit', color: 'secondary' },
    { name: 'delete', label: 'Delete', color: 'danger' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Service Job List</h2>
      </div>
      
      <PaginationFilters
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by job number, vehicle, or customer..."
        showSearch={true}
        showItemsPerPage={true}
      />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {serviceJobs.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No service jobs found.</p>
            </div>
          ) : (
            <>
              <DataGrid columns={columns} data={serviceJobs} actions={actions} onAction={handleAction} />
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

export default ServiceJobList;

