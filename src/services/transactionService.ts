import { API_BASE_URL } from '../config/constants';
import type {Transaction} from '../types/transaction';

export const createTransaction = async (data: {
    user_id: string;
    amount: number;
    type: string;
    idempotency_key: `${string}-${string}-${string}-${string}-${string}`
}): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear transacción');
    return response.json();
};

export const processTransaction = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/transactions/async-process/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error('Error al enviar a procesamiento');
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions/list/`);
    if (!response.ok) throw new Error('Error al cargar transacciones');
    return response.json();
};

