import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

function StatCard({ title, value, icon, change, changeText }) {
  const isPositive = parseFloat(change) >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-[hsl(var(--neutral-200))]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[hsl(var(--neutral-500))]">{title}</p>
          <p className="text-2xl font-bold text-[hsl(var(--neutral-800))] mt-1">{value}</p>
        </div>
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center",
          {
            'bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]': title === 'Occupancy Rate',
            'bg-[hsl(var(--secondary-light))] text-[hsl(var(--secondary))]': title === 'Revenue',
            'bg-[hsl(var(--accent-light))] text-[hsl(var(--accent))]': title === 'Reservations',
            'bg-green-100 text-green-600': title === 'New Feedback'
          }
        )}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={cn(
          "flex items-center", 
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
          {change}
        </span>
        <span className="text-[hsl(var(--neutral-500))] ml-2">{changeText}</span>
      </div>
    </div>
  );
}

export default StatCard;
