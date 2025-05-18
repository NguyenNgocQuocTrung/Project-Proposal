import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { formatDate, calculateNights, getRoomTypeLabel, getServiceCategoryLabel } from '@/lib/utils';
import {
  Eye,
  CalendarIcon,
  CheckSquare,
  Clock,
  CreditCard,
  Edit,
  Plus,
  Search,
  Trash,
  XCircle,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchBookings, createBookingAsync } from '@/store/slices/bookingsSlice';
import { fetchAvailableRooms } from '@/store/slices/roomsSlice';
import api from '@/services/api';

// Component for date picker with calendar popover
function DatePicker({ value, onChange, label, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${!value ? 'text-muted-foreground' : ''}`}
            disabled={disabled}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), 'PPP') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          side="top"
          sideOffset={8}
          style={{ bottom: '100%', top: 'auto' }}
        >
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function RoomMultiSelect({ availableRooms, selectedRooms, setSelectedRooms }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef();

  const handleSelect = (room) => {
    setSelectedRooms((prev) => [...prev, room.roomNo]);
    setDropdownOpen(false);
    inputRef.current.blur();
  };

  const handleRemove = (roomNumber) => {
    setSelectedRooms((prev) => prev.filter((num) => num !== roomNumber));
  };

  const filteredRooms = availableRooms.filter(
    (room) => !selectedRooms.includes(room.roomNo)
  );

  return (
    <div className="relative w-full">
      <div
        className="
          flex items-center gap-1 border rounded px-2 py-1 min-h-[40px] bg-white
          overflow-x-auto
          whitespace-nowrap
        "
        style={{ maxWidth: '100%' }}
        onClick={() => inputRef.current.focus()}
      >
        {selectedRooms.map((num) => {
      // Tìm thông tin phòng từ availableRooms
      const roomInfo = availableRooms.find(room => room.roomNo === num);
      return (
        <span
          key={num}
          className="
            flex items-center gap-1
            bg-gradient-to-r from-pink-400 to-pink-600
            text-white
            rounded-full
            px-3 py-1
            text-xs
            shadow
            border border-pink-300
            mr-1 mb-1
            transition
          "
        >
          Room {num} ({roomInfo?.maxNum || ''})
          <button
            type="button"
            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition"
            onClick={() => handleRemove(num)}
            tabIndex={-1}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      );
    })}
        <input
          ref={inputRef}
          className="flex-1 min-w-[60px] outline-none border-none bg-transparent text-xs"
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 100)}
          placeholder={selectedRooms.length === 0 ? 'Select room...' : ''}
        />
      </div>
      {dropdownOpen && filteredRooms.length > 0 && (
        <div className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 max-h-40 overflow-auto">
          {filteredRooms.map((room) => (
            <div
              key={room.roomNo}
              className="
                px-3 py-2 cursor-pointer
                hover:bg-pink-100
                text-sm
                flex items-center
                transition
              "
              onMouseDown={() => handleSelect(room)}
            >
              <span>Room {room.roomNo}</span>
              <span className="text-xs text-gray-500">({room.maxNum})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Component for booking form
function BookingForm({ booking, availableRooms, onSave, onCancel }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    identityNumber: '',
    address: '',
    gender: '',
    nationality: '',
    guestNum: 1,
    checkIn: new Date(),
    checkOut: new Date(new Date().setDate(new Date().getDate() + 1)),
    roomNo: [],
    specialRequests: ''
  });

  // Available room numbers
  const [availableRoomNumbers, setAvailableRoomNumbers] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [dateError, setDateError] = useState('');

  // Filter available rooms
  useEffect(() => {
    if (availableRooms.length > 0) {
      const filteredRooms = availableRooms.filter(room => room.status === 'available');
      setAvailableRoomNumbers(filteredRooms);
    }
  }, [availableRooms]);

  // Update form data from booking object if editing
  useEffect(() => {
    if (booking) {
      const bookingData = {
        ...booking,
        checkIn: new Date(booking.checkIn),
        checkOut: new Date(booking.checkOut),
      };
      setFormData(bookingData);
      setSelectedRooms(booking.roomNo || []);
    }
  }, [booking]);

  useEffect(() => {
    const fetchRooms = async () => {
      const checkInDate = formData.checkIn;
      const checkOutDate = formData.checkOut;
      const response = await dispatch(fetchAvailableRooms({
        checkInDate: checkInDate.toLocaleDateString('en-CA'),
        checkOutDate: checkOutDate.toLocaleDateString('en-CA'),
      })).unwrap();
      setAvailableRoomNumbers(response);
    };
  
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckInChange = async (date) => {
    const checkInDate = date;
    const checkOutDate = formData.checkOut;
    setFormData(prev => ({ ...prev, checkIn: checkInDate }));
    setSelectedRooms([]);
    if (checkOutDate && checkOutDate <= checkInDate) {
      setDateError('Check-out date must be after check-in date.');
      setAvailableRoomNumbers([]);
      return;
    }

    setDateError('');
    const response = await dispatch(fetchAvailableRooms({
      checkInDate: checkInDate.toLocaleDateString('en-CA'),
      checkOutDate: checkOutDate.toLocaleDateString('en-CA'),
    })).unwrap();
    setAvailableRoomNumbers(response);
  };

  const handleCheckOutChange = async (date) => {
    console.log(date.toISOString().slice(0, 10))
    const checkInDate = formData.checkIn;
    const checkOutDate = date;
    setFormData(prev => ({ ...prev, checkOut: checkOutDate }));
    setSelectedRooms([]);
    if (!checkInDate) {
      setDateError('');
      setAvailableRoomNumbers([]);
      return;
    }

    if (checkOutDate <= checkInDate) {
      setDateError('Check-out date must be after check-in date.');
      setAvailableRoomNumbers([]);
      return;
    }

    setDateError('');
    const response = await dispatch(fetchAvailableRooms({
      checkInDate: checkInDate.toLocaleDateString('en-CA'),
      checkOutDate: checkOutDate.toLocaleDateString('en-CA'),
    })).unwrap();
    setAvailableRoomNumbers(response);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      toast({
        title: 'Invalid Dates',
        description: 'Check-out date must be after check-in date.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedRooms.length === 0) {
      toast({
        title: 'No Rooms Selected',
        description: 'Please select at least one room.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const bookingData = {
        ...formData,
        checkIn: formData.checkIn.toISOString(),
        checkOut: formData.checkOut.toISOString(),
        roomNo: selectedRooms.map(num => parseInt(num)),
        guestNum: parseInt(formData.guestNum)
      };
      const resultAction = await dispatch(createBookingAsync(bookingData));
      console.log('resultAction:', resultAction);
      if (createBookingAsync.fulfilled.match(resultAction)) {
        console.log('TOAST SUCCESS SHOULD SHOW');
        toast({
          title: 'Booking Created',
          description: `New booking for ${formData.fullName} has been created.`,
        });
        onSave(resultAction.payload);
      } else {
        throw new Error(resultAction.payload || 'Failed to create booking');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div style={{ minHeight: 24 }}>
        {dateError && (
          <div className="text-center text-sm text-red-600 font-medium">
            {dateError}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DatePicker
          label="Check-in Date"
          value={formData.checkIn}
          onChange={handleCheckInChange}
          placeholder="Select check-in date"
        />
        <DatePicker
          label="Check-out Date"
          value={formData.checkOut}
          onChange={handleCheckOutChange}
          placeholder="Select check-out date"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guestNum">Number of Guests</Label>
          <Input
            id="guestNum"
            name="guestNum"
            type="number"
            min="1"
            value={formData.guestNum}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium">Select Rooms</Label>
          <RoomMultiSelect
            availableRooms={availableRoomNumbers}
            selectedRooms={selectedRooms}
            setSelectedRooms={setSelectedRooms}
          />
          {/* {availableRoomNumbers.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No rooms available for the selected dates
            </div>
          )} */}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1 (123) 456-7890"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="identityNumber">Identity Number</Label>
          <Input
            id="identityNumber"
            name="identityNumber"
            value={formData.identityNumber}
            onChange={handleChange}
            placeholder="Enter identity number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleSelectChange('gender', value)}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            placeholder="Enter nationality"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialRequests">Special Requests</Label>
        <Input
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          placeholder="Any special requests or notes"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Booking</Button>
      </DialogFooter>
    </form>
  );
}

// Booking details card
function BookingCard({ booking, onCancel, onCheckout, onEdit, onDelete, onViewDetails }) {
  const isActive = !booking.isCheckedOut && !booking.isCancelled;
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const [services, setServices] = useState([]);

  // Load services for this booking
  useEffect(() => {
    // In a real app, we would fetch this from API
    const bookingServices = booking.services || [];
    if (bookingServices.length > 0) {
      // Get service details from the service IDs
      const savedServices = localStorage.getItem('hotelServices');
      const allServices = savedServices ? JSON.parse(savedServices) : mockServices;

      // Filter to get only the services for this booking
      const filteredServices = allServices.filter(service =>
        bookingServices.includes(service.id)
      );

      setServices(filteredServices);
    }
  }, [booking]);

  // Determine status
  const getStatus = () => {
    if (booking.isCancelled) return 'Cancelled';
    if (booking.isCheckedOut) return 'Checked Out';

    const today = new Date();
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);

    if (today >= checkIn && today < checkOut) return 'Active';
    if (today < checkIn) return 'Upcoming';
    if (today >= checkOut) return 'Overdue';

    return 'Unknown';
  };

  // Get status styles
  const getStatusStyles = () => {
    const status = getStatus();
    const styles = {
      'Active': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: <CheckSquare className="h-4 w-4 text-green-600" />
      },
      'Upcoming': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: <CalendarIcon className="h-4 w-4 text-blue-600" />
      },
      'Overdue': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: <Clock className="h-4 w-4 text-red-600" />
      },
      'Cancelled': {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        icon: <XCircle className="h-4 w-4 text-gray-600" />
      },
      'Checked Out': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: <CheckSquare className="h-4 w-4 text-green-600" />
      }
    };
    return styles[status] || styles['Unknown'];
  };

  const statusStyles = getStatusStyles();
  const status = getStatus();

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 relative mb-2">
      <div className="flex flex-col md:flex-row p-4 md:p-6">
        <div className="flex mb-4 md:mb-0">
          {/* Left section - Room type and status indicator */}
          <div className="w-16 md:w-16 flex-shrink-0 flex flex-col items-center border-r border-gray-100 pr-4 mr-4">
            {/* <div className="font-semibold text-lg mb-1">
              {booking.bookingCode}
            </div> */}
            {/* <div className="flex items-center mb-1">
              <div className={`h-2 w-2 rounded-full mr-1 ${status === 'Overdue' ? 'bg-red-500' : status === 'Active' ? 'bg-green-500' : status === 'Upcoming' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500">{status}</span>
            </div> */}
            <div className="text-xs text-gray-400">{booking.bookingCode}</div>
          </div>

          {/* Guest name */}
          <div className="mr-auto md:mr-6">
            <h3 className="font-semibold text-md">{booking.fullName}</h3>
            {booking.isForeign && (
              <div className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded inline-block mt-1">
                Foreign Guest
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-6 mb-4 md:mb-0">
          {/* Check in date */}
          <div className="w-1/2 md:w-auto flex items-center md:block">
            <CalendarIcon className="h-4 w-4 text-blue-500 mr-2 md:hidden" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Check In</span>
              <span className="text-sm">{formatDate(booking.checkIn)}</span>
            </div>
          </div>

          {/* Check out date */}
          <div className="w-1/2 md:w-auto flex items-center md:block">
            <CalendarIcon className="h-4 w-4 text-red-400 mr-2 md:hidden" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Check Out</span>
              <span className="text-sm">{formatDate(booking.checkOut)}</span>
            </div>
          </div>

          {/* Duration */}
          <div className="w-1/2 md:w-auto flex items-center md:block">
            <Clock className="h-4 w-4 text-purple-500 mr-2 md:hidden" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Num guest</span>
              <span className="text-sm">{booking.guestNum} </span>
            </div>
          </div>

          
        </div>

        {/* Actions - right side */}
        <div className="md:ml-auto flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(booking.bookingCode)}
            className="text-blue-600 border-blue-100 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Details
          </Button>

          {isActive && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(booking)}
                className="text-blue-600 border-blue-100 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCheckout(booking.id)}
                className="text-green-600 border-green-100 hover:bg-green-50"
              >
                <CheckSquare className="h-4 w-4 mr-1.5" />
                Checkout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(booking.id)}
                className="text-red-500 border-red-100 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
            </>
          )}
          {!isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(booking.id)}
              className="text-red-500 border-red-100 hover:bg-red-50"
            >
              <Trash className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Services section */}
      {services.length > 0 && (
        <div className="border-t border-gray-100 px-4 md:px-6 py-2 bg-blue-50">
          <div className="flex items-center text-xs text-blue-600 mb-1">
            <CreditCard className="h-3 w-3 mr-1.5" />
            <span>Services</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {services.map(service => (
              <span
                key={service.id}
                className="text-xs px-2 py-0.5 bg-white border border-blue-100 rounded-full text-blue-700"
              >
                {service.name}
                {service.price > 0 && ` ($${service.price.toFixed(2)})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Special requests section */}
      {booking.specialRequests && (
        <div className={`border-t border-gray-100 px-4 md:px-6 py-2 ${services.length > 0 ? 'bg-gray-50' : 'bg-gray-50'}`}>
          <div className="flex items-center text-xs text-amber-600 mb-1">
            <Edit className="h-3 w-3 mr-1.5" />
            <span>Special Requests</span>
          </div>
          <p className="text-xs text-gray-600">{booking.specialRequests}</p>
        </div>
      )}
    </Card>
  );
}

function Bookings() {
  const dispatch = useDispatch();
  const [location, setLocation] = useLocation();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [checkoutBookingId, setCheckoutBookingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.bookings.getAll();
        setBookings(response.data);
        
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch bookings data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter bookings based on search, tab, and status
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(b => !b.isCheckedOut && !b.isCancelled);
    } else if (activeTab === 'history') {
      filtered = filtered.filter(b => b.isCheckedOut || b.isCancelled);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'upcoming') {
        filtered = filtered.filter(b =>
          !b.isCheckedOut &&
          !b.isCancelled &&
          new Date(b.checkInDate) > new Date()
        );
      } else if (filterStatus === 'current') {
        const today = new Date();
        filtered = filtered.filter(b =>
          !b.isCheckedOut &&
          !b.isCancelled &&
          new Date(b.checkInDate) <= today &&
          new Date(b.checkOutDate) > today
        );
      } else if (filterStatus === 'cancelled') {
        filtered = filtered.filter(b => b.isCancelled);
      } else if (filterStatus === 'checked-out') {
        filtered = filtered.filter(b => b.isCheckedOut);
      }
    }

    // Search by guest name or room number
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.guestName.toLowerCase().includes(query) ||
        b.roomNumber.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, searchQuery, filterStatus, activeTab]);

  // Save bookings to localStorage
  const saveBookingsToStorage = (updatedBookings) => {
    localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
  };

  // Update handleSaveBooking to only update state, not call API
  const handleSaveBooking = (booking) => {
    setBookings([...bookings, booking]);
    setIsFormOpen(false);
    setEditingBooking(null);
  };

  // Edit a booking
  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setIsFormOpen(true);
  };

  // Update handleCancelBooking to use API
  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.bookings.cancel(bookingId);
        const updatedBookings = bookings.map(booking =>
          booking.id === bookingId ? { ...booking, isCancelled: true } : booking
        );
        setBookings(updatedBookings);
        toast({
          title: 'Booking Cancelled',
          description: 'The booking has been successfully cancelled.',
        });
      } catch (error) {
        console.error('Error cancelling booking:', error);
        toast({
          title: 'Error',
          description: 'Failed to cancel booking',
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewBookingDetails = (bookingId) => {
    setLocation(`/bookings/${bookingId}`);
  };
  // Checkout confirmation functions

  // Open checkout confirmation modal
  const handleOpenCheckoutConfirmation = (bookingId) => {
    setCheckoutBookingId(bookingId);
    setCheckoutDialogOpen(true);
  };

  // Update handleConfirmCheckout to use API
  const handleConfirmCheckout = async () => {
    if (checkoutBookingId) {
      try {
        await api.bookings.checkout(checkoutBookingId);
        const updatedBookings = bookings.map(booking =>
          booking.id === checkoutBookingId ? { ...booking, isCheckedOut: true } : booking
        );
        setBookings(updatedBookings);
        setCheckoutDialogOpen(false);
        
        const checkedOutBooking = bookings.find(booking => booking.id === checkoutBookingId);
        toast({
          title: 'Checkout Complete',
          description: `${checkedOutBooking?.fullName} has been checked out successfully.`,
        });

        setTimeout(() => {
          window.location.href = '/invoices';
        }, 500);
      } catch (error) {
        console.error('Error checking out booking:', error);
        toast({
          title: 'Error',
          description: 'Failed to checkout booking',
          variant: 'destructive',
        });
      }
    }
  };

  // Update handleDeleteBooking to use API
  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await api.bookings.delete(bookingId);
        const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
        setBookings(updatedBookings);
        toast({
          title: 'Booking Deleted',
          description: 'The booking has been permanently deleted.',
        });
      } catch (error) {
        console.error('Error deleting booking:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete booking',
          variant: 'destructive',
        });
      }
    }
  };

  // Create a new booking
  const handleAddBooking = () => {
    setEditingBooking(null);
    setIsFormOpen(true);
  };

  // Filter available rooms (not booked for the selected dates)
  const getAvailableRooms = () => {
    // In a real application, this would be more complex and would check for
    // date overlaps between existing bookings and the new booking dates
    return rooms.filter(room => room.status === 'available');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 px-2 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Bookings</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage guest reservations and check-ins
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="py-1 px-3 rounded-full border border-green-200 bg-green-50 flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-green-700">Active: {bookings.filter(b => !b.isCheckedOut && !b.isCancelled).length}</span>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddBooking} className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200">
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingBooking ? 'Edit Booking' : 'Create Booking'}</DialogTitle>
                <DialogDescription>
                  {editingBooking
                    ? `Update booking details for ${editingBooking.guestName}.`
                    : 'Enter the details to create a new booking.'}
                </DialogDescription>
              </DialogHeader>
              <BookingForm
                booking={editingBooking}
                availableRooms={getAvailableRooms()}
                onSave={handleSaveBooking}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium">Booking List</h2>
              <div className="text-sm text-gray-500">
                {bookings.length} total
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search guest name or room..."
                  className="pl-8 border-gray-200 focus-visible:ring-blue-500 rounded-md text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-full sm:w-40 border-gray-200 rounded-md text-sm">
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="current">Current Stay</SelectItem>
                  <SelectItem value="checked-out">Checked Out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-gray-100 px-4">
            <TabsList className="border-b-0">
              <TabsTrigger value="all" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
                All Bookings
              </TabsTrigger>
              <TabsTrigger value="active" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
                Active
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="p-0">
            <div className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>

            <div className="p-4 flex flex-col gap-3">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onEdit={handleEditBooking}
                  onCancel={handleCancelBooking}
                  onCheckout={handleOpenCheckoutConfirmation}
                  onDelete={handleDeleteBooking}
                  onViewDetails={handleViewBookingDetails}
                />
              ))}

              {filteredBookings.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <div className="mb-3">No bookings found</div>
                  <p className="text-sm text-gray-400">Try adjusting your filters or create a new booking</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="active" className="p-0">
            <div className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100">
              Showing {filteredBookings.length} active bookings
            </div>

            <div className="p-4 flex flex-col gap-3">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onEdit={handleEditBooking}
                  onCancel={handleCancelBooking}
                  onCheckout={handleOpenCheckoutConfirmation}
                  onDelete={handleDeleteBooking}
                  onViewDetails={handleViewBookingDetails}
                />
              ))}

              {filteredBookings.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <div className="mb-3">No active bookings found</div>
                  <p className="text-sm text-gray-400">Create a new booking to see it here</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-0">
            <div className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100">
              Showing {filteredBookings.length} historical bookings
            </div>

            <div className="p-4 flex flex-col gap-3">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onEdit={handleEditBooking}
                  onCancel={handleCancelBooking}
                  onCheckout={handleOpenCheckoutConfirmation}
                  onDelete={handleDeleteBooking}
                  onViewDetails={handleViewBookingDetails}
                />
              ))}

              {filteredBookings.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <div className="mb-3">No historical bookings found</div>
                  <p className="text-sm text-gray-400">Completed and cancelled bookings will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Confirm Checkout</DialogTitle>
            <DialogDescription>
              Are you sure you want to check out this booking and create an invoice?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              This will mark the booking as checked out and create an invoice with all charges.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCheckout} className="bg-green-600 hover:bg-green-700">
              Confirm Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Bookings;