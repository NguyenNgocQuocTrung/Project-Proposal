import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBooking, updateBooking } from '../store/slices/bookingsSlice';
import { useToast } from '@/hooks/use-toast';

function BookingModal({ isOpen, onClose, booking = null }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const isEditing = !!booking;
  
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      guestName: '',
      phoneNumber: '',
      checkInDate: format(new Date(), 'yyyy-MM-dd'),
      checkOutDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
      roomType: '',
      specialRequests: ''
    }
  });
  
  useEffect(() => {
    if (booking) {
      setValue('guestName', booking.guestName);
      setValue('phoneNumber', booking.phoneNumber);
      setValue('checkInDate', booking.checkInDate);
      setValue('checkOutDate', booking.checkOutDate);
      setValue('roomType', booking.roomType);
      setValue('specialRequests', booking.specialRequests || '');
    } else {
      reset();
    }
  }, [booking, setValue, reset]);
  
  const onSubmit = (data) => {
    try {
      if (isEditing) {
        dispatch(updateBooking({ ...data, id: booking.id }));
        toast({
          title: "Booking updated",
          description: "The booking has been updated successfully."
        });
      } else {
        dispatch(createBooking(data));
        toast({
          title: "Booking created",
          description: "The booking has been created successfully."
        });
      }
      onClose();
      reset();
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Booking' : 'New Booking'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Guest Name</Label>
                <Input
                  id="guestName"
                  {...register('guestName', { required: "Guest name is required" })}
                />
                {errors.guestName && <p className="text-xs text-red-500">{errors.guestName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  {...register('phoneNumber', { required: "Phone number is required" })}
                />
                {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">Check-in Date</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  {...register('checkInDate', { required: "Check-in date is required" })}
                />
                {errors.checkInDate && <p className="text-xs text-red-500">{errors.checkInDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Check-out Date</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  {...register('checkOutDate', { required: "Check-out date is required" })}
                />
                {errors.checkOutDate && <p className="text-xs text-red-500">{errors.checkOutDate.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              <Select 
                onValueChange={(value) => setValue('roomType', value)}
                defaultValue={booking?.roomType || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Room</SelectItem>
                  <SelectItem value="double">Double Room</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                </SelectContent>
              </Select>
              {errors.roomType && <p className="text-xs text-red-500">{errors.roomType.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                {...register('specialRequests')}
                placeholder="Enter any special requests here..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Booking' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BookingModal;
