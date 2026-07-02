import React, { useState, useEffect } from 'react';
import { WS_BASE_URL } from './config/constants';
import {createTransaction, fetchTransactions, processTransaction} from './services/transactionService';
import type { Transaction } from './types/transaction';

export default function TransactionDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [form, setForm] = useState({ user_id: '', amount: 0, type: '' });

  useEffect(() => {

    fetchTransactions().then(data => {
      setTransactions(data);
    }).catch(err => console.error(err));


    const ws = new WebSocket(`${WS_BASE_URL}/stream/`);

    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      const { event: type, data } = parsed;

      if (type === 'transaction_status_changed') {
        setTransactions(prev => prev.map(t =>
            t.id === data.id ? { ...t, status: data.status } : t
        ));
      } else if (type === 'transaction_created') {
        setTransactions(prev => [data, ...prev]);
      }
    };
    return () => ws.close();
  }, []);

  type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  const handleChange = (e: React.ChangeEvent<FormElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction({
        ...form,
        idempotency_key: crypto.randomUUID()
      });
      setForm({ user_id: '', amount: 0, type: '' });
    } catch (err) {
      console.error("Error al crear:", err);
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await processTransaction(id);
    } catch (err) {
      console.error("Error al procesar:", err);
    }
  };

  return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <h2>Transactions</h2>

        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input name="user_id" placeholder="User ID" value={form.user_id} onChange={handleChange} required />
            <input name="amount" type="number" placeholder="Monto" value={form.amount} onChange={handleChange} required />
            <select name="type" value={form.type} onChange={handleChange} required>
              <option value="" disabled>Select one</option>
              <option value="payment">Payment</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
            <button type="submit">Submit</button>
          </form>
        </div>

        <table style={{ minWidth: '600px', width: '100%'}}>
          <thead>
          <tr><th>ID</th><th>User ID</th><th>Monto</th><th>Tipo</th><th>Estado</th></tr>
          </thead>
          <tbody>
          {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id.substring(0, 8)}...</td>
                <td>{tx.user_id}</td>
                <td>${tx.amount}</td>
                <td>{tx.type.toUpperCase()}</td>
                <td>{tx.status.toUpperCase()}</td>
                <td>
                  {tx.status === 'pending' && (
                      <button onClick={() => handleProcess(tx.id)}>
                        Process
                      </button>
                  )}
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}