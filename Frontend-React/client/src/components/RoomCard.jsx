import { cn } from '@/lib/utils';

function RoomCard({ room, onClick }) {
  const statusColors = {
    'available': 'bg-green-500',
    'occupied': 'bg-blue-500',
    'reserved': 'bg-amber-500',
    'maintenance': 'bg-red-500'
  };
  
  return (
    <div 
      className="p-3 border border-[hsl(var(--neutral-200))] rounded-md text-center relative hover:bg-[hsl(var(--neutral-50))] cursor-pointer transition-all"
      onClick={() => onClick(room)}
    >
      <span 
        className={cn(
          "absolute top-1 right-1 h-2 w-2 rounded-full", 
          statusColors[room.status]
        )} 
        title={room.status.charAt(0).toUpperCase() + room.status.slice(1)}
      />
      <p className="font-bold text-[hsl(var(--neutral-800))]">{room.number}</p>
      <p className="text-xs text-[hsl(var(--neutral-500))]">{room.type}</p>
    </div>
  );
}

export default RoomCard;
