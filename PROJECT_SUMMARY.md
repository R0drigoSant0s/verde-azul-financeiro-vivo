# My Finances - Project Summary

## Overview
My Finances is a personal finance management application built with React, TypeScript, and Tailwind CSS. It allows users to track their income, expenses, and investments, manage budgets, and view financial summaries by month.

## Key Features
- Track income, expenses, and investments
- Manage monthly budgets with progress tracking
- View financial summaries with cards for balance, income, expenses, and investments
- Monthly data selection with calendar interface
- Dark mode support
- Multiple currency format options

## Project Structure

### Main Components
- `Finances/index.tsx` - Main container component that orchestrates the entire application
- `FinancialCard.tsx` - Cards displaying financial summaries (balance, income, expenses, investments)
- `BudgetsSection.tsx` - Section for managing and displaying budgets
- `TransactionsSection.tsx` - Section for displaying recent transactions
- `MonthSelector.tsx` - Component for selecting month and year
- `NewTransactionModal.tsx` - Modal for adding/editing transactions
- `NewBudgetModal.tsx` - Modal for adding/editing budgets
- `SettingsModal.tsx` - Modal for app settings (theme, currency)
- `TransactionsModal.tsx` - Modal for viewing all transactions

### Data Structure
- `Transaction` - Represents financial transactions with properties:
  - `id`: Unique identifier
  - `description`: Description of the transaction
  - `amount`: Monetary value
  - `type`: 'income', 'expense', or 'investment'
  - `date`: Date of the transaction
  - `budgetId`: Optional reference to a budget (for expenses)

- `Budget` - Represents spending budgets with properties:
  - `id`: Unique identifier
  - `name`: Budget name
  - `limit`: Maximum amount allocated

- `MonthData` - Stores data for each month:
  - `transactions`: Array of transactions
  - `budgets`: Array of budgets
  - `initialBalance`: Starting balance for the month

### State Management
- Uses React's useState and useEffect hooks for state management
- Data is organized by month in the `monthlyData` state object
- Each month has its own transactions, budgets, and initial balance

### UI Features
- Responsive design that works on mobile and desktop
- Dark mode toggle
- Currency format selection (BRL, USD, EUR)
- Interactive calendar for date selection
- Progress bars for budget tracking
- Floating action button for adding transactions and budgets

### PWA Support
The application includes Progressive Web App features:
- Can be installed on mobile devices
- Full-screen support for iPhones
- Custom icons for home screen

## Implementation Details

### Data Persistence
- Currently uses in-memory storage with React state
- Data is organized by month in the `monthlyData` state object

### Theming
- Supports light and dark modes
- Theme is applied using CSS classes and Tailwind's dark mode

### Formatting
- Currency formatting based on locale (BRL, USD, EUR)
- Date formatting for display

### Modals
- Transaction creation/editing
- Budget creation/editing
- Settings configuration
- Transaction history viewing

## Future Enhancements
- Data persistence with a backend database
- User authentication
- Data export/import
- Financial reports and analytics
- Recurring transactions
- Financial goals tracking