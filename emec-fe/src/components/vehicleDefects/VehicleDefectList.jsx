import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vehicleDefectService } from '../../services/vehicleDefectService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const VehicleDefectList = () => {
  const [vehicleDefects, setVehicleDefects] = useState([]);
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
    loadVehicleDefects();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadVehicleDefects = async () => {
    try {
      setLoading(true);
      const response = await vehicleDefectService.getAll(currentPage, itemsPerPage, searchTerm);
      setVehicleDefects(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load vehicle defects');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/vehicle-defects/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/vehicle-defects/${row.id}/edit`);
    } else if (action === 'delete') {
      setDeleteId(row.id);
      confirm('Are you sure you want to delete this vehicle defect?', handleDelete);
    }
  };

  const handleDelete = async () => {
    try {
      await vehicleDefectService.delete(deleteId);
      toast.success('Vehicle defect deleted successfully');
      loadVehicleDefects();
    } catch (error) {
      toast.error('Failed to delete vehicle defect');
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
        <h2 className="card-title">Vehicle Defects</h2>
        <button className="btn btn-primary" onClick={() => navigate('/vehicle-defects/new')}>
          Add New Vehicle Defect
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
          {vehicleDefects.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No vehicle defects found.</p>
            </div>
          ) : (
            <>
              <DataGrid columns={columns} data={vehicleDefects} actions={actions} onAction={handleAction} />
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

export default VehicleDefectList;

