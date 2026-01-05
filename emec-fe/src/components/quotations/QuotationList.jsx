import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { quotationService } from '../../services/quotationService';
import DataGrid from '../common/DataGrid';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { formatDate } from '../../utils/helpers';
import { QUOTATION_STATUS_LABELS } from '../../utils/constants';

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { isOpen, message, confirm, handleConfirm, handleCancel } = useConfirm();
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadQuotations();
  }, [currentPage]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getAll(currentPage, itemsPerPage);
      setQuotations(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/quotations/${row.id}/view`);
    } else if (action === 'edit') {
      navigate(`/quotations/${row.id}/edit`);
    } else if (action === 'delete') {
      setDeleteId(row.id);
      confirm('Are you sure you want to delete this quotation?', handleDelete);
    }
  };

  const handleDelete = async () => {
    try {
      await quotationService.delete(deleteId);
      toast.success('Quotation deleted successfully');
      loadQuotations();
    } catch (error) {
      toast.error('Failed to delete quotation');
    }
  };

  const columns = [
    { key: 'quotation_number', label: 'Quotation Number' },
    { key: 'quotation_date', label: 'Date', render: (val) => formatDate(val) },
    { key: 'customer_name', label: 'Customer' },
    { key: 'total_amount', label: 'Total Amount', render: (val) => parseFloat(val || 0).toFixed(2) },
    { key: 'status', label: 'Status', render: (val) => QUOTATION_STATUS_LABELS[val] || val }
  ];

  const actions = [
    { name: 'view', label: 'View', color: 'primary' },
    { name: 'edit', label: 'Edit', color: 'secondary' },
    { name: 'delete', label: 'Delete', color: 'danger' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Quotations</h2>
        <button className="btn btn-primary" onClick={() => navigate('/quotations/new')}>
          Add New Quotation
        </button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataGrid columns={columns} data={quotations} actions={actions} onAction={handleAction} />
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

export default QuotationList;

