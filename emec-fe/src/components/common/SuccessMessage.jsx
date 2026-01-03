import React from 'react';

const SuccessMessage = ({ message, type = 'success', onClose }) => {
  const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107';
  
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: bgColor,
        color: 'white',
        padding: '15px 20px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '300px'
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;

