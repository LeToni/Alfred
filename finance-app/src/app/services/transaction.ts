import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ITransaction {
  id: string;
  accountId: string;
  description: string;
  type: 'income' | 'expense';
  cents: number;
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionStorageKey = 'little-by-little.finance.v2';
  private transactionsSubject = new BehaviorSubject<ITransaction[]>([]);
  public transactions$: Observable<ITransaction[]> = this.transactionsSubject.asObservable();

  constructor() {
    this.loadTransactions();
  }

  private loadTransactions(): void {
    try {
      const stored = localStorage.getItem(this.transactionStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && this.validateTransactions(parsed)) {
          this.transactionsSubject.next(parsed);
        }
      } else {
        // Create dummy transactions
        const now = new Date();
        const mainAccountId = 'default-' + Date.now();
        const savingsAccountId = 'savings-' + Date.now();
        const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        
        const dummyTransactions: ITransaction[] = [
          { id: 'trans-1', accountId: mainAccountId, description: 'Salary', type: 'income', cents: 350000, date: dateStr },
          { id: 'trans-2', accountId: mainAccountId, description: 'Groceries', type: 'expense', cents: 8500, date: dateStr },
          { id: 'trans-3', accountId: mainAccountId, description: 'Freelance', type: 'income', cents: 50000, date: dateStr },
          { id: 'trans-4', accountId: savingsAccountId, description: 'Transfer from checking', type: 'income', cents: 100000, date: dateStr }
        ];
        this.transactionsSubject.next(dummyTransactions);
        this.saveTransactions(dummyTransactions);
      }
    } catch (error) {
      console.error('Unable to load transactions:', error);
    }
  }

  private validateTransactions(transactions: any[]): boolean {
    return transactions.every(t =>
      t && typeof t.id === 'string' &&
      typeof t.accountId === 'string' &&
      typeof t.description === 'string' && t.description.trim().length > 0 &&
      (t.type === 'income' || t.type === 'expense') &&
      Number.isSafeInteger(t.cents) && t.cents > 0 &&
      typeof t.date === 'string'
    );
  }

  private saveTransactions(transactions: ITransaction[]): void {
    try {
      localStorage.setItem(this.transactionStorageKey, JSON.stringify(transactions));
    } catch (error) {
      console.error('Unable to save transactions:', error);
    }
  }

  getTransactionsForAccount(accountId: string): ITransaction[] {
    return this.transactionsSubject.value
      .filter(t => t.accountId === accountId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  addTransaction(transaction: ITransaction): void {
    const transactions = [...this.transactionsSubject.value, transaction];
    this.transactionsSubject.next(transactions);
    this.saveTransactions(transactions);
  }

  deleteTransaction(id: string): void {
    const transactions = this.transactionsSubject.value.filter(t => t.id !== id);
    this.transactionsSubject.next(transactions);
    this.saveTransactions(transactions);
  }
}
