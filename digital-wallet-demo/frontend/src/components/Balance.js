import { useEffect, useState } from 'react';
import api from '../services/api';

function Balance({ userId, refreshFlag }) {
  const [balance, setBalance] = useState(null);

  const fetchBalance = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/wallets/${userId}`);
      const newBalance = res.data?.data?.wallet?.balance
        ? (res.data.data.wallet.balance / 100).toFixed(2)
        : '0.00';
      setBalance(newBalance);
    } catch (err) {
      console.error(err);
      setBalance('N/A');
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userId, refreshFlag]);

  return (
    <div>
      <h3>
        Balance for user {userId}: {balance !== null ? `$${balance}` : 'Loading...'}
      </h3>
    </div>
  );
}

export default Balance;
