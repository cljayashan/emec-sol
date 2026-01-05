import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Sidebar from './components/common/Sidebar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SupplierList from './components/suppliers/SupplierList';
import SupplierForm from './components/suppliers/SupplierForm';
import SupplierView from './components/suppliers/SupplierView';
import DeliveryPersonList from './components/deliveryPersons/DeliveryPersonList';
import DeliveryPersonForm from './components/deliveryPersons/DeliveryPersonForm';
import DeliveryPersonView from './components/deliveryPersons/DeliveryPersonView';
import ItemCategoryList from './components/itemCategories/ItemCategoryList';
import ItemCategoryForm from './components/itemCategories/ItemCategoryForm';
import ItemCategoryView from './components/itemCategories/ItemCategoryView';
import BrandList from './components/brands/BrandList';
import BrandForm from './components/brands/BrandForm';
import BrandView from './components/brands/BrandView';
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
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      
      {/* Protected Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar />
            <div className="main-content">
              <div className="content-wrapper">
                <Routes>
                  <Route path="/" element={<div className="card"><h1>Welcome to EMEC Vehicle Service Station</h1><p>Select a menu item from the sidebar to get started.</p></div>} />
                  
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
                  
                  <Route path="/brands" element={<BrandList />} />
                  <Route path="/brands/new" element={<BrandForm />} />
                  <Route path="/brands/:id/edit" element={<BrandForm />} />
                  <Route path="/brands/:id/view" element={<BrandView />} />
                  
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
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;

