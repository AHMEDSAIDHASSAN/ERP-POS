import { Banknote, CreditCard, Receipt, TrendingUp } from "lucide-react";

export default function QuickStats({ session }) {
  if (!session) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-gray-400 text-center py-4">
          Open a session to see statistics
        </div>
      </div>
    );
  }

  const summary = session.summary || {};

  const stats = [
    {
      label: "Transactions",
      value: summary.transactionCount || 0,
      icon: Receipt,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Cash Total",
      value: `${(summary.cashSales || 0).toFixed(2)} EG`,
      icon: Banknote,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "Card Total",
      value: `${(summary.visaSales || 0).toFixed(2)} EG`,
      icon: CreditCard,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Total Sales",
      value: `${(summary.totalSales || 0).toFixed(2)} EG`,
      icon: TrendingUp,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bgColor} rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-gray-400 text-xs">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
