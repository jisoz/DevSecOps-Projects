import { useEffect, useState } from 'react';
import api from '../services/api';

function Transactions({ userId, refreshFlag }) {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/wallets/${userId}`);
      setTransactions(res.data?.data?.transactions || []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId, refreshFlag]);

  return (
    <div>
      <h3>Transactions</h3>
      <ul>
        {transactions.length === 0 && <li>No transactions yet</li>}
        {transactions.map(tx => (
          <li key={tx.id}>
            {tx.transaction_type} ${ (tx.amount / 100).toFixed(2) } at {new Date(tx.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Transactions;
