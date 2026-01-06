import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { preInspectionRecommendationService } from '../../services/preInspectionRecommendationService';
import DataGrid from '../common/DataGrid';
import { PaginationFilters } from '../common/PaginationControls';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useTablePagination } from '../../hooks/useTablePagination';

const PreInspectionRecommendationList = () => {
  const [preInspectionRecommendations, setPreInspectionRecommendations] = useState([]);
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
    loadPreInspectionRecommendations();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadPreInspectionRecommendations = async () => {
    try {
      setLoading(true);
      const response = await preInspectionRecommendationService.getAll(currentPage, itemsPerPage, searchTerm);
      setPreInspectionRecommendations(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load pre inspection recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/pre-inspection-recommendations/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/pre-inspection-recommendations/${row.id}/edit`);
    } else if (action === 'delete') {
      setDeleteId(row.id);
      confirm('Are you sure you want to delete this pre inspection recommendation?', handleDelete);
    }
  };

  const handleDelete = async () => {
    try {
      await preInspectionRecommendationService.delete(deleteId);
      toast.success('Pre inspection recommendation deleted successfully');
      loadPreInspectionRecommendations();
    } catch (error) {
      toast.error('Failed to delete pre inspection recommendation');
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
        <h2 className="card-title">Pre Inspection Recommendations</h2>
        <button className="btn btn-primary" onClick={() => navigate('/pre-inspection-recommendations/new')}>
          Add New Pre Inspection Recommendation
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
          {preInspectionRecommendations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No pre inspection recommendations found.</p>
            </div>
          ) : (
            <>
              <DataGrid columns={columns} data={preInspectionRecommendations} actions={actions} onAction={handleAction} />
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

export default PreInspectionRecommendationList;

