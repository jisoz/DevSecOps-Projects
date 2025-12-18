import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// A simple login page for demonstration purposes
function Login() {
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!userId) return alert('Enter a user ID');
    localStorage.setItem('userId', userId); // store userId for dashboard
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <input 
        type="text" 
        placeholder="Enter your User ID" 
        value={userId} 
        onChange={(e) => setUserId(e.target.value)} 
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
