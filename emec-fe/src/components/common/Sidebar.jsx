import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const isActive = (path) => {
    if (path === '/service-jobs') {
      // For service jobs list, only match exact path or view/edit routes, not /new
      return location.pathname === path || 
             (location.pathname.startsWith(path + '/') && 
              !location.pathname.startsWith(path + '/new'));
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      key: 'master',
      label: 'Master Data',
      icon: '📋',
      children: [
        { path: '/suppliers', label: 'Suppliers' },
        { path: '/delivery-persons', label: 'Delivery Persons' },
        { path: '/service-packages', label: 'Service Packages' },
        { path: '/services', label: 'Services' },
        { path: '/vehicle-defects', label: 'Vehicle Defects' },
        { path: '/pre-inspection-recommendations', label: 'Pre Inspection Recommendations' },
        { path: '/item-categories', label: 'Item Categories' },
        { path: '/brands', label: 'Vehicle Brands' },
        { path: '/vehicle-models', label: 'Vehicle Models' },
        { path: '/items', label: 'Items' }
      ]
    },
    {
      key: 'customer',
      label: 'Customer',
      icon: '👤',
      children: [
        { path: '/customers', label: 'Manage' }
      ]
    },
    {
      key: 'workshop',
      label: 'Workshop',
      icon: '🔧',
      children: [
        { path: '/service-jobs', label: 'Service Job List' },
        { path: '/service-jobs/new', label: 'Create Service Job' },
        { path: '/vehicles', label: 'Register Vehicle' }
      ]
    },
    {
      key: 'transactions',
      label: 'Transactions',
      icon: '💰',
      children: [
        { path: '/purchases', label: 'Purchases' },
        { path: '/sales', label: 'Sales' },
        { path: '/quotations', label: 'Quotations' }
      ]
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: '📦',
      children: [
        { path: '/stock', label: 'Stock List' },
        { path: '/stock/adjust', label: 'Stock Adjustment' }
      ]
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: '⚙️',
      children: [
        { path: '/bill-templates', label: 'Bill Templates' }
      ]
    }
  ];

  useEffect(() => {
    // Auto-expand menu containing active route
    const activeMenu = menuItems.find(menu => 
      menu.children.some(item => isActive(item.path))
    );
    if (activeMenu) {
      setExpandedMenus(prev => ({
        ...prev,
        [activeMenu.key]: true
      }));
    }
  }, [location.pathname]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const isMenuExpanded = (menuKey) => {
    return expandedMenus[menuKey] || menuItems.find(menu => 
      menu.children.some(item => isActive(item.path))
    )?.key === menuKey;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>EMEC</h2>
        <p>Vehicle Service Station</p>
      </div>
      
      <div className="sidebar-menu">
        <Link 
          to="/" 
          className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}
        >
          <span className="sidebar-icon">🏠</span>
          <span className="sidebar-label">Dashboard</span>
        </Link>

        {menuItems.map(menu => {
          const expanded = isMenuExpanded(menu.key);
          const hasActiveChild = menu.children.some(item => isActive(item.path));

          return (
            <div key={menu.key} className="sidebar-menu-group">
              <div
                className={`sidebar-menu-header ${hasActiveChild ? 'active' : ''}`}
                onClick={() => toggleMenu(menu.key)}
              >
                <span className="sidebar-icon">{menu.icon}</span>
                <span className="sidebar-label">{menu.label}</span>
                <span className={`sidebar-arrow ${expanded ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
              
              {expanded && (
                <div className="sidebar-submenu">
                  {menu.children.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-submenu-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <span className="sidebar-icon">👤</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name || user?.username}
            </div>
            <div style={{ fontSize: '11px', color: '#95a5a6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button
          className="sidebar-logout-btn"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
        >
          <span className="sidebar-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

