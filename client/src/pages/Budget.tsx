
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Budget = {
  id: number;
  name: string;
  limit: number;
  spent: number;
};

export default function Budget() {
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: 1, name: "Alimentação", limit: 500, spent: 320 },
    { id: 2, name: "Transporte", limit: 300, spent: 220 },
    { id: 3, name: "Lazer", limit: 200, spent: 180 },
    { id: 4, name: "Educação", limit: 400, spent: 200 },
  ]);

  const newBudgetSchema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    limit: z.coerce.number().min(1, { message: "Limite deve ser maior que zero" }),
  });

  type NewBudgetFormValues = z.infer<typeof newBudgetSchema>;

  const form = useForm<NewBudgetFormValues>({
    resolver: zodResolver(newBudgetSchema),
    defaultValues: {
      name: "",
      limit: 0,
    },
  });

  const onSubmit = (values: NewBudgetFormValues) => {
    const newBudget: Budget = {
      id: Date.now(),
      name: values.name,
      limit: values.limit,
      spent: 0,
    };
    
    setBudgets([...budgets, newBudget]);
    form.reset();
  };

  const getUsagePercentage = (spent: number, limit: number) => {
    return Math.min(Math.round((spent / limit) * 100), 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Orçamento</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Alimentação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="0,00" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percentage = getUsagePercentage(budget.spent, budget.limit);
          const statusColor = getStatusColor(percentage);
          
          return (
            <Card key={budget.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Target className="mr-2 h-5 w-5 text-indigo-500" />
                  {budget.name}
                </CardTitle>
                <CardDescription>
                  Limite: R$ {budget.limit.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>R$ {budget.spent.toFixed(2)} usado</span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2 w-full bg-gray-200" 
                  />
                  <div 
                    className={`h-2 rounded-full ${statusColor}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Restante: R$ {(budget.limit - budget.spent).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
