export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    status: 'pending' | 'processed' | 'failed';
    idempotency_key?: string;
    created_at: string;
}

export interface TransactionCreatePayload {
    user_id: string;
    amount: number;
    type: string;
    idempotency_key: string;
}