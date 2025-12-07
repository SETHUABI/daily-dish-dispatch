import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OutstandingItem {
  id: string;
  name: string;
  outstanding: number;
}

interface OutstandingListProps {
  items: OutstandingItem[];
}

export function OutstandingList({ items }: OutstandingListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="stat-card">
      <h3 className="font-display font-semibold text-lg mb-4">
        Top Outstanding Balances
      </h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No outstanding balances
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors",
                "hover:bg-muted/50 cursor-pointer",
                index === 0 && "bg-destructive/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold",
                    index === 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Company</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold",
                    index === 0 ? "text-destructive" : "text-foreground"
                  )}
                >
                  {formatCurrency(item.outstanding)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
