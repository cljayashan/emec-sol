import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceService } from '../../services/serviceService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isOpen, message, confirm, handleConfirm, handleCancel } = useConfirm();
  
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
    loadServices();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAll(currentPage, itemsPerPage, searchTerm);
      
      if (response.data && response.data.success) {
        const responseData = response.data.data;
        const servicesData = Array.isArray(responseData) ? responseData : (responseData?.data || []);
        const total = responseData?.total || (Array.isArray(responseData) ? responseData.length : 0);
        
        setServices(servicesData);
        setTotalItems(total);
      } else {
        toast.error(response.data?.message || 'Failed to load services');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load services';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/services/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/services/${row.id}/edit`);
    } else if (action === 'delete') {
      const serviceId = row.id;
      if (!serviceId) {
        toast.error('Invalid service ID');
        return;
      }
      confirm('Are you sure you want to delete this service?', () => handleDelete(serviceId));
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error('Service ID is required');
      return;
    }
    try {
      await serviceService.delete(id);
      toast.success('Service deleted successfully');
      loadServices();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete service';
      toast.error(errorMessage);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price', format: (value) => parseFloat(value || 0).toFixed(2), align: 'right' },
    { key: 'remarks', label: 'Remarks' }
  ];

  const actions = [
    { name: 'view', label: 'View', color: 'primary' },
    { name: 'edit', label: 'Edit', color: 'secondary' },
    { name: 'delete', label: 'Delete', color: 'danger' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Services</h2>
        <button className="btn btn-primary" onClick={() => navigate('/services/new')}>
          Add New Service
        </button>
      </div>
      
      <PaginationFilters
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by service name or remarks..."
        showSearch={true}
        showItemsPerPage={true}
      />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {services.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No services found.</p>
            </div>
          ) : (
            <>
              <DataGrid columns={columns} data={services} actions={actions} onAction={handleAction} />
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

export default ServiceList;
