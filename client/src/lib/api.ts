import { supabase } from './supabase';
import { MonthData, Transaction, Budget } from '@/components/Finances/types';

// Profiles
export const getProfile = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.user.id)
    .single();
    
  if (error) throw error;
  return data;
};

// Month Settings
export const getMonthSettings = async (yearMonth: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  const { data, error } = await supabase
    .from('month_settings')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('year_month', yearMonth)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned"
  
  return data || { initial_balance: 0 };
};

export const saveMonthSettings = async (yearMonth: string, initialBalance: number) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  // Check if settings already exist
  const { data: existingSettings } = await supabase
    .from('month_settings')
    .select('id')
    .eq('user_id', user.user.id)
    .eq('year_month', yearMonth)
    .single();
    
  if (existingSettings) {
    // Update existing settings
    const { data, error } = await supabase
      .from('month_settings')
      .update({ initial_balance: initialBalance })
      .eq('id', existingSettings.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } else {
    // Insert new settings
    const { data, error } = await supabase
      .from('month_settings')
      .insert([{ 
        user_id: user.user.id, 
        year_month: yearMonth, 
        initial_balance: initialBalance 
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};

// Transactions
export const getTransactions = async (yearMonth: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  // Extract year and month from yearMonth (format: YYYY-MM)
  const [year, month] = yearMonth.split('-');
  
  // Calculate start and end dates for the month
  const startDate = `${year}-${month}-01`;
  const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]; // Last day of month
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
    
  if (error) throw error;
  
  return data || [];
};

export const saveTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ 
      user_id: user.user.id,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
      budget_id: transaction.budgetId
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateTransaction = async (id: number, transaction: Omit<Transaction, 'id'>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  const { data, error } = await supabase
    .from('transactions')
    .update({ 
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
      budget_id: transaction.budgetId
    })
    .eq('id', id)
    .eq('user_id', user.user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteTransaction = async (id: number) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.user.id);
    
  if (error) throw error;
  return true;
};

// Budgets
export const getBudgets = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.user.id);
    
  if (error) throw error;
  return data || [];
};

export const saveBudget = async (budget: Omit<Budget, 'id'>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  const { data, error } = await supabase
    .from('budgets')
    .insert([{ 
      user_id: user.user.id,
      name: budget.name,
      budget_limit: budget.limit
    }])
    .select()
    .single();
    
  if (error) throw error;
  return {
    ...data,
    limit: data.budget_limit
  };
};

export const updateBudget = async (id: number, budget: Omit<Budget, 'id'>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  const { data, error } = await supabase
    .from('budgets')
    .update({ 
      name: budget.name,
      budget_limit: budget.limit
    })
    .eq('id', id)
    .eq('user_id', user.user.id)
    .select()
    .single();
    
  if (error) throw error;
  return {
    ...data,
    limit: data.budget_limit
  };
};

export const deleteBudget = async (id: number) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not found');
  
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.user.id);
    
  if (error) throw error;
  return true;
};

// Get all data for a specific month
export const getMonthData = async (yearMonth: string): Promise<MonthData> => {
  const [monthSettings, transactions, budgets] = await Promise.all([
    getMonthSettings(yearMonth),
    getTransactions(yearMonth),
    getBudgets()
  ]);
  
  return {
    initialBalance: monthSettings.initial_balance || 0,
    transactions: transactions.map(t => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      date: t.date,
      budgetId: t.budget_id
    })),
    budgets: budgets.map(b => ({
      id: b.id,
      name: b.name,
      limit: b.budget_limit
    }))
  };
};

// Save all data for a specific month
export const saveMonthData = async (yearMonth: string, data: MonthData) => {
  await saveMonthSettings(yearMonth, data.initialBalance);
  
  // Note: This is a simplified approach. In a real app, you would need to
  // handle creating, updating, and deleting transactions and budgets based on changes.
};