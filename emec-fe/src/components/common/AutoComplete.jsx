import React, { useState, useEffect, useRef } from 'react';

const AutoComplete = ({ items, onSelect, placeholder = 'Search...', searchKey = 'name', value = '', renderItem, searchOnlyKey = false, getItemStyle }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value != null ? String(value) : '');
  }, [value]);

  useEffect(() => {
    // Only filter items when dropdown is shown (user is interacting)
    if (showDropdown) {
      if (searchTerm) {
        const searchTermStr = String(searchTerm).toLowerCase();
        const filtered = items.filter((item) => {
          // If searchOnlyKey is true, only search in searchKey field
          if (searchOnlyKey) {
            const itemValue = item[searchKey];
            return itemValue != null && String(itemValue).toLowerCase().includes(searchTermStr);
          }
          // If renderItem is provided, search in the rendered text, otherwise use searchKey
          if (renderItem) {
            const displayText = String(renderItem(item)).toLowerCase();
            return displayText.includes(searchTermStr);
          }
          // Search in multiple fields: searchKey, brand, barcode
          const itemValue = item[searchKey];
          const brandValue = item.brand || '';
          const barcodeValue = item.barcode || '';
          return (itemValue != null && String(itemValue).toLowerCase().includes(searchTermStr)) ||
                 (brandValue && String(brandValue).toLowerCase().includes(searchTermStr)) ||
                 (barcodeValue && String(barcodeValue).toLowerCase().includes(searchTermStr));
        });
        setFilteredItems(filtered);
      } else {
        // Show all items when input is empty
        setFilteredItems(items);
      }
    }
  }, [searchTerm, items, searchKey, renderItem, showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (item) => {
    setSearchTerm(item[searchKey]);
    setShowDropdown(false);
    onSelect(item);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (!newValue && onSelect) {
      // Clear selection when input is cleared
      onSelect(null);
    }
  };

  const handleInputFocus = () => {
    if (items.length > 0) {
      // Filter items based on current searchTerm when focusing
      if (searchTerm) {
        const searchTermStr = String(searchTerm).toLowerCase();
        const filtered = items.filter((item) => {
          // If searchOnlyKey is true, only search in searchKey field
          if (searchOnlyKey) {
            const itemValue = item[searchKey];
            return itemValue != null && String(itemValue).toLowerCase().includes(searchTermStr);
          }
          if (renderItem) {
            const displayText = String(renderItem(item)).toLowerCase();
            return displayText.includes(searchTermStr);
          }
          // Search in multiple fields: searchKey, brand, barcode
          const itemValue = item[searchKey];
          const brandValue = item.brand || '';
          const barcodeValue = item.barcode || '';
          return (itemValue != null && String(itemValue).toLowerCase().includes(searchTermStr)) ||
                 (brandValue && String(brandValue).toLowerCase().includes(searchTermStr)) ||
                 (barcodeValue && String(barcodeValue).toLowerCase().includes(searchTermStr));
        });
        setFilteredItems(filtered);
      } else {
        setFilteredItems(items);
      }
      setShowDropdown(true);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={searchTerm != null ? String(searchTerm) : ''}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        style={{ 
          width: '100%', 
          padding: '8px', 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />
      {showDropdown && filteredItems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {filteredItems.map((item, index) => {
            const customStyle = getItemStyle ? getItemStyle(item) : {};
            const hasCustomBg = !!customStyle.backgroundColor;
            const baseStyle = {
              padding: '10px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              ...customStyle
            };
            const hoverBgColor = hasCustomBg ? customStyle.backgroundColor : '#f0f0f0';
            const defaultBgColor = customStyle.backgroundColor || 'white';
            
            return (
              <div
                key={item.id || index}
                onClick={() => handleSelect(item)}
                style={baseStyle}
                onMouseEnter={(e) => {
                  if (hasCustomBg) {
                    // Darken the red background slightly on hover
                    e.target.style.backgroundColor = '#ffcdd2';
                    e.target.style.opacity = '0.9';
                  } else {
                    e.target.style.backgroundColor = hoverBgColor;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = defaultBgColor;
                  if (hasCustomBg) {
                    e.target.style.opacity = '1';
                  }
                }}
              >
                {renderItem ? renderItem(item) : item[searchKey]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AutoComplete;

