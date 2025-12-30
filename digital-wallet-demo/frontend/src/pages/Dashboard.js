import { useEffect, useState } from 'react';
import WalletForm from '../components/WalletForm';
import Balance from '../components/Balance';
import Transactions from '../components/Transactions';
// dkwdjwdwkdyu8yy8yuo8yy
function Dashboard() {
  const [userId, setUserId] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(false);
//  changefeeegeg
  useEffect(() => {
    const storedUser = localStorage.getItem('userId');
    if (storedUser) setUserId(storedUser);
  }, []);

  const refresh = () => setRefreshFlag(prev => !prev);

  if (!userId) return <div>Please login first</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Digital Wallet Dashboard</h1>
      <Balance key={refreshFlag} userId={userId} />
      <h2>Deposit</h2>
      <WalletForm type="deposit" userId={userId} onSuccess={refresh} />
      <h2>Withdraw</h2>
      <WalletForm type="withdraw" userId={userId} onSuccess={refresh} />
      <h2>Transfer</h2>
      <WalletForm type="transfer" userId={userId} onSuccess={refresh} />
      <h2>Transactions</h2>
      <Transactions key={refreshFlag} userId={userId} />
    </div>
  );
}

export default Dashboard;
//EJREJREJR