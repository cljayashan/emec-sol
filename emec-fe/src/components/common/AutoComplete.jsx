import React, { useState, useEffect, useRef } from 'react';

const AutoComplete = ({ items, onSelect, placeholder = 'Search...', searchKey = 'name', value = '' }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter((item) =>
        item[searchKey]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowDropdown(true);
    } else {
      setFilteredItems([]);
      setShowDropdown(false);
    }
  }, [searchTerm, items, searchKey]);

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

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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
              {item[searchKey]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoComplete;

