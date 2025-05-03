import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createInvoice } from '../store/slices/invoicesSlice';
import { useToast } from '@/hooks/use-toast';

function InvoiceModal({ isOpen, onClose, bookingId = null }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const bookings = useSelector(state => state.bookings.bookings);
  const services = useSelector(state => state.services.services);
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      bookingId: bookingId || '',
      paymentMethod: 'credit-card'
    }
  });
  
  const watchBookingId = watch('bookingId');
  
  useEffect(() => {
    if (bookingId) {
      setValue('bookingId', bookingId);
    }
  }, [bookingId, setValue]);
  
  useEffect(() => {
    if (watchBookingId) {
      const booking = bookings.find(b => b.id === parseInt(watchBookingId) || b.id === watchBookingId);
      setSelectedBooking(booking);
      
      if (booking) {
        // Calculate room charge based on check-in and check-out dates
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        
        let roomRate = 0;
        switch(booking.roomType) {
          case 'single': 
            roomRate = 100;
            break;
          case 'double':
            roomRate = 150;
            break;
          case 'suite':
            roomRate = 250;
            break;
          default:
            roomRate = 100;
        }
        
        const roomCharge = nights * roomRate;
        
        setTotalAmount(roomCharge);
      } else {
        setTotalAmount(0);
      }
    } else {
      setSelectedBooking(null);
      setTotalAmount(0);
    }
  }, [watchBookingId, bookings]);
  
  const handleAddService = (serviceId) => {
    const service = services.find(s => s.id === parseInt(serviceId));
    if (service && !selectedServices.some(s => s.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
      setTotalAmount(prevTotal => prevTotal + service.price);
    }
  };
  
  const handleRemoveService = (serviceId) => {
    const service = selectedServices.find(s => s.id === serviceId);
    if (service) {
      setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
      setTotalAmount(prevTotal => prevTotal - service.price);
    }
  };
  
  const onSubmit = (data) => {
    try {
      if (!selectedBooking) {
        throw new Error("Please select a valid booking");
      }
      
      const invoiceData = {
        bookingId: data.bookingId,
        guestName: selectedBooking.guestName,
        checkInDate: selectedBooking.checkInDate,
        checkOutDate: selectedBooking.checkOutDate,
        services: selectedServices,
        paymentMethod: data.paymentMethod,
        totalAmount,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'unpaid'
      };
      
      dispatch(createInvoice(invoiceData));
      toast({
        title: "Invoice created",
        description: "The invoice has been created successfully."
      });
      
      onClose();
      reset();
      setSelectedServices([]);
      setTotalAmount(0);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred. Please try again."
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bookingId">Booking ID</Label>
              <Select 
                onValueChange={(value) => setValue('bookingId', value)}
                defaultValue={bookingId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map(booking => (
                    <SelectItem key={booking.id} value={booking.id.toString()}>
                      {booking.id} - {booking.guestName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bookingId && <p className="text-xs text-red-500">{errors.bookingId.message}</p>}
            </div>
            
            {selectedBooking && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="guestName">Guest Name</Label>
                  <Input
                    id="guestName"
                    value={selectedBooking.guestName}
                    readOnly
                    disabled
                    className="bg-[hsl(var(--neutral-50))]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInDate">Check-in</Label>
                    <Input
                      id="checkInDate"
                      value={selectedBooking.checkInDate}
                      readOnly
                      disabled
                      className="bg-[hsl(var(--neutral-50))]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOutDate">Check-out</Label>
                    <Input
                      id="checkOutDate"
                      value={selectedBooking.checkOutDate}
                      readOnly
                      disabled
                      className="bg-[hsl(var(--neutral-50))]"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Charges</Label>
                    <Select onValueChange={handleAddService}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Add service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name} - ${service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          Room Charge ({selectedBooking.roomType})
                        </TableCell>
                        <TableCell className="text-right">
                          ${totalAmount - selectedServices.reduce((sum, service) => sum + service.price, 0)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      
                      {selectedServices.map(service => (
                        <TableRow key={service.id}>
                          <TableCell>{service.name}</TableCell>
                          <TableCell className="text-right">${service.price}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveService(service.id)}
                            >
                              ✕
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      <TableRow>
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell className="font-medium text-right">${totalAmount}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    onValueChange={(value) => setValue('paymentMethod', value)}
                    defaultValue="credit-card"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedBooking}>
              Generate Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InvoiceModal;
