import { format } from "date-fns";
import { UtensilsCrossed, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  date: string;
  company_name: string;
  employee_name: string;
  food_item: string;
  amount: number;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">
          Recent Transactions
        </h3>
        <Link to="/daily-entry">
          <Button variant="ghost" size="sm" className="gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <UtensilsCrossed className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No transactions today
            </p>
            <Link to="/daily-entry">
              <Button variant="link" size="sm" className="mt-2">
                Add your first entry
              </Button>
            </Link>
          </div>
        ) : (
          transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.employee_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.company_name} • {transaction.food_item}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(transaction.date), "h:mm a")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
