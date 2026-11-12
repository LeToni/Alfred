import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IAccount {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private accountStorageKey = 'little-by-little.accounts.v1';
  private accountsSubject = new BehaviorSubject<IAccount[]>([]);
  public accounts$: Observable<IAccount[]> = this.accountsSubject.asObservable();
  private currentAccountIdSubject = new BehaviorSubject<string | null>(null);
  public currentAccountId$: Observable<string | null> = this.currentAccountIdSubject.asObservable();

  constructor() {
    this.loadAccounts();
  }

  private loadAccounts(): void {
    try {
      const stored = localStorage.getItem(this.accountStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(acc => acc && typeof acc.id === 'string' && typeof acc.name === 'string')) {
          this.accountsSubject.next(parsed);
        }
      } else {
        const defaultAccounts: IAccount[] = [
          { id: 'default-' + Date.now(), name: 'Main Account' },
          { id: 'savings-' + Date.now(), name: 'Savings' }
        ];
        this.accountsSubject.next(defaultAccounts);
        this.saveAccounts(defaultAccounts);
      }
    } catch (error) {
      console.error('Unable to load accounts:', error);
    }

    const accounts = this.accountsSubject.value;
    if (accounts.length > 0) {
      this.currentAccountIdSubject.next(accounts[0].id);
    }
  }

  private saveAccounts(accounts: IAccount[]): void {
    try {
      localStorage.setItem(this.accountStorageKey, JSON.stringify(accounts));
    } catch (error) {
      console.error('Unable to save accounts:', error);
    }
  }

  setCurrentAccount(accountId: string): void {
    const accounts = this.accountsSubject.value;
    const index = accounts.findIndex(a => a.id === accountId);
    if (index !== -1 && index !== 1) {
      const [clickedAccount] = accounts.splice(index, 1);
      accounts.splice(1, 0, clickedAccount);
      this.accountsSubject.next([...accounts]);
      this.saveAccounts(accounts);
    }
    this.currentAccountIdSubject.next(accountId);
  }

  getCurrentAccount(): IAccount | undefined {
    return this.accountsSubject.value.find(a => a.id === this.currentAccountIdSubject.value);
  }
}
