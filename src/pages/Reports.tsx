import { useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  Building2,
  CalendarIcon,
  FileText,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Mock data
const mockCompanies = [
  { id: "1", name: "Tech Solutions Pvt Ltd" },
  { id: "2", name: "Global Industries" },
  { id: "3", name: "Sunrise Corporation" },
];

const mockStatement = {
  company: { id: "1", name: "Tech Solutions Pvt Ltd" },
  opening_balance: 15000,
  period_charges: 45680,
  payments_received: 30000,
  closing_balance: 30680,
  daily_totals: [
    { date: "2024-01-01", meals: 42, amount: 6300 },
    { date: "2024-01-02", meals: 38, amount: 5700 },
    { date: "2024-01-03", meals: 45, amount: 6750 },
    { date: "2024-01-04", meals: 40, amount: 6000 },
    { date: "2024-01-05", meals: 44, amount: 6600 },
  ],
  employee_breakdown: [
    { name: "Rahul Sharma", meals: 22, amount: 3300 },
    { name: "Priya Patel", meals: 20, amount: 3000 },
    { name: "Amit Kumar", meals: 18, amount: 2700 },
    { name: "Others", meals: 145, amount: 21750 },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Reports() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date>(startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date>(endOfMonth(new Date()));

  const handleQuickSelect = (period: string) => {
    const now = new Date();
    switch (period) {
      case "this-month":
        setFromDate(startOfMonth(now));
        setToDate(endOfMonth(now));
        break;
      case "last-month":
        setFromDate(startOfMonth(subMonths(now, 1)));
        setToDate(endOfMonth(subMonths(now, 1)));
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Reports
          </h1>
          <p className="text-muted-foreground">
            Generate company statements and billing reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="stat-card">
        <div className="grid gap-4 md:grid-cols-5">
          {/* Company */}
          <div className="space-y-2 md:col-span-2">
            <Label>Company</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
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

          {/* From Date */}
          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(fromDate, "PP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={(d) => d && setFromDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(toDate, "PP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={(d) => d && setToDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Select */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <Select onValueChange={handleQuickSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Statement Summary */}
      {selectedCompany && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="stat-card">
              <p className="text-sm font-medium text-muted-foreground">Opening Balance</p>
              <p className="text-2xl font-display font-bold mt-1">
                {formatCurrency(mockStatement.opening_balance)}
              </p>
            </div>
            <div className="stat-card">
              <p className="text-sm font-medium text-muted-foreground">Period Charges</p>
              <p className="text-2xl font-display font-bold mt-1 flex items-center gap-2">
                {formatCurrency(mockStatement.period_charges)}
                <TrendingUp className="h-5 w-5 text-destructive" />
              </p>
            </div>
            <div className="stat-card">
              <p className="text-sm font-medium text-muted-foreground">Payments Received</p>
              <p className="text-2xl font-display font-bold mt-1 flex items-center gap-2 text-success">
                {formatCurrency(mockStatement.payments_received)}
                <TrendingDown className="h-5 w-5" />
              </p>
            </div>
            <div className="stat-card bg-primary/5 border-primary/20">
              <p className="text-sm font-medium text-muted-foreground">Closing Balance</p>
              <p className="text-2xl font-display font-bold mt-1 text-primary">
                {formatCurrency(mockStatement.closing_balance)}
              </p>
            </div>
          </div>

          {/* Detailed Reports */}
          <Tabs defaultValue="daily" className="space-y-4">
            <TabsList>
              <TabsTrigger value="daily">Daily Summary</TabsTrigger>
              <TabsTrigger value="employee">Employee Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="daily">
              <div className="rounded-xl border bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Meals Served</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStatement.daily_totals.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium">
                          {format(new Date(day.date), "EEE, MMM d")}
                        </TableCell>
                        <TableCell className="text-center">{day.meals}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(day.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="employee">
              <div className="rounded-xl border bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-center">Total Meals</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStatement.employee_breakdown.map((emp) => (
                      <TableRow key={emp.name}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell className="text-center">{emp.meals}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(emp.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Empty State */}
      {!selectedCompany && (
        <div className="stat-card text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-display font-semibold text-lg">Select a Company</h3>
          <p className="text-muted-foreground mt-1">
            Choose a company to view their billing statement
          </p>
        </div>
      )}
    </div>
  );
}
