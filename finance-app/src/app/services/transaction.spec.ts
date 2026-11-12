import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TransactionService, ITransaction } from './transaction';

describe('TransactionService', () => {
  let service: TransactionService;
  let store: { [key: string]: string } = {};

  beforeEach(() => {
    store = {};
    
    // Mock localStorage BEFORE creating the service
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      length: Object.keys(store).length,
      key: (index: number) => Object.keys(store)[index] || null
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load default dummy transactions', async () => {
    return new Promise(resolve => {
      service.transactions$.subscribe(transactions => {
        if (transactions && transactions.length > 0) {
          expect(transactions.length).toBeGreaterThan(0);
          resolve(null);
        }
      });
    });
  });

  it('should add a transaction', async () => {
    return new Promise(resolve => {
      const newTransaction: ITransaction = {
        id: 'test-1',
        accountId: 'acc-1',
        description: 'Test expense',
        type: 'expense',
        cents: 5000,
        date: '2026-11-12'
      };

      service.addTransaction(newTransaction);

      service.transactions$.subscribe(transactions => {
        const found = transactions.find(t => t.id === 'test-1');
        if (found) {
          expect(found.description).toBe('Test expense');
          resolve(null);
        }
      });
    });
  });

  it('should delete a transaction', async () => {
    return new Promise(resolve => {
      const newTransaction: ITransaction = {
        id: 'delete-test',
        accountId: 'acc-1',
        description: 'To delete',
        type: 'expense',
        cents: 1000,
        date: '2026-11-12'
      };

      service.addTransaction(newTransaction);
      service.deleteTransaction('delete-test');

      service.transactions$.subscribe(transactions => {
        const found = transactions.find(t => t.id === 'delete-test');
        expect(found).toBeUndefined();
        resolve(null);
      });
    });
  });

  it('should filter transactions by account', () => {
    const trans1: ITransaction = {
      id: 'trans-1',
      accountId: 'acc-1',
      description: 'Test 1',
      type: 'income',
      cents: 10000,
      date: '2026-11-12'
    };
    const trans2: ITransaction = {
      id: 'trans-2',
      accountId: 'acc-2',
      description: 'Test 2',
      type: 'expense',
      cents: 5000,
      date: '2026-11-12'
    };

    service.addTransaction(trans1);
    service.addTransaction(trans2);

    const filtered = service.getTransactionsForAccount('acc-1');
    expect(filtered.find(t => t.id === 'trans-1')).toBeDefined();
    expect(filtered.find(t => t.id === 'trans-2')).toBeUndefined();
  });

  it('should sort transactions by date descending', () => {
    const trans1: ITransaction = {
      id: 'trans-1',
      accountId: 'acc-1',
      description: 'Old',
      type: 'income',
      cents: 10000,
      date: '2026-11-10'
    };
    const trans2: ITransaction = {
      id: 'trans-2',
      accountId: 'acc-1',
      description: 'New',
      type: 'expense',
      cents: 5000,
      date: '2026-11-12'
    };

    service.addTransaction(trans1);
    service.addTransaction(trans2);

    const filtered = service.getTransactionsForAccount('acc-1');
    // Should be sorted newest first
    expect(filtered[0]?.date).toBe('2026-11-12');
    expect(filtered[filtered.length - 1]?.date).toBe('2026-11-10');
  });
});
