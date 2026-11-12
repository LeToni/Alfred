import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, IAccount } from '../../services/account';
import { TransactionService, ITransaction } from '../../services/transaction';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.css',
})
export class Finance implements OnInit {
  accounts: IAccount[] = [];
  currentAccountId: string | null = null;
  transactions: ITransaction[] = [];
  
  description: string = '';
  amount: string = '';
  type: 'income' | 'expense' = 'expense';
  date: string = '';

  money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });
  dateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.accountService.accounts$.subscribe(accounts => {
      this.accounts = accounts;
    });

    this.accountService.currentAccountId$.subscribe(id => {
      this.currentAccountId = id;
      this.refreshTransactionList();
    });

    this.transactionService.transactions$.subscribe(() => {
      this.refreshTransactionList();
    });

    const today = new Date();
    this.date = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  }

  cents(value: number): bigint {
    return BigInt(value);
  }

  selectAccount(accountId: string): void {
    this.accountService.setCurrentAccount(accountId);
  }

  refreshTransactionList(): void {
    if (this.currentAccountId) {
      this.transactions = this.transactionService.getTransactionsForAccount(this.currentAccountId);
    }
  }

  getAccountBalance(accountId: string): bigint {
    const transactions = this.transactionService.getTransactionsForAccount(accountId);
    let income = 0n;
    let expenses = 0n;
    for (const t of transactions) {
      if (t.type === 'income') income += BigInt(t.cents);
      else expenses += BigInt(t.cents);
    }
    return income - expenses;
  }

  getSummary(): { income: bigint; expenses: bigint; balance: bigint } {
    const transactions = this.transactionService.getTransactionsForAccount(this.currentAccountId || '');
    let income = 0n;
    let expenses = 0n;
    for (const t of transactions) {
      if (t.type === 'income') income += BigInt(t.cents);
      else expenses += BigInt(t.cents);
    }
    return { income, expenses, balance: income - expenses };
  }

  formatMoney(cents: bigint): string {
    const absolute = cents < 0n ? -cents : cents;
    return (cents < 0n ? '-' : '') + this.money.formatToParts(absolute / 100n)
      .map(part => part.type === 'fraction' ? String(absolute % 100n).padStart(2, '0') : part.value).join('');
  }

  getBalanceClass(cents: bigint): string {
    if (cents === 0n) return 'balanced';
    if (cents > 0n) return 'positive';
    return 'negative';
  }

  getAccountBalanceClass(accountId: string): string {
    const balance = this.getAccountBalance(accountId);
    return this.getBalanceClass(balance);
  }

  addTransaction(): void {
    if (!this.description.trim() || !this.amount || !this.currentAccountId) return;

    const parts = this.amount.split('.');
    const cents = Number(parts[0]) * 100 + Number((parts[1] || '').padEnd(2, '0'));

    if (!/^\d+(\.\d{1,2})?$/.test(this.amount) || !Number.isSafeInteger(cents) || cents <= 0) return;

    const transaction: ITransaction = {
      id: 'trans-' + Date.now(),
      accountId: this.currentAccountId,
      description: this.description,
      type: this.type,
      cents,
      date: this.date
    };

    this.transactionService.addTransaction(transaction);
    this.description = '';
    this.amount = '';
    this.type = 'expense';
  }

  formatDate(dateStr: string): string {
    return this.dateFormat.format(new Date(dateStr + 'T12:00:00'));
  }

  isActive(accountId: string): boolean {
    return accountId === this.currentAccountId;
  }
}
