import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Users,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  History,
  Printer,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCompany } from "@/hooks/useCompanies";
import { useEmployeesWithStats } from "@/hooks/useEmployees";
import { useTransactions } from "@/hooks/useTransactions";
import { useCompanyPayments, useCreateCompanyPayment } from "@/hooks/usePayments";

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

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "cash",
    reference: "",
    notes: "",
  });

  const { data: company, isLoading: companyLoading } = useCompany(id);
  const { data: employees, isLoading: employeesLoading } = useEmployeesWithStats(id);
  const { data: transactions } = useTransactions(undefined, id);
  const { data: payments } = useCompanyPayments(id);
  const createPayment = useCreateCompanyPayment();

  const isLoading = companyLoading || employeesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Company not found</p>
        <Button variant="outline" onClick={() => navigate("/companies")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
      </div>
    );
  }

  // Calculate totals
  const totalPurchases = transactions?.reduce((sum, t) => sum + Number(t.total_amount), 0) || 0;
  const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const outstanding = totalPurchases - totalPayments;

  const handlePaymentSubmit = async () => {
    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await createPayment.mutateAsync({
      company_id: company.id,
      payment_date: new Date().toISOString().split("T")[0],
      amount,
      method: paymentForm.method,
      reference: paymentForm.reference || null,
      notes: paymentForm.notes || null,
    });

    setPaymentForm({ amount: "", method: "cash", reference: "", notes: "" });
    setIsPaymentDialogOpen(false);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${company.name} - Statement</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            h2 { font-size: 18px; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .summary { display: flex; gap: 20px; margin: 20px 0; }
            .summary-item { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            .text-right { text-align: right; }
            .outstanding { color: #dc2626; font-weight: bold; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${company.name}</h1>
          <p>${company.address || ""}</p>
          <p>Phone: ${company.phone || "N/A"} | Email: ${company.email || "N/A"}</p>
          
          <div class="summary">
            <div class="summary-item">
              <strong>Total Purchases:</strong> ${formatCurrency(totalPurchases)}
            </div>
            <div class="summary-item">
              <strong>Total Payments:</strong> ${formatCurrency(totalPayments)}
            </div>
            <div class="summary-item outstanding">
              <strong>Outstanding:</strong> ${formatCurrency(outstanding)}
            </div>
          </div>

          <h2>Employee Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th class="text-right">Purchases</th>
                <th class="text-right">Payments</th>
                <th class="text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              ${employees?.map(emp => `
                <tr>
                  <td>${emp.name}</td>
                  <td class="text-right">${formatCurrency(emp.total_purchases)}</td>
                  <td class="text-right">${formatCurrency(emp.total_payments)}</td>
                  <td class="text-right ${emp.outstanding > 0 ? 'outstanding' : ''}">${formatCurrency(emp.outstanding)}</td>
                </tr>
              `).join("") || ""}
            </tbody>
          </table>

          <h2>Recent Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Item</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactions?.slice(0, 50).map(t => `
                <tr>
                  <td>${formatDate(t.date)}</td>
                  <td>${t.employee_name}</td>
                  <td>${t.food_item_name}</td>
                  <td class="text-right">${formatCurrency(Number(t.total_amount))}</td>
                </tr>
              `).join("") || ""}
            </tbody>
          </table>

          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Generated on ${new Date().toLocaleString("en-IN")}
          </p>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" ref={printRef}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/companies")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{company.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {company.code && <span>{company.code}</span>}
              {company.contact_person && (
                <>
                  <span>•</span>
                  <span>{company.contact_person}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => setIsPaymentDialogOpen(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Employees</p>
                <p className="font-semibold text-lg">{employees?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/50">
                <IndianRupee className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Purchases</p>
                <p className="font-semibold">{formatCurrency(totalPurchases)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CreditCard className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="font-semibold text-success">{formatCurrency(totalPayments)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <IndianRupee className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className={cn("font-semibold", outstanding > 0 ? "text-destructive" : "text-success")}>
                  {formatCurrency(outstanding)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Info */}
      {(company.phone || company.email || company.address) && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-6">
              {company.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{company.phone}</span>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{company.email}</span>
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{company.address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <History className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Employee Purchases & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Purchases</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No employees found for this company
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees?.map((emp) => (
                      <TableRow 
                        key={emp.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/employees/${emp.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={emp.image_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(emp.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.employee_code || "-"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(emp.total_purchases)}
                        </TableCell>
                        <TableCell className="text-right text-success">
                          {formatCurrency(emp.total_payments)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-semibold",
                            emp.outstanding > 0 ? "text-destructive" : "text-success"
                          )}>
                            {formatCurrency(emp.outstanding)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employees/${emp.id}`);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions?.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{formatDate(t.date)}</TableCell>
                        <TableCell className="font-medium">{t.employee_name}</TableCell>
                        <TableCell>{t.food_item_name}</TableCell>
                        <TableCell className="text-center">{t.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(t.total_amount))}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Payment History</CardTitle>
              <Button size="sm" onClick={() => setIsPaymentDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Payment
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No payments recorded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments?.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{formatDate(p.payment_date)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {p.method || "cash"}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.reference || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{p.notes || "-"}</TableCell>
                        <TableCell className="text-right font-semibold text-success">
                          {formatCurrency(Number(p.amount))}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment from {company.name}. Outstanding: {formatCurrency(outstanding)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                className="col-span-3"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">
                Method
              </Label>
              <Select
                value={paymentForm.method}
                onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Reference
              </Label>
              <Input
                id="reference"
                placeholder="Transaction ID"
                className="col-span-3"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                placeholder="Optional notes"
                className="col-span-3"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentSubmit}
              disabled={createPayment.isPending || !paymentForm.amount}
            >
              {createPayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
