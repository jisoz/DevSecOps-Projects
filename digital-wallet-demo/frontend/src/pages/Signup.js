// src/components/Signup.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
// #njedejej
function Signup() {
  const [userId, setUserId] = useState('');
  const [acntType, setAcntType] = useState('user'); // default user
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', { user_id: userId, acnt_type: acntType });
      alert(`User created successfully! Your User ID: ${userId}`);
      localStorage.setItem('userId', userId);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error creating user: ' + (err.response?.data?.errors?.[0]?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <select value={acntType} onChange={e => setAcntType(e.target.value)}>
            <option value="user">User</option>
            <option value="merchant">Merchant</option>
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
