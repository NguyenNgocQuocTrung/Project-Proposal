import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { mockBookings, mockRooms, mockServices } from '@/lib/mockData';
import { formatCurrency, formatDate, calculateNights, getRoomTypeLabel, generateId } from '@/lib/utils';

export default function CreateInvoice() {
  const [matched, params] = useRoute('/invoices/create/:bookingId');
  const [location, setLocation] = useLocation();
  const bookingId = parseInt(params.bookingId);
  
  const [booking, setBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // VNPay sandbox details
  const [vnpayDetails, setVnpayDetails] = useState({
    bankCode: 'NCB', // Default bank code
    cardNumber: '9704198526191432198',
    cardName: 'NGUYEN VAN A',
    expiryDate: '07/15',
    securityCode: '123'
  });
  
  useEffect(() => {
    // In a real app, fetch booking details from API
    const loadBookingDetails = () => {
      setLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        // Load bookings from localStorage or fallback to mock data
        const savedBookings = localStorage.getItem('hotelBookings');
        const bookings = savedBookings ? JSON.parse(savedBookings) : mockBookings;
        
        // Find booking by ID
        const foundBooking = bookings.find(b => b.id === bookingId);
        
        if (foundBooking) {
          setBooking(foundBooking);
          
          // Generate invoice data from booking
          generateInvoiceFromBooking(foundBooking);
        } else {
          toast({
            title: 'Error',
            description: 'Booking not found',
            variant: 'destructive',
          });
          // Redirect back to bookings
          setLocation('/bookings');
        }
        
        setLoading(false);
      }, 500);
    };
    
    if (bookingId) {
      loadBookingDetails();
    } else {
      setLocation('/bookings');
    }
  }, [bookingId, setLocation]);
  
  const generateInvoiceFromBooking = (booking) => {
    // Calculate room rate based on room type
    let baseRoomRate = 0;
    switch (booking.roomType) {
      case 'single':
        baseRoomRate = 99.99;
        break;
      case 'double':
        baseRoomRate = 149.99;
        break;
      case 'suite':
        baseRoomRate = 249.99;
        break;
      default:
        baseRoomRate = 99.99;
    }
    
    // Apply 1.5x multiplier for foreign guests
    const roomRate = booking.isForeign ? baseRoomRate * 1.5 : baseRoomRate;
    
    // Calculate nights
    const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
    const roomTotal = roomRate * nights;
    
    // Get booked services
    const bookedServices = booking.services || [];
    const serviceItems = [];
    let servicesTotal = 0;
    
    // In a real app, fetch service details from API
    const savedServices = localStorage.getItem('hotelServices');
    const services = savedServices ? JSON.parse(savedServices) : mockServices;
    
    // Add each service as an item
    bookedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        const amount = service.price;
        serviceItems.push({
          description: service.name,
          quantity: 1,
          rate: service.price,
          amount
        });
        servicesTotal += amount;
      }
    });
    
    // Generate invoice ID
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceId = `INV-${year}${month}-${randomPart}`;
    
    // Create invoice object
    const invoiceData = {
      id: invoiceId,
      guestName: booking.guestName,
      roomNumber: booking.roomNumber,
      roomType: booking.roomType,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'unpaid',
      roomRate,
      roomTotal,
      items: serviceItems,
      total: roomTotal + servicesTotal,
      notes: '',
      bookingId: booking.id
    };
    
    setInvoice(invoiceData);
  };
  
  const handleVnpayDetailsChange = (e) => {
    const { name, value } = e.target;
    setVnpayDetails({
      ...vnpayDetails,
      [name]: value
    });
  };
  
  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
  };
  
  const handleSaveInvoice = () => {
    // Save invoice to localStorage
    const savedInvoices = localStorage.getItem('hotelInvoices');
    const invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
    
    invoices.push(invoice);
    localStorage.setItem('hotelInvoices', JSON.stringify(invoices));
    
    // Handle different payment methods
    if (paymentMethod === 'vnpay') {
      setShowPaymentDialog(true);
    } else {
      // For other payment methods, just show confirmation
      toast({
        title: 'Invoice Created',
        description: `Invoice ${invoice.id} has been created with ${paymentMethod} payment.`,
      });
      
      // Update booking status to checked out
      updateBookingStatus();
      
      // Navigate to invoices page
      setLocation('/invoices');
    }
  };
  
  const handleProcessVnpayPayment = () => {
    // In a real app, this would make an API call to VNPay
    // For demo purposes, simulate a successful payment
    
    // Set a loading state for the payment
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Update invoice status to paid
      const updatedInvoice = { ...invoice, status: 'paid' };
      
      // Update invoice in localStorage
      const savedInvoices = localStorage.getItem('hotelInvoices');
      let invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
      
      // Find and update the invoice
      invoices = invoices.map(inv => 
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      );
      
      localStorage.setItem('hotelInvoices', JSON.stringify(invoices));
      
      // Update booking status
      updateBookingStatus();
      
      setShowPaymentDialog(false);
      setLoading(false);
      
      toast({
        title: 'Payment Successful',
        description: `Payment for invoice ${invoice.id} has been processed successfully.`,
      });
      
      // Navigate to invoices page
      setLocation('/invoices');
    }, 2000);
  };
  
  const updateBookingStatus = () => {
    // Update booking status to checked out
    const savedBookings = localStorage.getItem('hotelBookings');
    let bookings = savedBookings ? JSON.parse(savedBookings) : [];
    
    // Find and update the booking
    bookings = bookings.map(b => 
      b.id === bookingId ? { ...b, isCheckedOut: true } : b
    );
    
    localStorage.setItem('hotelBookings', JSON.stringify(bookings));
  };
  
  const handlePrintInvoice = () => {
    // Open print dialog
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!booking || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-xl font-semibold">Booking not found</h2>
        <Button onClick={() => setLocation('/bookings')}>Return to Bookings</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoice</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Room and service charges for the booking
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline" onClick={handlePrintInvoice}>
            Print Invoice
          </Button>
          <Button onClick={handleSaveInvoice}>
            Save & Process Payment
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Invoice #{invoice.id}</CardTitle>
            <CardDescription>
              Created on {formatDate(invoice.date)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">Bill To</h3>
                  <div className="text-lg font-semibold">{booking.guestName}</div>
                  <div className="text-gray-600">Phone: {booking.phoneNumber}</div>
                  {booking.isForeign && (
                    <div className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded inline-block mt-1">
                      Foreign Guest (1.5x rate)
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">Room Details</h3>
                  <div>Room {booking.roomNumber} ({getRoomTypeLabel(booking.roomType)})</div>
                  <div className="text-gray-600">
                    {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                  </div>
                  <div className="text-gray-600">
                    {calculateNights(booking.checkInDate, booking.checkOutDate)} nights
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Room Charge ({getRoomTypeLabel(booking.roomType)})</TableCell>
                    <TableCell className="text-right">{calculateNights(booking.checkInDate, booking.checkOutDate)} nights</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.roomRate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.roomTotal)}</TableCell>
                  </TableRow>
                  
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                  
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(invoice.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Choose a payment method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vnpay">VNPay</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {paymentMethod === 'vnpay' && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm">
                <h4 className="font-medium text-blue-800 mb-1">VNPay Sandbox Information</h4>
                <p className="text-blue-700 text-xs mb-2">
                  The test payment will be processed in sandbox mode. No actual charges will be made.
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                  <div>Bank Code:</div>
                  <div className="font-medium">NCB</div>
                  <div>Card Number:</div>
                  <div className="font-medium">9704 1985 2619 1432 198</div>
                  <div>Name:</div>
                  <div className="font-medium">NGUYEN VAN A</div>
                  <div>Expiry:</div>
                  <div className="font-medium">07/15</div>
                  <div>OTP:</div>
                  <div className="font-medium">123456</div>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <Label>Due Date</Label>
              <div className="text-sm font-medium mt-1">{formatDate(invoice.dueDate)}</div>
            </div>
            
            <div className="pt-2">
              <Label>Invoice Status</Label>
              <div className="bg-amber-100 text-amber-800 rounded-full text-xs font-medium py-1 px-2 inline-block mt-1">
                Unpaid
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* VNPay Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>VNPay Payment</DialogTitle>
            <DialogDescription>
              Enter your payment details to complete the transaction
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankCode">Bank</Label>
              <Select 
                value={vnpayDetails.bankCode} 
                onValueChange={(value) => handleVnpayDetailsChange({ target: { name: 'bankCode', value } })}
              >
                <SelectTrigger id="bankCode">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NCB">NCB Bank</SelectItem>
                  <SelectItem value="VIETCOMBANK">Vietcombank</SelectItem>
                  <SelectItem value="TECHCOMBANK">Techcombank</SelectItem>
                  <SelectItem value="AGRIBANK">Agribank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                value={vnpayDetails.cardNumber}
                onChange={handleVnpayDetailsChange}
                placeholder="9704 1985 2619 1432 198"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  name="cardName"
                  value={vnpayDetails.cardName}
                  onChange={handleVnpayDetailsChange}
                  placeholder="NGUYEN VAN A"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={vnpayDetails.expiryDate}
                    onChange={handleVnpayDetailsChange}
                    placeholder="MM/YY"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="securityCode">CVC</Label>
                  <Input
                    id="securityCode"
                    name="securityCode"
                    value={vnpayDetails.securityCode}
                    onChange={handleVnpayDetailsChange}
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-xs">
              <p className="text-blue-800 font-medium">VNPay Sandbox Mode</p>
              <p className="text-blue-700 mt-1">
                This is a test environment. No actual charges will be made.
                For testing, use OTP: 123456
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessVnpayPayment} disabled={loading}>
              {loading ? 'Processing...' : `Pay ${formatCurrency(invoice.total)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}