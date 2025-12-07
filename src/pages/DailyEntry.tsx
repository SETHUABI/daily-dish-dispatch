import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Building2,
  Users,
  UtensilsCrossed,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Mock data
const mockCompanies = [
  { id: "1", name: "Tech Solutions Pvt Ltd" },
  { id: "2", name: "Global Industries" },
  { id: "3", name: "Sunrise Corporation" },
];

const mockEmployees: Record<string, Array<{ id: string; name: string; default_price: number }>> = {
  "1": [
    { id: "1", name: "Rahul Sharma", default_price: 150 },
    { id: "2", name: "Priya Patel", default_price: 150 },
  ],
  "2": [
    { id: "3", name: "Amit Kumar", default_price: 180 },
    { id: "4", name: "Sneha Reddy", default_price: 180 },
  ],
  "3": [
    { id: "5", name: "Vikram Singh", default_price: 160 },
  ],
};

const mockFoodItems = [
  { id: "1", name: "Lunch Thali", default_price: 150 },
  { id: "2", name: "Special Meals", default_price: 200 },
  { id: "3", name: "Breakfast Combo", default_price: 80 },
];

interface DailyTransaction {
  id: string;
  employee_id: string;
  employee_name: string;
  food_item_id: string;
  food_item_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  price_source: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DailyEntry() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedFoodItem, setSelectedFoodItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [transactions, setTransactions] = useState<DailyTransaction[]>([]);

  const employees = selectedCompany ? mockEmployees[selectedCompany] || [] : [];
  const selectedEmployeeData = employees.find((e) => e.id === selectedEmployee);
  const selectedFoodItemData = mockFoodItems.find((f) => f.id === selectedFoodItem);

  // Price calculation logic (simplified)
  const getEffectivePrice = () => {
    if (selectedEmployeeData) {
      return {
        price: selectedEmployeeData.default_price,
        source: "Employee default",
      };
    }
    if (selectedFoodItemData) {
      return {
        price: selectedFoodItemData.default_price,
        source: "Food item default",
      };
    }
    return { price: 0, source: "N/A" };
  };

  const { price: unitPrice, source: priceSource } = getEffectivePrice();
  const totalAmount = unitPrice * quantity;

  const handleAddEntry = () => {
    if (!selectedCompany || !selectedEmployee || !selectedFoodItem) {
      toast({
        title: "Missing information",
        description: "Please select company, employee, and food item.",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: DailyTransaction = {
      id: Date.now().toString(),
      employee_id: selectedEmployee,
      employee_name: selectedEmployeeData?.name || "",
      food_item_id: selectedFoodItem,
      food_item_name: selectedFoodItemData?.name || "",
      quantity,
      unit_price: unitPrice,
      total_amount: totalAmount,
      price_source: priceSource,
    };

    setTransactions([newTransaction, ...transactions]);
    
    // Reset for quick next entry
    setSelectedEmployee("");
    setQuantity(1);

    toast({
      title: "Entry added",
      description: `${newTransaction.employee_name} - ${newTransaction.food_item_name}`,
    });
  };

  const handleDeleteEntry = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast({
      title: "Entry removed",
      description: "Transaction has been deleted.",
    });
  };

  const todayTotal = transactions.reduce((sum, t) => sum + t.total_amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Daily Entry
        </h1>
        <p className="text-muted-foreground">
          Record daily food consumption quickly and efficiently
        </p>
      </div>

      {/* Entry Form */}
      <div className="stat-card">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={selectedCompany} onValueChange={(v) => {
              setSelectedCompany(v);
              setSelectedEmployee("");
            }}>
              <SelectTrigger>
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {mockCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employee */}
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select 
              value={selectedEmployee} 
              onValueChange={setSelectedEmployee}
              disabled={!selectedCompany}
            >
              <SelectTrigger>
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Food Item */}
          <div className="space-y-2">
            <Label>Food Item</Label>
            <Select value={selectedFoodItem} onValueChange={setSelectedFoodItem}>
              <SelectTrigger>
                <UtensilsCrossed className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {mockFoodItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Add Button */}
          <div className="space-y-2">
            <Label className="invisible">Action</Label>
            <Button onClick={handleAddEntry} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Price Preview */}
        {selectedEmployee && selectedFoodItem && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Unit Price:</span>
              <span className="font-semibold text-lg">{formatCurrency(unitPrice)}</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Price source: {priceSource}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-display font-bold text-2xl text-primary">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Today's Summary */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">
          Today's Entries ({transactions.length})
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total:</span>
          <Badge variant="default" className="text-lg px-3 py-1">
            {formatCurrency(todayTotal)}
          </Badge>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Employee</TableHead>
              <TableHead>Food Item</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No entries yet. Add your first entry above.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="group">
                  <TableCell className="font-medium">
                    {transaction.employee_name}
                  </TableCell>
                  <TableCell>{transaction.food_item_name}</TableCell>
                  <TableCell className="text-center">{transaction.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.unit_price)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(transaction.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => handleDeleteEntry(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
