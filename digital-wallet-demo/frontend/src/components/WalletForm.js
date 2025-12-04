import { useState } from 'react';
import api from '../services/api';

function WalletForm({ type, userId, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [toUserId, setToUserId] = useState(''); // for transfer

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      let body = {};

      if (type === 'deposit') {
        endpoint = '/wallets/deposit';
        body = { user_id: userId, amount: parseInt(amount) };
      } else if (type === 'withdraw') {
        endpoint = '/wallets/withdraw';
        body = { user_id: userId, amount: parseInt(amount) };
      } else if (type === 'transfer') {
        endpoint = '/wallets/transfer';
        body = { from_user_id: userId, to_user_id: toUserId, amount: parseInt(amount) };
      }

      await api.post(endpoint, body);

      // fetch updated balance
      const balanceRes = await api.get(`/wallets/${userId}`);
      const newBalance = balanceRes.data.balance ? (balanceRes.data.balance / 100).toFixed(2) : '0.00';

      alert(`Success! New balance: $${newBalance}`);
      if (onSuccess) onSuccess();
      setAmount('');
      setToUserId('');
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.response?.data?.errors?.[0]?.message || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {type === 'transfer' && (
        <input
          type="text"
          placeholder="To User ID"
          value={toUserId}
          onChange={e => setToUserId(e.target.value)}
          required
        />
      )}
      <input
        type="number"
        placeholder="Amount (in cents)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
      />
      <button type="submit">{type}</button>
    </form>
  );
}

export default WalletForm;
