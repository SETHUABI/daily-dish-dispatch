import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  IndianRupee,
  Utensils,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useCompanies";
import { useEmployeesWithStats, useCreateEmployee } from "@/hooks/useEmployees";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

export default function Employees() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    employee_code: "",
    phone: "",
    default_meal_price: "150",
  });

  const { data: companies } = useCompanies();
  const { data: employees, isLoading } = useEmployeesWithStats(selectedCompany === "all" ? undefined : selectedCompany);
  const createEmployee = useCreateEmployee();

  const filteredEmployees = employees?.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.employee_code?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.company_id) return;
    
    await createEmployee.mutateAsync({
      company_id: formData.company_id,
      name: formData.name,
      employee_code: formData.employee_code || null,
      phone: formData.phone || null,
      image_url: null,
      default_meal_price: parseFloat(formData.default_meal_price) || 150,
      status: "active",
      notes: null,
    });

    setFormData({ company_id: "", name: "", employee_code: "", phone: "", default_meal_price: "150" });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage employees and their meal pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Employee</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Employee</DialogTitle>
              <DialogDescription>Enter the employee details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Company *</Label>
                <Select value={formData.company_id} onValueChange={(v) => setFormData(p => ({ ...p, company_id: v }))}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent>
                    {companies?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name *</Label>
                <Input placeholder="Full name" className="col-span-3" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID/Code</Label>
                <Input placeholder="Employee ID" className="col-span-3" value={formData.employee_code} onChange={(e) => setFormData(p => ({ ...p, employee_code: e.target.value }))} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phone</Label>
                <Input placeholder="+91 XXXXX XXXXX" className="col-span-3" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Meal Price</Label>
                <Input type="number" placeholder="150" className="col-span-3" value={formData.default_meal_price} onChange={(e) => setFormData(p => ({ ...p, default_meal_price: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createEmployee.isPending || !formData.name.trim() || !formData.company_id}>
                {createEmployee.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-[250px]"><Building2 className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter by company" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">Employee</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Purchases</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No employees found</TableCell></TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="group cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/employees/${employee.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={employee.image_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials(employee.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.employee_code || "-"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{employee.company_name}</span></div></TableCell>
                    <TableCell className="text-right">{formatCurrency(employee.total_purchases)}</TableCell>
                    <TableCell className="text-right"><span className={cn("font-semibold", employee.outstanding > 0 ? "text-destructive" : "text-success")}>{formatCurrency(employee.outstanding)}</span></TableCell>
                    <TableCell className="text-center">
                      <Badge variant={employee.status === "active" ? "default" : "secondary"} className={cn(employee.status === "active" ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground")}>
                        {employee.status === "active" ? <><CheckCircle className="h-3 w-3 mr-1" />Active</> : <><XCircle className="h-3 w-3 mr-1" />Inactive</>}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}><Utensils className="h-4 w-4 mr-2" />Add Food</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
