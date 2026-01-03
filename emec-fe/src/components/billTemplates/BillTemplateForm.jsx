import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { billTemplateService } from '../../services/billTemplateService';

const BillTemplateForm = () => {
  const [purchaseTemplate, setPurchaseTemplate] = useState({
    template_type: 'purchase',
    company_name: '',
    motto: '',
    address: '',
    phone_numbers: '',
    email: '',
    logo_path: ''
  });
  const [saleTemplate, setSaleTemplate] = useState({
    template_type: 'sale',
    company_name: '',
    motto: '',
    address: '',
    phone_numbers: '',
    email: '',
    logo_path: ''
  });
  const [activeTab, setActiveTab] = useState('purchase');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const [purchaseRes, saleRes] = await Promise.all([
        billTemplateService.getByType('purchase').catch(() => ({ data: { data: null } })),
        billTemplateService.getByType('sale').catch(() => ({ data: { data: null } }))
      ]);

      if (purchaseRes.data.data) {
        setPurchaseTemplate(purchaseRes.data.data);
      }
      if (saleRes.data.data) {
        setSaleTemplate(saleRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load templates');
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    try {
      const template = type === 'purchase' ? purchaseTemplate : saleTemplate;
      await billTemplateService.create(template);
      toast.success(`${type === 'purchase' ? 'Purchase' : 'Sale'} template saved successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Bill Templates</h2>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          className={`btn ${activeTab === 'purchase' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('purchase')}
        >
          Purchase Bill Template
        </button>
        <button
          className={`btn ${activeTab === 'sale' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sale')}
        >
          Sale Bill Template
        </button>
      </div>

      {activeTab === 'purchase' ? (
        <form onSubmit={(e) => handleSubmit(e, 'purchase')}>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={purchaseTemplate.company_name}
              onChange={(e) => setPurchaseTemplate({ ...purchaseTemplate, company_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Motto</label>
            <input
              type="text"
              value={purchaseTemplate.motto}
              onChange={(e) => setPurchaseTemplate({ ...purchaseTemplate, motto: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={purchaseTemplate.address}
              onChange={(e) => setPurchaseTemplate({ ...purchaseTemplate, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone Numbers</label>
            <input
              type="text"
              value={purchaseTemplate.phone_numbers}
              onChange={(e) => setPurchaseTemplate({ ...purchaseTemplate, phone_numbers: e.target.value })}
              placeholder="e.g., +1234567890, +9876543210"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={purchaseTemplate.email}
              onChange={(e) => setPurchaseTemplate({ ...purchaseTemplate, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Logo Path</label>
            <input
              type="text"
              value={purchaseTemplate.logo_path}
              onChange={(e) => setPurchaseTemplate({ ...purchaseTemplate, logo_path: e.target.value })}
              placeholder="Path to logo image file"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Purchase Template'}
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => handleSubmit(e, 'sale')}>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={saleTemplate.company_name}
              onChange={(e) => setSaleTemplate({ ...saleTemplate, company_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Motto</label>
            <input
              type="text"
              value={saleTemplate.motto}
              onChange={(e) => setSaleTemplate({ ...saleTemplate, motto: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={saleTemplate.address}
              onChange={(e) => setSaleTemplate({ ...saleTemplate, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone Numbers</label>
            <input
              type="text"
              value={saleTemplate.phone_numbers}
              onChange={(e) => setSaleTemplate({ ...saleTemplate, phone_numbers: e.target.value })}
              placeholder="e.g., +1234567890, +9876543210"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={saleTemplate.email}
              onChange={(e) => setSaleTemplate({ ...saleTemplate, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Logo Path</label>
            <input
              type="text"
              value={saleTemplate.logo_path}
              onChange={(e) => setSaleTemplate({ ...saleTemplate, logo_path: e.target.value })}
              placeholder="Path to logo image file"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Sale Template'}
          </button>
        </form>
      )}
    </div>
  );
};

export default BillTemplateForm;

