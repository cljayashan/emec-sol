import React from 'react';

const DataGrid = ({ columns, data, actions = [], onAction }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          {actions.length > 0 && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} style={{ textAlign: 'center', padding: '20px' }}>
              No data available
            </td>
          </tr>
        ) : (
          data.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {actions.map((action) => (
                      <button
                        key={action.name}
                        className={`btn btn-${action.color || 'primary'}`}
                        onClick={() => onAction(action.name, row)}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default DataGrid;

