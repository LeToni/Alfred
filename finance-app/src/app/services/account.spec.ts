import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AccountService, IAccount } from './account';

describe('AccountService', () => {
  let service: AccountService;
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
    service = TestBed.inject(AccountService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create default accounts if none exist', async () => {
    return new Promise(resolve => {
      service.accounts$.subscribe(accounts => {
        if (accounts && accounts.length > 0) {
          expect(accounts.length).toBe(2);
          expect(accounts[0].name).toBe('Main Account');
          expect(accounts[1].name).toBe('Savings');
          resolve(null);
        }
      });
    });
  });

  it('should set current account ID', async () => {
    return new Promise(resolve => {
      service.currentAccountId$.subscribe(id => {
        if (id) {
          expect(id).toBeTruthy();
          resolve(null);
        }
      });
    });
  });

  it('should get current account', async () => {
    return new Promise(resolve => {
      let accounts: IAccount[] = [];
      let resolved = false;

      service.accounts$.subscribe(accs => {
        accounts = accs;
        
        if (accounts.length > 0 && !resolved) {
          const currentAccId = accounts[0].id;
          service.setCurrentAccount(currentAccId);
          const current = service.getCurrentAccount();
          
          expect(current).toBeTruthy();
          expect(current?.id).toBe(currentAccId);
          resolved = true;
          resolve(null);
        }
      });
    });
  });
});
