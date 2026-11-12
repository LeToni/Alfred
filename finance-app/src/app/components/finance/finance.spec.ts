import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Finance } from './finance';
import { AccountService } from '../../services/account';
import { TransactionService, ITransaction } from '../../services/transaction';
import { of } from 'rxjs';

describe('Finance Component', () => {
  let component: Finance;
  let fixture: ComponentFixture<Finance>;
  let transactionService: any;

  beforeEach(async () => {
    const mockAccountService = {
      accounts$: of([
        { id: 'acc-1', name: 'Main Account' },
        { id: 'acc-2', name: 'Savings' }
      ]),
      currentAccountId$: of('acc-1'),
      setCurrentAccount: vi.fn(),
      getCurrentAccount: vi.fn()
    };

    const mockTransactionService = {
      transactions$: of([]),
      getTransactionsForAccount: vi.fn().mockReturnValue([]),
      addTransaction: vi.fn(),
      deleteTransaction: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Finance],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: TransactionService, useValue: mockTransactionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Finance);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with today\'s date', () => {
    const today = new Date();
    const expectedDate = today.getFullYear() + '-' + 
                        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(today.getDate()).padStart(2, '0');
    expect(component.date).toBe(expectedDate);
  });

  it('should format money correctly', () => {
    const result = component.formatMoney(100000n);
    expect(result).toContain('€');
    expect(result).toContain('1,000.00');
  });

  it('should classify balance correctly', () => {
    expect(component.getBalanceClass(100n)).toBe('positive');
    expect(component.getBalanceClass(-100n)).toBe('negative');
    expect(component.getBalanceClass(0n)).toBe('balanced');
  });

  it('should select account', () => {
    const accountService = TestBed.inject(AccountService);
    component.selectAccount('acc-2');
    expect(accountService.setCurrentAccount).toHaveBeenCalledWith('acc-2');
  });

  it('should check if account is active', () => {
    component.currentAccountId = 'acc-1';
    expect(component.isActive('acc-1')).toBe(true);
    expect(component.isActive('acc-2')).toBe(false);
  });

  it('should calculate account balance correctly', () => {
    const mockTransactions: ITransaction[] = [
      { id: '1', accountId: 'acc-1', description: 'Income', type: 'income', cents: 50000, date: '2026-11-12' },
      { id: '2', accountId: 'acc-1', description: 'Expense', type: 'expense', cents: 20000, date: '2026-11-12' }
    ];
    (transactionService.getTransactionsForAccount as any).mockReturnValue(mockTransactions);

    const balance = component.getAccountBalance('acc-1');
    expect(balance).toBe(30000n);
  });

  it('should add a valid transaction', () => {
    component.currentAccountId = 'acc-1';
    component.description = 'Test expense';
    component.amount = '50.00';
    component.type = 'expense';
    component.date = '2026-11-12';

    component.addTransaction();

    expect(transactionService.addTransaction).toHaveBeenCalled();
    const call = (transactionService.addTransaction as any).mock.calls[0];
    expect(call[0].description).toBe('Test expense');
    expect(call[0].cents).toBe(5000);
  });

  it('should not add transaction without description', () => {
    component.currentAccountId = 'acc-1';
    component.description = '';
    component.amount = '50.00';

    component.addTransaction();

    expect(transactionService.addTransaction).not.toHaveBeenCalled();
  });

  it('should not add transaction without amount', () => {
    component.currentAccountId = 'acc-1';
    component.description = 'Test';
    component.amount = '';

    component.addTransaction();

    expect(transactionService.addTransaction).not.toHaveBeenCalled();
  });

  it('should delete a transaction', () => {
    component.deleteTransaction('trans-1');
    expect(transactionService.deleteTransaction).toHaveBeenCalledWith('trans-1');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2026-11-12');
    expect(result).toContain('2026');
  });

  it('should clear form after adding transaction', () => {
    component.currentAccountId = 'acc-1';
    component.description = 'Test';
    component.amount = '25.50';
    component.type = 'income';

    component.addTransaction();

    expect(component.description).toBe('');
    expect(component.amount).toBe('');
    expect(component.type).toBe('expense');
  });

  it('should calculate summary correctly', () => {
    const mockTransactions: ITransaction[] = [
      { id: '1', accountId: 'acc-1', description: 'Salary', type: 'income', cents: 100000, date: '2026-11-12' },
      { id: '2', accountId: 'acc-1', description: 'Bonus', type: 'income', cents: 50000, date: '2026-11-12' },
      { id: '3', accountId: 'acc-1', description: 'Food', type: 'expense', cents: 20000, date: '2026-11-12' }
    ];
    
    component.currentAccountId = 'acc-1';
    (transactionService.getTransactionsForAccount as any).mockReturnValue(mockTransactions);

    const summary = component.getSummary();
    expect(summary.income).toBe(150000n);
    expect(summary.expenses).toBe(20000n);
    expect(summary.balance).toBe(130000n);
  });

  it('should get account balance class', () => {
    const mockTransactions: ITransaction[] = [
      { id: '1', accountId: 'acc-1', description: 'Income', type: 'income', cents: 100000, date: '2026-11-12' },
      { id: '2', accountId: 'acc-1', description: 'Expense', type: 'expense', cents: 50000, date: '2026-11-12' }
    ];
    (transactionService.getTransactionsForAccount as any).mockReturnValue(mockTransactions);

    const balanceClass = component.getAccountBalanceClass('acc-1');
    expect(balanceClass).toBe('positive');
  });
});
