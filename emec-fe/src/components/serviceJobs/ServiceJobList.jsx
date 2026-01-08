import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceJobService } from '../../services/serviceJobService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import Spinner from '../common/Spinner';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const ServiceJobList = () => {
  const [serviceJobs, setServiceJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
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
  }, [currentPage, itemsPerPage, searchTerm, filterDate]);

  const loadServiceJobs = async () => {
    try {
      setLoading(true);
      const response = await serviceJobService.getAll(currentPage, itemsPerPage, searchTerm, filterDate);
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
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        {searchTerm !== undefined && (
          <input
            type="text"
            placeholder="Search by job number, vehicle, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '8px', 
              width: '300px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>
            Records per page:
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            {[10, 25, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>
            Filter by Date:
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1); // Reset to first page when date filter changes
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          />
          {filterDate && (
            <button
              onClick={() => {
                setFilterDate('');
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div style={{ 
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Spinner size={50} color="#007bff" />
        </div>
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

