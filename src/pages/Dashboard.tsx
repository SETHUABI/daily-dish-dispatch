import { Building2, Users, UtensilsCrossed, IndianRupee, TrendingUp, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { OutstandingList } from "@/components/dashboard/OutstandingList";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { format } from "date-fns";

// Mock data - will be replaced with real data from Supabase
const mockStats = {
  totalCompanies: 12,
  activeCompanies: 10,
  totalEmployees: 245,
  todayMeals: 187,
  todayAmount: 28050,
  monthAmount: 425680,
};

const mockOutstanding = [
  { id: "1", name: "Tech Solutions Pvt Ltd", outstanding: 45680 },
  { id: "2", name: "Global Industries", outstanding: 32450 },
  { id: "3", name: "Sunrise Corp", outstanding: 28900 },
  { id: "4", name: "Metro Services", outstanding: 18750 },
  { id: "5", name: "Alpha Trading Co", outstanding: 12340 },
];

const mockTransactions = [
  {
    id: "1",
    date: new Date().toISOString(),
    company_name: "Tech Solutions",
    employee_name: "Rahul Sharma",
    food_item: "Lunch Thali",
    amount: 150,
  },
  {
    id: "2",
    date: new Date().toISOString(),
    company_name: "Global Industries",
    employee_name: "Priya Patel",
    food_item: "Special Meals",
    amount: 200,
  },
  {
    id: "3",
    date: new Date().toISOString(),
    company_name: "Tech Solutions",
    employee_name: "Amit Kumar",
    food_item: "Lunch Thali",
    amount: 150,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today, {format(new Date(), "EEEE, MMMM d")}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Companies"
          value={mockStats.totalCompanies}
          subtitle={`${mockStats.activeCompanies} active`}
          icon={Building2}
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total Employees"
          value={mockStats.totalEmployees}
          icon={Users}
          iconClassName="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Today's Meals"
          value={mockStats.todayMeals}
          subtitle={formatCurrency(mockStats.todayAmount)}
          icon={UtensilsCrossed}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(mockStats.monthAmount)}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
          iconClassName="bg-violet-100 text-violet-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecentTransactions transactions={mockTransactions} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <OutstandingList items={mockOutstanding} />
        </div>
      </div>
    </div>
  );
}
