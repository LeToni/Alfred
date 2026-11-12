# Finance App - Angular Version

A modern, responsive personal finance management application built with Angular 21+, featuring multi-account support with intuitive stacked card UI.

## Features

### 📱 Multi-Account Management
- View multiple bank accounts with stacked card design
- Click any account to move it to the center position
- Smooth hover animations with ±8° rotation fan-out effect
- Account balances with color-coded indicators

### 💰 Transaction Tracking
- Add income and expense transactions
- Categorize transactions with custom descriptions
- View transaction history per account
- Delete transactions with a single click

### 🎨 Smart Balance Indicators
- **Green**: Income exceeds expenses (positive balance)
- **Red**: Expenses exceed income (negative balance)
- **Black**: Income equals expenses (balanced)

### 💶 Multi-Currency Support
- Built with EUR currency formatting
- Supports localized number and date formatting
- Uses BigInt for precise financial calculations

### 💾 Persistent Storage
- LocalStorage integration for data persistence
- Automatic data recovery on page reload
- Secure offline operation

## Project Structure

```
finance-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── finance/
│   │   │       ├── finance.ts        # Main component logic
│   │   │       ├── finance.html      # Component template
│   │   │       └── finance.css       # Component styles
│   │   ├── services/
│   │   │   ├── account.ts            # Account management service
│   │   │   └── transaction.ts        # Transaction management service
│   │   ├── app.ts                    # Root component
│   │   └── app.html                  # Root template
│   ├── main.ts                       # Application entry point
│   ├── styles.css                    # Global styles
│   └── index.html                    # HTML template
├── package.json
└── tsconfig.json
```

## Services

### AccountService
- Manages account creation and selection
- Handles account reordering
- Provides reactive account updates via RxJS Observables

### TransactionService
- Manages transaction storage and retrieval
- Filters transactions per account
- Handles transaction creation and deletion

## Technologies

- **Angular 21+** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **LocalStorage API** - Data persistence
- **Intl API** - Internationalization

## Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 21+

### Installation

```bash
npm install
```

### Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

### Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Data Model

### Account
```typescript
interface IAccount {
  id: string;      // Unique identifier
  name: string;    // Account name (e.g., "Main Account")
}
```

### Transaction
```typescript
interface ITransaction {
  id: string;                    // Unique identifier
  accountId: string;             // Associated account
  description: string;           // Transaction description
  type: 'income' | 'expense';    // Transaction type
  cents: number;                 // Amount in cents (for precision)
  date: string;                  // ISO date string
}
```

## Features Roadmap

- [ ] Transaction editing
- [ ] Budget setting and tracking
- [ ] Category-based transaction filtering
- [ ] Export to CSV/PDF
- [ ] Dark mode support
- [ ] Mobile app version
- [ ] Multi-currency support
- [ ] Data synchronization across devices

## License

MIT
