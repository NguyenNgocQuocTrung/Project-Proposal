import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, calculateNights, getRoomTypeLabel } from '@/lib/utils';
import { ArrowLeft, Bed, Calendar, Clock, CreditCard, User, Users } from 'lucide-react';
import { api } from '@/services/api';

export default function BookingDetail() {
  const [matched, params] = useRoute('/bookings/:id');
  const [location, setLocation] = useLocation();
  const bookingCode = params?.id;
  
  const [booking, setBooking] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calculate totals
  const [totals, setTotals] = useState({
    roomsTotal: 0,
    servicesTotal: 0,
    grandTotal: 0
  });
  
  // Fetch booking details from API
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await api.bookings.getById(bookingCode);
        console.log('Response:', response);
        const data = response.data;
        console.log('API Data:', data);

        // Map rooms from listResult with null check
        const roomsData = data?.listResult?.map(item => ({
          id: item?.room?.id,
          number: item?.room?.roomNo,
          type: item?.room?.type,
          price: item?.room?.price,
          capacity: item?.room?.maxNum,
          status: item?.room?.status,
          isForeignGuest: item?.foreign || false,
          unit: item?.unit || 1,
          extraFee: item?.extraFee || 0
        })) || [];

        setRooms(roomsData);

        // Map booking details with null check
        if (data?.booking) {
          setBooking({
            id: data.booking.id,
            bookingCode: data.booking.bookingCode,
            guestName: data.booking.fullName,
            checkInDate: data.booking.checkIn,
            checkOutDate: data.booking.checkOut,
            adults: data.booking.guestNum,
            children: 0,
            isCheckedOut: data.booking.paid,
            isCancelled: false,
            isForeignGuest: roomsData.some(room => room.isForeignGuest)
          });
          console.log('Booking:', booking);
          console.log('Rooms:', roomsData);
        } else {
          // If no booking data, set a default state
          setBooking(null);
        }

        setServices([]); // If there are services, they would need to be mapped similarly
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch booking details. Please try again.",
          variant: "destructive",
        });
        // Reset states on error
        setRooms([]);
        setBooking(null);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    if (bookingCode) {
      fetchBookingDetails();
    }
  }, [bookingCode]);
  
  // Calculate totals whenever booking, rooms, or services change
  useEffect(() => {
    if (booking && rooms.length > 0) {
      // Calculate number of nights
      const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
      
      // Calculate room total
      let roomsTotal = 0;
      rooms.forEach(room => {
        const basePrice = room.price * nights;
        // Apply foreign guest multiplier if applicable
        const priceWithMultiplier = booking.isForeignGuest ? basePrice * 1.5 : basePrice;
        roomsTotal += priceWithMultiplier;
      });
      
      // Calculate services total
      const servicesTotal = services.reduce((total, service) => total + service.price, 0);
      
      // Calculate grand total
      const grandTotal = roomsTotal + servicesTotal;
      
      setTotals({
        roomsTotal,
        servicesTotal,
        grandTotal
      });
    }
  }, [booking, rooms, services]);
  
  const getStatusBadge = () => {
    if (!booking) return null;
    
    if (booking.isCheckedOut) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Checked Out</Badge>;
    } else if (booking.isCancelled) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
    } else {
      const today = new Date();
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);
      
      if (today < checkInDate) {
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Upcoming</Badge>;
      } else if (today >= checkInDate && today <= checkOutDate) {
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      } else {
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Past</Badge>;
      }
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    setLocation('/bookings');
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (window.confirm('Are you sure you want to check out this booking?')) {
      try {
        await api.bookings.checkout(bookingCode);
        toast({
          title: 'Checkout Complete',
          description: 'The guest has been checked out successfully.',
        });
        setLocation('/invoices');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to checkout booking',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.bookings.cancel(bookingCode);
        toast({
          title: 'Booking Cancelled',
          description: 'The booking has been successfully cancelled.',
        });
        // Refresh booking details
        const response = await api.bookings.getById(bookingCode);
        setBooking(response.data.booking);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to cancel booking',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.bookings.delete(bookingCode);
        toast({
          title: 'Booking Deleted',
          description: 'The booking has been permanently deleted.',
        });
        setLocation('/bookings');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete booking',
          variant: 'destructive',
        });
      }
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // Render not found state
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold">Booking Not Found</h2>
        <p className="text-gray-500">The booking you're looking for doesn't exist or has been removed.</p>
        <Button onClick={handleBack}>Return to Bookings</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleBack}
          className="rounded-full h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
          <p className="text-gray-500 text-sm">
            Booking #{booking.id} • {getStatusBadge()}
          </p>
        </div>
      </div>
      
      {/* Booking Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Booking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <User className="h-4 w-4" /> Guest Name
              </p>
              <p className="font-medium">{booking.guestName}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Check-in Date
              </p>
              <p className="font-medium">{formatDate(booking.checkInDate)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Check-out Date
              </p>
              <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Stay Duration
              </p>
              <p className="font-medium">{calculateNights(booking.checkInDate, booking.checkOutDate)} nights</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4" /> Guests
              </p>
              <p className="font-medium">{booking.adults} adults, {booking.children || 0} children</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment Status
              </p>
              <p className="font-medium">
                {booking.isCheckedOut ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="foreignGuest"
                checked={booking.isForeignGuest || false}
                disabled 
              />
              <label
                htmlFor="foreignGuest"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Foreign Guest (+50% rate)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="extraService"
                checked={services.length > 0}
                disabled
              />
              <label
                htmlFor="extraService"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Extra Services
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Booked Rooms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Booked Rooms</CardTitle>
          <CardDescription>
            {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} booked for this reservation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <Card key={room.id} className="border-2 border-gray-100">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Room {room.number}</CardTitle>
                      <CardDescription>{getRoomTypeLabel(room.type)}</CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      {formatCurrency(room.price)}/night
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Floor:</span>
                      <span>{room.floor || Math.floor(parseInt(room.number) / 100)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Max Capacity:</span>
                      <span>{room.capacity} guests</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant="outline" className="bg-transparent">
                        {booking.isCheckedOut ? 'Checked Out' : 'Reserved'}
                      </Badge>
                    </div>
                    {booking.isForeignGuest && (
                      <div className="flex justify-between text-sm pt-1">
                        <span className="text-amber-600 font-medium">Foreign Guest Rate:</span>
                        <span className="text-amber-600 font-medium">+50%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Services */}
      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Booked Services</CardTitle>
            <CardDescription>
              Additional services requested for this booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map(service => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {service.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{service.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(service.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Room Charges ({calculateNights(booking.checkInDate, booking.checkOutDate)} nights):</span>
                <span>{formatCurrency(totals.roomsTotal)}</span>
              </div>
              
              {booking.isForeignGuest && (
                <div className="flex justify-between text-sm pl-4">
                  <span className="text-gray-500 italic">Includes Foreign Guest Rate (+50%)</span>
                </div>
              )}
              
              {services.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Additional Services:</span>
                  <span>{formatCurrency(totals.servicesTotal)}</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span>{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
          >
            Back to Bookings
          </Button>
          
          {!booking.isCheckedOut && !booking.isCancelled && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleCancel}
                className="text-red-500"
              >
                Cancel Booking
              </Button>
              <Button 
                variant="default"
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}