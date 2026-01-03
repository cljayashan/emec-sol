import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { purchaseService } from '../../services/purchaseService';
import DataGrid from '../common/DataGrid';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { formatDate } from '../../utils/helpers';

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({ billNumber: '', date: '' });
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { isOpen, message, confirm, handleConfirm, handleCancel } = useConfirm();
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
    loadPurchases();
  }, [currentPage, filters]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await purchaseService.getAll(currentPage, itemsPerPage, filters);
      setPurchases(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/purchases/${row.id}/view`);
    } else if (action === 'print') {
      handlePrint(row.id);
    } else if (action === 'cancel') {
      if (row.status === 'cancelled') {
        toast.info('This purchase is already cancelled');
        return;
      }
      setCancelId(row.id);
      confirm('Are you sure you want to cancel this purchase? Stock will be reversed.', handleCancelPurchase);
    }
  };

  const handleCancelPurchase = async () => {
    try {
      await purchaseService.cancel(cancelId);
      toast.success('Purchase cancelled successfully');
      loadPurchases();
    } catch (error) {
      toast.error('Failed to cancel purchase');
    }
  };

  const handlePrint = async (id) => {
    try {
      const response = await purchaseService.print(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `purchase-bill-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to print purchase bill');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'bill_number', label: 'Bill Number' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'purchase_date', label: 'Date', render: (val) => formatDate(val) },
    { key: 'total_amount', label: 'Total Amount', render: (val) => parseFloat(val || 0).toFixed(2) },
    { key: 'status', label: 'Status' }
  ];

  const actions = [
    { name: 'view', label: 'View', color: 'primary' },
    { name: 'print', label: 'Print', color: 'secondary' },
    { name: 'cancel', label: 'Cancel', color: 'danger' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Purchase Bills</h2>
        <button className="btn btn-primary" onClick={() => navigate('/purchases/new')}>
          Add New Purchase
        </button>
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search by bill number..."
          value={filters.billNumber}
          onChange={(e) => setFilters({ ...filters, billNumber: e.target.value })}
          style={{ padding: '8px', width: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataGrid columns={columns} data={purchases} actions={actions} onAction={handleAction} />
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

export default PurchaseList;

