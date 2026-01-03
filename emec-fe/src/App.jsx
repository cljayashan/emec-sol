import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import SupplierList from './components/suppliers/SupplierList';
import SupplierForm from './components/suppliers/SupplierForm';
import SupplierView from './components/suppliers/SupplierView';
import DeliveryPersonList from './components/deliveryPersons/DeliveryPersonList';
import DeliveryPersonForm from './components/deliveryPersons/DeliveryPersonForm';
import DeliveryPersonView from './components/deliveryPersons/DeliveryPersonView';
import ItemCategoryList from './components/itemCategories/ItemCategoryList';
import ItemCategoryForm from './components/itemCategories/ItemCategoryForm';
import ItemCategoryView from './components/itemCategories/ItemCategoryView';
import ItemList from './components/items/ItemList';
import ItemForm from './components/items/ItemForm';
import ItemView from './components/items/ItemView';
import PurchaseList from './components/purchases/PurchaseList';
import PurchaseForm from './components/purchases/PurchaseForm';
import SaleList from './components/sales/SaleList';
import SaleForm from './components/sales/SaleForm';
import QuotationList from './components/quotations/QuotationList';
import QuotationForm from './components/quotations/QuotationForm';
import StockList from './components/stock/StockList';
import StockAdjustment from './components/stock/StockAdjustment';
import BillTemplateForm from './components/billTemplates/BillTemplateForm';

function App() {
  const location = useLocation();

  return (
    <div>
      <nav style={{ background: '#343a40', color: 'white', padding: '15px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>EMEC</Link>
          <Link to="/suppliers" style={{ color: 'white', textDecoration: 'none' }}>Suppliers</Link>
          <Link to="/delivery-persons" style={{ color: 'white', textDecoration: 'none' }}>Delivery Persons</Link>
          <Link to="/item-categories" style={{ color: 'white', textDecoration: 'none' }}>Item Categories</Link>
          <Link to="/items" style={{ color: 'white', textDecoration: 'none' }}>Items</Link>
          <Link to="/purchases" style={{ color: 'white', textDecoration: 'none' }}>Purchases</Link>
          <Link to="/sales" style={{ color: 'white', textDecoration: 'none' }}>Sales</Link>
          <Link to="/quotations" style={{ color: 'white', textDecoration: 'none' }}>Quotations</Link>
          <Link to="/stock" style={{ color: 'white', textDecoration: 'none' }}>Stock</Link>
          <Link to="/bill-templates" style={{ color: 'white', textDecoration: 'none' }}>Bill Templates</Link>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<div><h1>Welcome to EMEC Vehicle Service Station</h1></div>} />
          
          <Route path="/suppliers" element={<SupplierList />} />
          <Route path="/suppliers/new" element={<SupplierForm />} />
          <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
          <Route path="/suppliers/:id/view" element={<SupplierView />} />
          
          <Route path="/delivery-persons" element={<DeliveryPersonList />} />
          <Route path="/delivery-persons/new" element={<DeliveryPersonForm />} />
          <Route path="/delivery-persons/:id/edit" element={<DeliveryPersonForm />} />
          <Route path="/delivery-persons/:id/view" element={<DeliveryPersonView />} />
          
          <Route path="/item-categories" element={<ItemCategoryList />} />
          <Route path="/item-categories/new" element={<ItemCategoryForm />} />
          <Route path="/item-categories/:id/edit" element={<ItemCategoryForm />} />
          <Route path="/item-categories/:id/view" element={<ItemCategoryView />} />
          
          <Route path="/items" element={<ItemList />} />
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:id/edit" element={<ItemForm />} />
          <Route path="/items/:id/view" element={<ItemView />} />
          
          <Route path="/purchases" element={<PurchaseList />} />
          <Route path="/purchases/new" element={<PurchaseForm />} />
          
          <Route path="/sales" element={<SaleList />} />
          <Route path="/sales/new" element={<SaleForm />} />
          
          <Route path="/quotations" element={<QuotationList />} />
          <Route path="/quotations/new" element={<QuotationForm />} />
          <Route path="/quotations/:id/edit" element={<QuotationForm />} />
          
          <Route path="/stock" element={<StockList />} />
          <Route path="/stock/adjust" element={<StockAdjustment />} />
          
          <Route path="/bill-templates" element={<BillTemplateForm />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

