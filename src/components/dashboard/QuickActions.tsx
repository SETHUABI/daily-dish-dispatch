import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarPlus, FileBarChart, CreditCard, Building2 } from "lucide-react";

const actions = [
  {
    title: "Add Daily Entry",
    description: "Record today's meals",
    icon: CalendarPlus,
    href: "/daily-entry",
    variant: "default" as const,
  },
  {
    title: "Company Statement",
    description: "View billing reports",
    icon: FileBarChart,
    href: "/reports",
    variant: "outline" as const,
  },
  {
    title: "Record Payment",
    description: "Add new payment",
    icon: CreditCard,
    href: "/payments",
    variant: "outline" as const,
  },
  {
    title: "Add Company",
    description: "Register new client",
    icon: Building2,
    href: "/companies",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <div className="stat-card">
      <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link key={action.title} to={action.href}>
            <Button
              variant={action.variant}
              className="w-full h-auto flex-col items-start gap-1 p-4 text-left"
            >
              <action.icon className="h-5 w-5 mb-1" />
              <span className="font-medium">{action.title}</span>
              <span className="text-xs opacity-70 font-normal">
                {action.description}
              </span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
