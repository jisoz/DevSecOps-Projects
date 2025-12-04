import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/">Login</Link> | <Link to="/signup">Sign Up</Link> | <Link to="/dashboard">Dashboard</Link>
    </nav>
  );
}

export default Navbar;
