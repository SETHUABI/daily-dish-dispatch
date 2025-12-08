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
  Eye,
  CheckCircle,
  XCircle,
  Building2,
  IndianRupee,
  Utensils,
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

// Mock data
const mockCompanies = [
  { id: "1", name: "Tech Solutions Pvt Ltd" },
  { id: "2", name: "Global Industries" },
  { id: "3", name: "Sunrise Corporation" },
  { id: "4", name: "Metro Services" },
];

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
  {
    id: "4",
    name: "Sneha Reddy",
    employee_code: "EMP004",
    company_id: "2",
    company_name: "Global Industries",
    phone: "+91 98765 43213",
    default_meal_price: 180,
    status: "inactive" as const,
    image_url: null,
  },
  {
    id: "5",
    name: "Vikram Singh",
    employee_code: "EMP005",
    company_id: "3",
    company_name: "Sunrise Corporation",
    phone: "+91 98765 43214",
    default_meal_price: 160,
    status: "active" as const,
    image_url: null,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function Employees() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEmployeeClick = (employeeId: string) => {
    navigate(`/employees/${employeeId}`);
  };

  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany =
      selectedCompany === "all" || employee.company_id === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Employees
          </h1>
          <p className="text-muted-foreground">
            Manage employees and their meal pricing
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the employee details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" placeholder="Full name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  ID/Code
                </Label>
                <Input id="code" placeholder="Employee ID" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input id="phone" placeholder="+91 XXXXX XXXXX" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Meal Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="150"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Save Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-[250px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {mockCompanies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px]">Employee</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Meal Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow 
                key={employee.id} 
                className="group cursor-pointer hover:bg-muted/50"
                onClick={() => handleEmployeeClick(employee.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.image_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee.employee_code}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.company_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {employee.phone}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-primary">
                    {formatCurrency(employee.default_meal_price)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={employee.status === "active" ? "default" : "secondary"}
                    className={cn(
                      employee.status === "active"
                        ? "bg-success/10 text-success hover:bg-success/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {employee.status === "active" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem onClick={() => handleEmployeeClick(employee.id)}>
                        <Utensils className="h-4 w-4 mr-2" />
                        Add Food
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEmployeeClick(employee.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
