import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vehicleService } from '../../services/vehicleService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
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
    loadVehicles();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAll(currentPage, itemsPerPage, searchTerm);
      setVehicles(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/vehicles/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/vehicles/${row.id}/edit`);
    } else if (action === 'delete') {
      const vehicleId = row.id;
      if (!vehicleId) {
        toast.error('Invalid vehicle ID');
        return;
      }
      setDeleteId(vehicleId);
      confirm('Are you sure you want to delete this vehicle?', () => handleDelete(vehicleId));
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error('Vehicle ID is required');
      return;
    }
    try {
      await vehicleService.delete(id);
      toast.success('Vehicle deleted successfully');
      setDeleteId(null);
      loadVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle');
      setDeleteId(null);
    }
  };

  const columns = [
    { key: 'reg_no', label: 'Registration No' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'brand_name', label: 'Brand' },
    { key: 'model_name', label: 'Model' },
    { key: 'vehicle_type', label: 'Vehicle Type' }
  ];

  const actions = [
    { name: 'view', label: 'View', color: 'primary' },
    { name: 'edit', label: 'Edit', color: 'secondary' },
    { name: 'delete', label: 'Delete', color: 'danger' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Registered Vehicles</h2>
        <button className="btn btn-primary" onClick={() => navigate('/vehicles/new')}>
          Register New Vehicle
        </button>
      </div>
      
      <PaginationFilters
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by customer, reg no, brand, or model..."
        showSearch={true}
        showItemsPerPage={true}
      />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataGrid columns={columns} data={vehicles} actions={actions} onAction={handleAction} />
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

export default VehicleList;

