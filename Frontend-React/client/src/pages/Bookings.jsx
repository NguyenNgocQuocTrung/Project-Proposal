import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { mockBookings, mockRooms, mockServices } from '@/lib/mockData';
import { formatDate, calculateNights, getRoomTypeLabel, getServiceCategoryLabel } from '@/lib/utils';
import { 
  CalendarIcon, 
  CheckSquare, 
  Clock, 
  CreditCard, 
  Edit, 
  Plus, 
  Search, 
  Trash, 
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';

// Component for date picker with calendar popover
function DatePicker({ value, onChange, label, placeholder, disabled }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${!value ? 'text-muted-foreground' : ''}`}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), 'PPP') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => onChange(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Component for booking form
function BookingForm({ booking, availableRooms, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    guestName: '',
    phoneNumber: '',
    checkInDate: new Date(),
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    roomType: 'single',
    roomNumber: '',
    specialRequests: '',
    services: [],
    isForeign: false
  });
  
  // Available room numbers based on selected type
  const [availableRoomNumbers, setAvailableRoomNumbers] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // Load services
  useEffect(() => {
    // In a real app, this would be an API call
    setAvailableServices(mockServices.filter(service => service.status === 'available'));
  }, []);
  
  // Update form data from booking object if editing
  useEffect(() => {
    if (booking) {
      const bookingData = {
        ...booking,
        checkInDate: new Date(booking.checkInDate),
        checkOutDate: new Date(booking.checkOutDate),
        services: booking.services || []
      };
      setFormData(bookingData);
      setSelectedServices(booking.services || []);
    }
  }, [booking]);
  
  // Filter available rooms based on type
  useEffect(() => {
    if (formData.roomType && availableRooms.length > 0) {
      // If editing, include the current room as available
      const isEditing = !!booking;
      let filteredRooms;
      
      if (isEditing && booking.roomNumber) {
        // When editing, include the current room in available options
        filteredRooms = availableRooms.filter(room => 
          room.type === formData.roomType && 
          (room.status === 'available' || room.number === booking.roomNumber)
        );
      } else {
        // For new bookings, only show available rooms
        filteredRooms = availableRooms.filter(room => 
          room.type === formData.roomType && room.status === 'available'
        );
      }
      
      setAvailableRoomNumbers(filteredRooms.map(room => room.number));
      
      // Reset room number if the current one is not in filtered list
      if (formData.roomNumber && !filteredRooms.some(room => room.number === formData.roomNumber)) {
        setFormData(prev => ({ ...prev, roomNumber: '' }));
      }
    }
  }, [formData.roomType, availableRooms, booking]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (field, date) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };
  
  const handleServiceChange = (serviceId, checked) => {
    if (checked) {
      setSelectedServices(prev => [...prev, serviceId]);
    } else {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
      toast({
        title: 'Invalid Dates',
        description: 'Check-out date must be after check-in date.',
        variant: 'destructive',
      });
      return;
    }
    
    // Format dates for submission
    const formattedData = {
      ...formData,
      checkInDate: format(new Date(formData.checkInDate), 'yyyy-MM-dd'),
      checkOutDate: format(new Date(formData.checkOutDate), 'yyyy-MM-dd'),
      services: selectedServices
    };
    
    onSave(formattedData);
  };
  
  // Group services by category
  const groupedServices = availableServices.reduce((groups, service) => {
    const category = service.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(service);
    return groups;
  }, {});
  
  // Check if in edit mode
  const isEditing = !!booking;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guestName">Guest Name</Label>
          <Input
            id="guestName"
            name="guestName"
            value={formData.guestName}
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
        <DatePicker
          label="Check-in Date"
          value={formData.checkInDate}
          onChange={(date) => handleDateChange('checkInDate', date)}
          placeholder="Select check-in date"
        />
        
        <DatePicker
          label="Check-out Date"
          value={formData.checkOutDate}
          onChange={(date) => handleDateChange('checkOutDate', date)}
          placeholder="Select check-out date"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="roomType">Room Type</Label>
          <Select 
            value={formData.roomType} 
            onValueChange={(value) => handleSelectChange('roomType', value)}
            disabled={isEditing} // Disable room type editing for existing bookings
          >
            <SelectTrigger id="roomType" className={isEditing ? "bg-gray-50" : ""}>
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Room</SelectItem>
              <SelectItem value="double">Double Room</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
            </SelectContent>
          </Select>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">Room type cannot be changed for existing bookings</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="roomNumber">Room Number</Label>
          <Select 
            value={formData.roomNumber} 
            onValueChange={(value) => handleSelectChange('roomNumber', value)}
          >
            <SelectTrigger id="roomNumber">
              <SelectValue placeholder="Select room number" />
            </SelectTrigger>
            <SelectContent>
              {availableRoomNumbers.length > 0 ? (
                availableRoomNumbers.map(number => (
                  <SelectItem key={number} value={number}>Room {number}</SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>No available rooms</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="space-y-3">
        <Label>Additional Services</Label>
        <div className="border rounded-md p-3 space-y-4 max-h-[200px] overflow-y-auto">
          {Object.entries(groupedServices).map(([category, services]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm capitalize">{getServiceCategoryLabel(category)}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {services.map(service => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`service-${service.id}`} 
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={(checked) => handleServiceChange(service.id, checked)}
                    />
                    <Label 
                      htmlFor={`service-${service.id}`}
                      className="text-sm font-normal flex justify-between w-full"
                    >
                      <span>{service.name}</span>
                      <span className="text-right text-gray-500">
                        {service.price > 0 ? `$${service.price.toFixed(2)}` : 'Free'}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(groupedServices).length === 0 && (
            <div className="text-center py-2 text-gray-500">No services available</div>
          )}
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
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isForeign" 
          checked={formData.isForeign}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isForeign: checked }))}
        />
        <Label 
          htmlFor="isForeign"
          className="text-sm font-medium flex items-center"
        >
          <span>Foreign Guest</span>
          {formData.isForeign && (
            <span className="ml-2 text-xs text-amber-600 font-normal">(1.5x room rate will apply)</span>
          )}
        </Label>
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
function BookingCard({ booking, onCancel, onCheckout, onEdit, onDelete }) {
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
            <div className="font-semibold text-lg mb-1">
              {booking.roomType === 'single' ? '1P' : booking.roomType === 'double' ? '2P' : 'S'}
            </div>
            <div className="flex items-center mb-1">
              <div className={`h-2 w-2 rounded-full mr-1 ${status === 'Overdue' ? 'bg-red-500' : status === 'Active' ? 'bg-green-500' : status === 'Upcoming' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500">{status}</span>
            </div>
            <div className="text-xs text-gray-400">Room {booking.roomNumber}</div>
          </div>
          
          {/* Guest name */}
          <div className="mr-auto md:mr-6">
            <h3 className="font-semibold text-md">{booking.guestName}</h3>
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
              <span className="text-sm">{formatDate(booking.checkInDate)}</span>
            </div>
          </div>
          
          {/* Check out date */}
          <div className="w-1/2 md:w-auto flex items-center md:block">
            <CalendarIcon className="h-4 w-4 text-red-400 mr-2 md:hidden" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Check Out</span>
              <span className="text-sm">{formatDate(booking.checkOutDate)}</span>
            </div>
          </div>
          
          {/* Duration */}
          <div className="w-1/2 md:w-auto flex items-center md:block">
            <Clock className="h-4 w-4 text-purple-500 mr-2 md:hidden" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Duration</span>
              <span className="text-sm">{nights} nights</span>
            </div>
          </div>
          
          {/* Room Type */}
          <div className="w-1/2 md:w-auto flex items-center md:block">
            <CreditCard className="h-4 w-4 text-emerald-500 mr-2 md:hidden" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Room Type</span>
              <span className="text-sm">{getRoomTypeLabel(booking.roomType)}</span>
            </div>
          </div>
        </div>
        
        {/* Actions - right side */}
        <div className="md:ml-auto flex flex-wrap gap-2 justify-end">
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
  
  // Simulating data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // In a real app, we would fetch this data from API
      // For now, we'll use mock data with a slight delay
      setTimeout(() => {
        // Load bookings from localStorage or fallback to mock data
        const savedBookings = localStorage.getItem('hotelBookings');
        const loadedBookings = savedBookings ? JSON.parse(savedBookings) : mockBookings;
        
        // Load rooms from localStorage or fallback to mock data
        const savedRooms = localStorage.getItem('hotelRooms');
        const loadedRooms = savedRooms ? JSON.parse(savedRooms) : mockRooms;
        
        // Load services from localStorage or fallback to mock data
        const savedServices = localStorage.getItem('hotelServices');
        if (!savedServices) {
          // Save mock services to localStorage on first run
          localStorage.setItem('hotelServices', JSON.stringify(mockServices));
        }
        
        setBookings(loadedBookings);
        setRooms(loadedRooms);
        setLoading(false);
      }, 500);
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
  
  // Add or update a booking
  const handleSaveBooking = (bookingData) => {
    let updatedBookings;
    
    if (editingBooking) {
      // Update existing booking
      updatedBookings = bookings.map(booking => 
        booking.id === editingBooking.id ? { ...bookingData, id: booking.id } : booking
      );
      toast({
        title: 'Booking Updated',
        description: `Booking for ${bookingData.guestName} has been updated.`,
      });
    } else {
      // Add new booking
      const newBooking = {
        ...bookingData,
        id: Date.now(),
        isCheckedOut: false,
        isCancelled: false,
      };
      updatedBookings = [...bookings, newBooking];
      toast({
        title: 'Booking Created',
        description: `New booking for ${bookingData.guestName} has been created.`,
      });
    }
    
    setBookings(updatedBookings);
    saveBookingsToStorage(updatedBookings);
    setIsFormOpen(false);
    setEditingBooking(null);
  };
  
  // Edit a booking
  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setIsFormOpen(true);
  };
  
  // Cancel a booking
  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, isCancelled: true } : booking
      );
      setBookings(updatedBookings);
      saveBookingsToStorage(updatedBookings);
      toast({
        title: 'Booking Cancelled',
        description: 'The booking has been successfully cancelled.',
      });
    }
  };
  
  // Checkout confirmation functions
  
  // Open checkout confirmation modal
  const handleOpenCheckoutConfirmation = (bookingId) => {
    setCheckoutBookingId(bookingId);
    setCheckoutDialogOpen(true);
  };
  
  // Confirm checkout and create invoice
  const handleConfirmCheckout = () => {
    if (checkoutBookingId) {
      // Update the booking to checked out
      const updatedBookings = bookings.map(booking => 
        booking.id === checkoutBookingId ? { ...booking, isCheckedOut: true } : booking
      );
      
      // Get the booking that was checked out
      const checkedOutBooking = bookings.find(booking => booking.id === checkoutBookingId);
      
      // Update bookings state and local storage
      setBookings(updatedBookings);
      saveBookingsToStorage(updatedBookings);
      
      // Close dialog and show success message
      setCheckoutDialogOpen(false);
      
      // Show success message
      toast({
        title: 'Checkout Complete',
        description: `${checkedOutBooking?.guestName} has been checked out successfully.`,
      });
      
      // Generate and save an invoice for this booking
      // In a real application, this would call an API to create an invoice
      // For now, we'll just navigate to the Invoices page
      setTimeout(() => {
        window.location.href = '/invoices';
      }, 500);
    }
  };
  
  // Delete a booking
  const handleDeleteBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      setBookings(updatedBookings);
      saveBookingsToStorage(updatedBookings);
      toast({
        title: 'Booking Deleted',
        description: 'The booking has been permanently deleted.',
      });
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
            <DialogContent className="sm:max-w-[600px]">
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
        <DialogContent className="sm:max-w-[425px]">
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