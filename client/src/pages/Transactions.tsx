
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  PlusCircle, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  Edit2, 
  Trash2, 
  Filter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import type { Transaction } from "@/components/Finances/types";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, description: "Salário", amount: 3000, type: "income", date: "2024-04-05", category: "Receitas" },
    { id: 2, description: "Aluguel", amount: 800, type: "expense", date: "2024-04-10", category: "Moradia" },
    { id: 3, description: "Supermercado", amount: 350, type: "expense", date: "2024-04-15", category: "Alimentação" },
    { id: 4, description: "Tesouro Direto", amount: 500, type: "investment", date: "2024-04-20", category: "Investimentos" },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const transactionSchema = z.object({
    description: z.string().min(1, { message: "Descrição é obrigatória" }),
    amount: z.coerce.number().min(0.01, { message: "Valor deve ser maior que zero" }),
    type: z.enum(["income", "expense", "investment"], {
      required_error: "Selecione um tipo",
    }),
    date: z.date({
      required_error: "Selecione uma data",
    }),
    category: z.string().optional(),
  });

  type TransactionFormValues = z.infer<typeof transactionSchema>;

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "expense",
      category: "",
    },
  });

  const onSubmit = (values: TransactionFormValues) => {
    const dateString = values.date.toISOString().split('T')[0];
    
    if (editingTransaction) {
      // Editar transação existente
      const updatedTransactions = transactions.map(t => 
        t.id === editingTransaction.id 
          ? { 
              ...t, 
              description: values.description, 
              amount: values.amount, 
              type: values.type, 
              date: dateString,
              category: values.category
            } 
          : t
      );
      setTransactions(updatedTransactions);
    } else {
      // Adicionar nova transação
      const newTransaction: Transaction = {
        id: Date.now(),
        description: values.description,
        amount: values.amount,
        type: values.type,
        date: dateString,
        category: values.category
      };
      
      setTransactions([...transactions, newTransaction]);
    }
    
    form.reset();
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    form.reset({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      date: new Date(transaction.date),
      category: transaction.category,
    });
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const filteredTransactions = transactions
    .filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transações</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? "Editar Transação" : "Adicionar Transação"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Supermercado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="0,00" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="investment">Investimento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Alimentação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={() => {
                      form.reset();
                      setEditingTransaction(null);
                    }}>
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-sm"
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma transação encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Categoria</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Data</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Valor</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {transaction.type === "income" && (
                          <ArrowUpCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        )}
                        {transaction.type === "expense" && (
                          <ArrowDownCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                        )}
                        {transaction.type === "investment" && (
                          <ArrowUpCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                        )}
                        {transaction.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {transaction.category || "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {format(new Date(transaction.date), "dd/MM/yyyy")}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      transaction.type === "income" 
                        ? "text-green-600" 
                        : transaction.type === "expense" 
                          ? "text-red-600" 
                          : "text-blue-600"
                    }`}>
                      {transaction.type === "expense" ? "- " : "+ "}
                      R$ {transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
