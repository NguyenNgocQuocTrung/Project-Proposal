import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookingDetails } from '@/store/slices/bookingsSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  Trash,
  XCircle,
  CheckSquare,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
} from 'lucide-react';

function BookingDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBooking: booking, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchBookingDetails(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/bookings')} className="mt-4">
          Back to Bookings
        </Button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p>Booking not found</p>
        <Button onClick={() => navigate('/bookings')} className="mt-4">
          Back to Bookings
        </Button>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/bookings/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.bookings.delete(id);
        toast({
          title: 'Booking Deleted',
          description: 'The booking has been permanently deleted.',
        });
        navigate('/bookings');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete booking',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.bookings.cancel(id);
        toast({
          title: 'Booking Cancelled',
          description: 'The booking has been successfully cancelled.',
        });
        dispatch(fetchBookingDetails(id)); // Refresh booking details
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to cancel booking',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCheckout = async () => {
    if (window.confirm('Are you sure you want to check out this booking?')) {
      try {
        await api.bookings.checkout(id);
        toast({
          title: 'Checkout Complete',
          description: 'The guest has been checked out successfully.',
        });
        navigate('/invoices');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to checkout booking',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/bookings')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Booking Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          {!booking.isCheckedOut && !booking.isCancelled && (
            <>
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleCheckout}
                className="flex items-center text-green-600"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Checkout
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center text-red-500"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex items-center text-red-500"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Guest Information</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{booking.fullName}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{booking.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{booking.address}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Booking Information</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Check-in Date</p>
                <p className="font-medium">{formatDate(booking.checkIn)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Check-out Date</p>
                <p className="font-medium">{formatDate(booking.checkOut)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Room Numbers</p>
                <p className="font-medium">{booking.roomNo.join(', ')}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {booking.specialRequests && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Special Requests</h2>
          <p className="text-gray-600">{booking.specialRequests}</p>
        </Card>
      )}
    </div>
  );
}

export default BookingDetail; 