import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet,
  Settings,
  Plus,
  Receipt,
  PiggyBank,
  History,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { useLocation } from 'wouter';
import MonthSelector from './MonthSelector';
import FinancialCard from './FinancialCard';
import BudgetsSection from './BudgetsSection';
import TransactionsSection from './TransactionsSection';
import NewTransactionModal from './NewTransactionModal';
import NewBudgetModal from './NewBudgetModal';
import TransactionsModal from './TransactionsModal';
import SettingsModal from './SettingsModal';
import { EditingTransaction, Transaction, Budget } from './types';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { signOut } from '@/lib/supabase';

export default function Finances() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempInitialBalance, setTempInitialBalance] = useState('');
  const [budgetName, setBudgetName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'investment'>('income');
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | undefined>(undefined);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<EditingTransaction>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check if user has previously set a theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // Check if user has a system preference
      if (!savedTheme) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return (savedTheme as 'light' | 'dark');
    }
    return 'light';
  });
  const [currency, setCurrency] = useState<'BRL' | 'USD' | 'EUR'>('BRL');
  const monthSelectorRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Get current month key (YYYY-MM format)
  const getCurrentMonthKey = () => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
  };

  // Use the custom hook to fetch and manage data from Supabase
  const {
    data: monthData,
    loading,
    error,
    updateInitialBalance,
    addTransaction,
    editTransaction,
    removeTransaction,
    addBudget,
    editBudget,
    removeBudget
  } = useSupabaseData(getCurrentMonthKey());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate first and last day of the selected month
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const firstDayWeekday = firstDayOfMonth.getDay();

  // Generate calendar days array including empty slots for proper alignment
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstDayWeekday + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return dayNumber;
    }
    return null;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthSelectorRef.current && !monthSelectorRef.current.contains(event.target as Node)) {
        setIsMonthSelectorOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditingBalance) {
      setTempInitialBalance(monthData.initialBalance.toString());
    }
  }, [isEditingBalance, monthData.initialBalance]);

  useEffect(() => {
    // Reset selected budget when changing transaction type
    if (type !== 'expense') {
      setSelectedBudgetId(undefined);
    }
  }, [type]);

  // Update selected day when month changes
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedDate, daysInMonth]);

  // Apply dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Ocorreu um erro ao tentar sair.",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleYearChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newDate.getFullYear() + increment);
    setSelectedDate(newDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(monthIndex);
    setSelectedDate(newDate);
    setIsMonthSelectorOpen(false);
  };

  const formatDate = (day: number) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTransaction: Omit<Transaction, 'id'> = {
      description,
      amount: parseFloat(amount),
      type,
      date: formatDate(selectedDay),
      budgetId: type === 'expense' ? selectedBudgetId : undefined,
    };

    try {
      if (editingTransaction) {
        await editTransaction(editingTransaction.id, newTransaction);
      } else {
        await addTransaction(newTransaction);
      }
      
      setEditingTransaction(null);
      setDescription('');
      setAmount('');
      setSelectedDay(new Date().getDate());
      setSelectedBudgetId(undefined);
      setType('income');
      setIsNewTransactionModalOpen(false);
    } catch (error) {
      console.error('Error handling transaction:', error);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    const transactionDate = new Date(transaction.date);
    setSelectedDay(transactionDate.getDate());
    setSelectedBudgetId(transaction.budgetId);
    setIsTransactionsModalOpen(false);
    setIsNewTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await removeTransaction(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetName || !budgetLimit) return;

    try {
      // Check if we're editing an existing budget
      if (editingBudget) {
        await editBudget(editingBudget.id, {
          name: budgetName,
          limit: parseFloat(budgetLimit)
        });
        setEditingBudget(null);
      } else {
        // Create a new budget
        await addBudget({
          name: budgetName,
          limit: parseFloat(budgetLimit)
        });
      }
      
      setBudgetName('');
      setBudgetLimit('');
      setIsNewBudgetModalOpen(false);
    } catch (error) {
      console.error('Error handling budget:', error);
    }
  };
  
  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetName(budget.name);
    setBudgetLimit(budget.limit.toString());
    setIsNewBudgetModalOpen(true);
  };
  
  const handleDeleteBudget = async (id: number) => {
    try {
      await removeBudget(id);
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleInitialBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateInitialBalance(parseFloat(tempInitialBalance) || 0);
      setIsEditingBalance(false);
    } catch (error) {
      console.error('Error updating initial balance:', error);
    }
  };

  const { transactions, budgets, initialBalance } = monthData;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestments = transactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = initialBalance + totalIncome - totalExpenses - totalInvestments;

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  
  // Total usado: apenas despesas associadas a orçamentos
  const totalUsed = transactions
    .filter(t => t.type === 'expense' && t.budgetId !== undefined)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Saldo estimado: saldo atual - (orçamentos - despesas já realizadas em orçamentos)
  const remainingBudget = totalBudgeted - totalUsed;
  // Se não há orçamentos, o saldo estimado é 0
  const estimatedBalance = totalBudgeted === 0 ? 0 : balance - remainingBudget;

  const getBudgetUsage = (budgetId: number) => {
    return transactions
      .filter(t => t.type === 'expense' && t.budgetId === budgetId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getBudgetName = (budgetId: number | undefined) => {
    if (!budgetId) return '';
    const budget = budgets.find(b => b.id === budgetId);
    return budget ? budget.name : 'Orçamento não encontrado';
  };

  const formatDisplayDate = (day: number) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (value: number): string => {
    const locale = currency === 'BRL' ? 'pt-BR' : currency === 'USD' ? 'en-US' : 'de-DE';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Erro ao carregar dados</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20 safe-area-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 pt-4 md:pt-0">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Minhas Finanças</h1>
            </div>
            <div className="flex space-x-2">
              <button 
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              <button 
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Histórico de transações"
                onClick={() => setIsTransactionsModalOpen(true)}
              >
                <History className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Configurações"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Sair"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 text-red-500 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <MonthSelector 
            months={months}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            currentYear={currentYear}
            isMonthSelectorOpen={isMonthSelectorOpen}
            setIsMonthSelectorOpen={setIsMonthSelectorOpen}
            handleYearChange={handleYearChange}
            handleMonthSelect={handleMonthSelect}
            monthSelectorRef={monthSelectorRef}
            isEditingBalance={isEditingBalance}
            setIsEditingBalance={setIsEditingBalance}
            tempInitialBalance={tempInitialBalance}
            setTempInitialBalance={setTempInitialBalance}
            handleInitialBalanceSubmit={handleInitialBalanceSubmit}
            initialBalance={initialBalance}
            formatCurrency={formatCurrency}
          />

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <FinancialCard 
              title="Saldo Atual"
              amount={balance}
              type="balance"
              formatCurrency={formatCurrency}
            />
            
            <FinancialCard 
              title="Receitas"
              amount={totalIncome}
              type="income"
              formatCurrency={formatCurrency}
            />
            
            <FinancialCard 
              title="Despesas"
              amount={totalExpenses}
              type="expense"
              formatCurrency={formatCurrency}
            />
            
            <FinancialCard 
              title="Investimentos"
              amount={totalInvestments}
              type="investment"
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Budget and Transactions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budgets Section */}
            <div className="lg:col-span-1">
              <BudgetsSection 
                budgets={budgets}
                totalBudgeted={totalBudgeted}
                totalUsed={totalUsed}
                estimatedBalance={estimatedBalance}
                getBudgetUsage={getBudgetUsage}
                setIsNewBudgetModalOpen={setIsNewBudgetModalOpen}
                handleEditBudget={handleEditBudget}
                handleDeleteBudget={handleDeleteBudget}
                formatCurrency={formatCurrency}
              />
            </div>
            
            {/* Transactions Section */}
            <div className="lg:col-span-2">
              <TransactionsSection 
                transactions={transactions}
                sortedTransactions={sortedTransactions}
                setIsTransactionsModalOpen={setIsTransactionsModalOpen}
                setIsActionMenuOpen={setIsActionMenuOpen}
                isActionMenuOpen={isActionMenuOpen}
                setType={setType}
                setIsNewTransactionModalOpen={setIsNewTransactionModalOpen}
                setIsNewBudgetModalOpen={setIsNewBudgetModalOpen}
                handleEditTransaction={handleEditTransaction}
                handleDeleteTransaction={handleDeleteTransaction}
                getBudgetName={getBudgetName}
                formatCurrency={formatCurrency}
                formatDisplayDate={formatDisplayDate}
                actionMenuRef={actionMenuRef}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {isNewTransactionModalOpen && (
        <NewTransactionModal 
          isOpen={isNewTransactionModalOpen}
          setIsOpen={setIsNewTransactionModalOpen}
          type={type}
          setType={setType}
          description={description}
          setDescription={setDescription}
          amount={amount}
          setAmount={setAmount}
          selectedBudgetId={selectedBudgetId}
          setSelectedBudgetId={setSelectedBudgetId}
          budgets={budgets}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          isCalendarOpen={isCalendarOpen}
          setIsCalendarOpen={setIsCalendarOpen}
          calendarRef={calendarRef}
          handleSubmit={handleSubmit}
          editingTransaction={editingTransaction}
          setEditingTransaction={setEditingTransaction}
          formatDisplayDate={formatDisplayDate}
          calendarDays={calendarDays}
          weekDays={weekDays}
          firstDayWeekday={firstDayWeekday}
          daysInMonth={daysInMonth}
        />
      )}

      {isNewBudgetModalOpen && (
        <NewBudgetModal 
          isOpen={isNewBudgetModalOpen}
          setIsOpen={setIsNewBudgetModalOpen}
          budgetName={budgetName}
          setBudgetName={setBudgetName}
          budgetLimit={budgetLimit}
          setBudgetLimit={setBudgetLimit}
          handleBudgetSubmit={handleBudgetSubmit}
        />
      )}

      {isTransactionsModalOpen && (
        <TransactionsModal 
          isOpen={isTransactionsModalOpen}
          setIsOpen={setIsTransactionsModalOpen}
          transactions={transactions}
          sortedTransactions={sortedTransactions}
          handleEditTransaction={handleEditTransaction}
          handleDeleteTransaction={handleDeleteTransaction}
          getBudgetName={getBudgetName}
          formatCurrency={formatCurrency}
          formatDisplayDate={formatDisplayDate}
          setIsNewTransactionModalOpen={setIsNewTransactionModalOpen}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal 
          isOpen={isSettingsModalOpen}
          setIsOpen={setIsSettingsModalOpen}
          theme={theme}
          setTheme={setTheme}
          currency={currency}
          setCurrency={setCurrency}
        />
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 safe-area-bottom">
        <div className="relative" ref={actionMenuRef}>
          {isActionMenuOpen && (
            <div 
              className="absolute bottom-12 right-0 flex flex-col items-end space-y-2 mb-2"
            >
              <button
                onClick={() => {
                  setIsActionMenuOpen(false);
                  setIsNewTransactionModalOpen(true);
                }}
                className="flex items-center bg-white dark:bg-gray-900 py-2 px-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-800"
              >
                <span className="text-gray-800 dark:text-white text-sm mr-1">Nova Transação</span>
                <Receipt className="h-4 w-4 text-blue-500" />
              </button>
              
              <button
                onClick={() => {
                  setIsActionMenuOpen(false);
                  setIsNewBudgetModalOpen(true);
                }}
                className="flex items-center bg-white dark:bg-gray-900 py-2 px-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-800"
              >
                <span className="text-gray-800 dark:text-white text-sm mr-1">Novo Orçamento</span>
                <PiggyBank className="h-4 w-4 text-green-500" />
              </button>
            </div>
          )}
          
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
            aria-label="Adicionar novo"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}