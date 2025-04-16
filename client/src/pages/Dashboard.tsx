
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart as RechartsLineChart, Line } from "recharts";
import { Link } from "wouter";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const [revenueData] = useState([
    { month: 'Jan', value: 3000 },
    { month: 'Fev', value: 3200 },
    { month: 'Mar', value: 2800 },
    { month: 'Abr', value: 3500 },
    { month: 'Mai', value: 3100 },
    { month: 'Jun', value: 3300 },
  ]);

  const [expenseData] = useState([
    { month: 'Jan', value: 2200 },
    { month: 'Fev', value: 2000 },
    { month: 'Mar', value: 2400 },
    { month: 'Abr', value: 2100 },
    { month: 'Mai', value: 2300 },
    { month: 'Jun', value: 2500 },
  ]);

  const [categoryData] = useState([
    { name: 'Alimentação', value: 500 },
    { name: 'Moradia', value: 1000 },
    { name: 'Transporte', value: 300 },
    { name: 'Lazer', value: 200 },
    { name: 'Outros', value: 150 },
  ]);

  const balanceData = revenueData.map((item, index) => ({
    month: item.month,
    receita: item.value,
    despesa: expenseData[index].value,
    saldo: item.value - expenseData[index].value
  }));

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Financeiro</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receitas do Mês
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                R$ 3.500,00
              </CardDescription>
            </div>
            <ArrowUpCircle className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-500">
              +12% comparado ao mês anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despesas do Mês
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                R$ 2.100,00
              </CardDescription>
            </div>
            <ArrowDownCircle className="h-6 w-6 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-red-500">
              -5% comparado ao mês anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo do Mês
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                R$ 1.400,00
              </CardDescription>
            </div>
            <Wallet className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-blue-500">
              +32% comparado ao mês anterior
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Histórico Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="balance">
              <TabsList>
                <TabsTrigger value="balance">Saldo</TabsTrigger>
                <TabsTrigger value="income">Receitas</TabsTrigger>
                <TabsTrigger value="expenses">Despesas</TabsTrigger>
              </TabsList>
              <TabsContent value="balance">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={balanceData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="receita" stroke="#4ade80" />
                      <Line type="monotone" dataKey="despesa" stroke="#f87171" />
                      <Line type="monotone" dataKey="saldo" stroke="#60a5fa" activeDot={{ r: 8 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="income">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={revenueData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                      <Bar dataKey="value" fill="#4ade80" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="expenses">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={expenseData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value}`, 'Despesa']} />
                      <Bar dataKey="value" fill="#f87171" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/transactions">
            <CardHeader className="flex flex-row items-center gap-4">
              <BarChart className="h-8 w-8 text-indigo-500" />
              <div>
                <CardTitle>Gerenciar Transações</CardTitle>
                <CardDescription>
                  Visualize e gerencie suas transações financeiras
                </CardDescription>
              </div>
            </CardHeader>
          </Link>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/budget">
            <CardHeader className="flex flex-row items-center gap-4">
              <TrendingUp className="h-8 w-8 text-indigo-500" />
              <div>
                <CardTitle>Gerenciar Orçamentos</CardTitle>
                <CardDescription>
                  Configure e acompanhe seus orçamentos mensais
                </CardDescription>
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
