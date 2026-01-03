import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { values, handleChange } = useForm({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (values.password !== values.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (values.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({
      username: values.username,
      email: values.email,
      password: values.password,
      full_name: values.full_name
    });
    setLoading(false);
    
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
        <div className="card-header">
          <h2 className="card-title" style={{ textAlign: 'center' }}>EMEC Register</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={values.full_name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

