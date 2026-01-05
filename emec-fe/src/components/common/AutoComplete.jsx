import React, { useState, useEffect, useRef } from 'react';

const AutoComplete = ({ items, onSelect, placeholder = 'Search...', searchKey = 'name', value = '', renderItem }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter((item) => {
        // If renderItem is provided, search in the rendered text, otherwise use searchKey
        if (renderItem) {
          const displayText = renderItem(item).toLowerCase();
          return displayText.includes(searchTerm.toLowerCase());
        }
        return item[searchKey]?.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredItems(filtered);
      setShowDropdown(true);
    } else {
      // Show all items when input is empty and focused, or when clearing
      setFilteredItems(items);
      setShowDropdown(false);
    }
  }, [searchTerm, items, searchKey, renderItem]);

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
    if (!searchTerm && items.length > 0) {
      setFilteredItems(items);
      setShowDropdown(true);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="form-group input"
        style={{ width: '100%' }}
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
          {filteredItems.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => handleSelect(item)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
            >
              {renderItem ? renderItem(item) : item[searchKey]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoComplete;

