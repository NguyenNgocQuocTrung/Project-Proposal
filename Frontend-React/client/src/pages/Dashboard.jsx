import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { mockRooms, mockBookings, mockInvoices } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'wouter';
import { 
  Building2, 
  CalendarClock,
  CheckCircle2, 
  DollarSign, 
  User,
  Wrench
} from 'lucide-react';

// Metric Card component
function MetricCard({ title, value, change, icon: Icon, iconColor, detailsLink }) {
  const isPositiveChange = change && change.startsWith('+');
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className={`p-2 rounded-md ${iconColor} flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={`text-xs mt-1 ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {change} from last month
          </div>
        )}
      </CardContent>
      {detailsLink && (
        <CardFooter className="pt-1 pb-4">
          <Link href={detailsLink} className="text-sm text-blue-500 hover:underline">
            View details
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

// Room Status Bar component
function RoomStatusBar({ title, available, total, color = "bg-blue-500" }) {
  const percentage = (available / total) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm">{available} of {total}</div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Room Availability Card component
function RoomAvailabilityCard({ rooms }) {
  const total = rooms.length;
  const available = rooms.filter(room => room.status === 'available').length;
  const occupied = rooms.filter(room => room.status === 'occupied').length;
  const reserved = rooms.filter(room => room.status === 'reserved').length;
  const maintenance = rooms.filter(room => room.status === 'maintenance').length;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Room Availability</CardTitle>
        <CardDescription>Current room status across all categories</CardDescription>
      </CardHeader>
      <CardContent>
        <RoomStatusBar 
          title="Available" 
          available={available} 
          total={total} 
          color="bg-blue-500" 
        />
        <RoomStatusBar 
          title="Occupied" 
          available={occupied} 
          total={total} 
          color="bg-red-500" 
        />
        <RoomStatusBar 
          title="Reserved" 
          available={reserved} 
          total={total}
          color="bg-blue-400" 
        />
        <RoomStatusBar 
          title="Maintenance" 
          available={maintenance} 
          total={total}
          color="bg-amber-500"  
        />
      </CardContent>
      <CardFooter>
        <Link href="/rooms" className="text-sm text-blue-500 hover:underline">
          View all rooms
        </Link>
      </CardFooter>
    </Card>
  );
}

// Main Dashboard component
function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calculate metrics
  const occupancyRate = rooms.length > 0 
    ? Math.round((rooms.filter(room => room.status === 'occupied').length / rooms.length) * 100) 
    : 0;
  
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  
  const checkIns = bookings.filter(b => 
    new Date(b.checkInDate) > new Date() && 
    new Date(b.checkInDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;
  
  const pendingCheckouts = bookings.filter(b => 
    !b.isCheckedOut && 
    new Date(b.checkOutDate) < new Date(Date.now() + 24 * 60 * 60 * 1000)
  ).length;
  
  const totalGuests = bookings.filter(b => 
    !b.isCheckedOut && !b.isCancelled &&
    new Date(b.checkInDate) <= new Date() &&
    new Date(b.checkOutDate) >= new Date()
  ).reduce((sum, b) => sum + b.guestCount, 0);
  
  const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;
  
  // Load data from localStorage or mock data
  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      
      // Simulate API calls with setTimeout
      setTimeout(() => {
        // Get rooms data
        const storedRooms = localStorage.getItem('hotelRooms');
        const loadedRooms = storedRooms ? JSON.parse(storedRooms) : mockRooms;
        
        // Get bookings data
        const storedBookings = localStorage.getItem('hotelBookings');
        const loadedBookings = storedBookings ? JSON.parse(storedBookings) : mockBookings;
        
        // Get invoices data
        const storedInvoices = localStorage.getItem('hotelInvoices');
        const loadedInvoices = storedInvoices ? JSON.parse(storedInvoices) : mockInvoices;
        
        setRooms(loadedRooms);
        setBookings(loadedBookings);
        setInvoices(loadedInvoices);
        setLoading(false);
      }, 500);
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin h-10 w-10 border-4 rounded-full border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hotel performance and key metrics overview
        </p>
      </div>
      
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          change="+8% from last month"
          icon={Building2}
          iconColor="bg-blue-100"
          detailsLink="/rooms"
        />
        
        <MetricCard 
          title="Revenue"
          value={`$${Math.round(totalRevenue).toLocaleString()}`}
          change="+12% from last month"
          icon={DollarSign}
          iconColor="bg-blue-100"
          detailsLink="/invoices"
        />
        
        <MetricCard 
          title="Upcoming Check-ins"
          value={checkIns}
          icon={CalendarClock}
          iconColor="bg-blue-100"
          detailsLink="/bookings"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Pending Checkouts"
          value={pendingCheckouts}
          icon={CheckCircle2}
          iconColor="bg-blue-100"
          detailsLink="/bookings"
        />
        
        <MetricCard 
          title="Total Guests"
          value={totalGuests}
          icon={User}
          iconColor="bg-blue-100"
          detailsLink="/bookings"
        />
        
        <MetricCard 
          title="Rooms in Maintenance"
          value={maintenanceRooms}
          icon={Wrench}
          iconColor="bg-blue-100"
          detailsLink="/rooms"
        />
      </div>
      
      {/* Room availability */}
      <div className="mt-8">
        <RoomAvailabilityCard rooms={rooms} />
      </div>
    </div>
  );
}

export default Dashboard;