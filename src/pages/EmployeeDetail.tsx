import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingBag,
  History,
  User,
  Phone,
  Building2,
  IndianRupee,
  Calendar,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock data
const mockEmployees = [
  {
    id: "1",
    name: "Rahul Sharma",
    employee_code: "EMP001",
    company_id: "1",
    company_name: "Tech Solutions Pvt Ltd",
    phone: "+91 98765 43210",
    default_meal_price: 150,
    status: "active" as const,
    image_url: null,
  },
  {
    id: "2",
    name: "Priya Patel",
    employee_code: "EMP002",
    company_id: "1",
    company_name: "Tech Solutions Pvt Ltd",
    phone: "+91 98765 43211",
    default_meal_price: 150,
    status: "active" as const,
    image_url: null,
  },
  {
    id: "3",
    name: "Amit Kumar",
    employee_code: "EMP003",
    company_id: "2",
    company_name: "Global Industries",
    phone: "+91 98765 43212",
    default_meal_price: 180,
    status: "active" as const,
    image_url: null,
  },
];

const mockFoodItems = [
  { id: "1", name: "Regular Thali", category: "Lunch", default_price: 150, is_active: true },
  { id: "2", name: "Special Thali", category: "Lunch", default_price: 200, is_active: true },
  { id: "3", name: "Breakfast Combo", category: "Breakfast", default_price: 80, is_active: true },
  { id: "4", name: "Snacks Plate", category: "Snacks", default_price: 50, is_active: true },
  { id: "5", name: "Dinner Thali", category: "Dinner", default_price: 180, is_active: true },
];

const mockTransactions = [
  {
    id: "1",
    date: "2024-01-15",
    food_item_name: "Regular Thali",
    quantity: 1,
    unit_price: 150,
    total_amount: 150,
  },
  {
    id: "2",
    date: "2024-01-14",
    food_item_name: "Special Thali",
    quantity: 1,
    unit_price: 200,
    total_amount: 200,
  },
  {
    id: "3",
    date: "2024-01-14",
    food_item_name: "Breakfast Combo",
    quantity: 2,
    unit_price: 80,
    total_amount: 160,
  },
  {
    id: "4",
    date: "2024-01-13",
    food_item_name: "Regular Thali",
    quantity: 1,
    unit_price: 150,
    total_amount: 150,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface CartItem {
  food_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState("menu");

  const employee = mockEmployees.find((e) => e.id === id);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Employee not found</p>
        <Button variant="outline" onClick={() => navigate("/employees")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      </div>
    );
  }

  const addToCart = (foodItem: typeof mockFoodItems[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.food_item_id === foodItem.id);
      if (existing) {
        return prev.map((item) =>
          item.food_item_id === foodItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          food_item_id: foodItem.id,
          name: foodItem.name,
          quantity: 1,
          unit_price: foodItem.default_price,
        },
      ];
    });
    toast.success(`Added ${foodItem.name}`);
  };

  const updateQuantity = (foodItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.food_item_id === foodItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (foodItemId: string) => {
    setCart((prev) => prev.filter((item) => item.food_item_id !== foodItemId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const submitOrder = () => {
    if (cart.length === 0) {
      toast.error("Please add items to order");
      return;
    }
    // TODO: Save to database
    toast.success(`Order saved for ${employee.name}`, {
      description: `${cart.length} items - ${formatCurrency(getCartTotal())}`,
    });
    setCart([]);
  };

  const totalTransactions = mockTransactions.reduce(
    (sum, t) => sum + t.total_amount,
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/employees")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-14 w-14">
            <AvatarImage src={employee.image_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl font-bold">{employee.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {employee.company_name}
              </span>
              <span>•</span>
              <span>{employee.employee_code}</span>
            </div>
          </div>
        </div>
        <Badge
          variant={employee.status === "active" ? "default" : "secondary"}
          className={cn(
            employee.status === "active"
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          )}
        >
          {employee.status}
        </Badge>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IndianRupee className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Meal Price</p>
                <p className="font-semibold">{formatCurrency(employee.default_meal_price)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/50">
                <Phone className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-semibold text-sm">{employee.phone || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/50">
                <ShoppingBag className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="font-semibold">{formatCurrency(totalTransactions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="font-semibold">{mockTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Menu & History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="menu" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Food Menu
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Food Menu Tab */}
        <TabsContent value="menu" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Food Items Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Food Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mockFoodItems.map((item) => {
                      const cartItem = cart.find((c) => c.food_item_id === item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className={cn(
                            "relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                            cartItem
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {cartItem && (
                            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                              {cartItem.quantity}
                            </div>
                          )}
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.category}
                          </p>
                          <p className="text-primary font-bold mt-2">
                            {formatCurrency(item.default_price)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Today's Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Click on food items to add
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.food_item_id}
                            className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.unit_price)} each
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.food_item_id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center font-medium text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.food_item_id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => removeFromCart(item.food_item_id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium">Total</span>
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(getCartTotal())}
                          </span>
                        </div>
                        <Button className="w-full gap-2" size="lg" onClick={submitOrder}>
                          <Check className="h-4 w-4" />
                          Save Order
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Food Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(transaction.date)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.food_item_name}
                      </TableCell>
                      <TableCell className="text-center">
                        {transaction.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(transaction.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 pt-4 border-t flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(totalTransactions)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
