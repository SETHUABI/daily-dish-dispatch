import { useState } from "react";
import { format } from "date-fns";
import {
  Building2,
  CalendarIcon,
  CreditCard,
  Plus,
  IndianRupee,
  Banknote,
  Smartphone,
  Building,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Mock data
const mockCompanies = [
  { id: "1", name: "Tech Solutions Pvt Ltd", outstanding: 45680 },
  { id: "2", name: "Global Industries", outstanding: 32450 },
  { id: "3", name: "Sunrise Corporation", outstanding: 28900 },
];

const mockPayments = [
  {
    id: "1",
    company_id: "1",
    company_name: "Tech Solutions Pvt Ltd",
    payment_date: "2024-01-15",
    amount: 30000,
    method: "bank_transfer",
    reference: "TRN123456789",
    notes: "January partial payment",
  },
  {
    id: "2",
    company_id: "2",
    company_name: "Global Industries",
    payment_date: "2024-01-10",
    amount: 25000,
    method: "upi",
    reference: "UPI987654321",
    notes: "",
  },
  {
    id: "3",
    company_id: "1",
    company_name: "Tech Solutions Pvt Ltd",
    payment_date: "2024-01-05",
    amount: 15000,
    method: "cash",
    reference: "",
    notes: "Cash payment",
  },
];

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building },
  { value: "cheque", label: "Cheque", icon: Receipt },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getMethodIcon = (method: string) => {
  const methodData = paymentMethods.find((m) => m.value === method);
  return methodData?.icon || CreditCard;
};

const getMethodLabel = (method: string) => {
  const methodData = paymentMethods.find((m) => m.value === method);
  return methodData?.label || method;
};

export default function Payments() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const selectedCompanyData = mockCompanies.find((c) => c.id === selectedCompany);

  const filteredPayments = selectedCompany
    ? mockPayments.filter((p) => p.company_id === selectedCompany)
    : mockPayments;

  const handleAddPayment = () => {
    if (!selectedCompany || !amount || !method) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Payment recorded",
      description: `${formatCurrency(parseFloat(amount))} payment added for ${selectedCompanyData?.name}`,
    });

    setIsDialogOpen(false);
    setAmount("");
    setMethod("");
    setReference("");
    setNotes("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Payments
          </h1>
          <p className="text-muted-foreground">
            Record and track company payments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!selectedCompany}>
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Record Payment</DialogTitle>
              <DialogDescription>
                Record a new payment from {selectedCompanyData?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="col-span-3 justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(paymentDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={(d) => d && setPaymentDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">
                  Method
                </Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        <div className="flex items-center gap-2">
                          <m.icon className="h-4 w-4" />
                          {m.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">
                  Reference
                </Label>
                <Input
                  id="reference"
                  placeholder="Transaction ID (optional)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPayment}>Save Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Company Selection */}
      <div className="stat-card">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label>Select Company</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Choose a company to view payments" />
              </SelectTrigger>
              <SelectContent>
                {mockCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{company.name}</span>
                      <Badge variant="outline" className="text-destructive border-destructive/30">
                        {formatCurrency(company.outstanding)} due
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompanyData && (
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
              <p className="text-2xl font-display font-bold text-destructive mt-1">
                {formatCurrency(selectedCompanyData.outstanding)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {selectedCompany
                    ? "No payments recorded for this company yet."
                    : "Select a company to view payments."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => {
                const MethodIcon = getMethodIcon(payment.method);
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {format(new Date(payment.payment_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{payment.company_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MethodIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{getMethodLabel(payment.method)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.reference || "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-success">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
