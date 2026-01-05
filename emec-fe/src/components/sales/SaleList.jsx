import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { saleService } from '../../services/saleService';
import DataGrid from '../common/DataGrid';
import Paginator from '../common/Paginator';
import ConfirmDialog from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { formatDate } from '../../utils/helpers';

const SaleList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { isOpen, message, confirm, handleConfirm, handleCancel } = useConfirm();
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
    loadSales();
  }, [currentPage]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await saleService.getAll(currentPage, itemsPerPage);
      setSales(response.data.data.data);
      setTotalItems(response.data.data.total);
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'view') {
      navigate(`/sales/${row.id}/view`);
    } else if (action === 'print') {
      handlePrint(row.id);
    } else if (action === 'cancel') {
      if (row.status === 'cancelled') {
        toast.info('This sale is already cancelled');
        return;
      }
      setCancelId(row.id);
      confirm('Are you sure you want to cancel this sale? Stock will be reversed.', handleCancelSale);
    }
  };

  const handleCancelSale = async () => {
    try {
      await saleService.cancel(cancelId);
      toast.success('Sale cancelled successfully');
      loadSales();
    } catch (error) {
      toast.error('Failed to cancel sale');
    }
  };

  const handlePrint = async (id) => {
    try {
      const response = await saleService.print(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sale-bill-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to print sale bill');
    }
  };

  const columns = [
    { key: 'bill_number', label: 'Bill Number' },
    { key: 'sale_date', label: 'Date', render: (val) => formatDate(val) },
    { key: 'total_amount', label: 'Total Amount', render: (val) => parseFloat(val || 0).toFixed(2) },
    { key: 'payment_method', label: 'Payment Method' },
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
        <h2 className="card-title">Sale Bills</h2>
        <button className="btn btn-primary" onClick={() => navigate('/sales/new')}>
          Add New Sale
        </button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataGrid columns={columns} data={sales} actions={actions} onAction={handleAction} />
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

export default SaleList;

