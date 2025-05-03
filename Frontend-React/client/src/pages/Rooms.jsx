import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';
import { mockRooms } from '@/lib/mockData';
import { formatCurrency, getRoomTypeLabel } from '@/lib/utils';
import { Bed, Grid, Hotel, List, PencilLine, Plus, Trash } from 'lucide-react';

// Room form component
function RoomForm({ room, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    number: '',
    type: 'single',
    price: '',
    capacity: 1,
    floor: 1,
    amenities: '',
    status: 'available',
    description: '',
  });
  
  // Set form data when editing an existing room
  useEffect(() => {
    if (room) {
      setFormData(room);
    }
  }, [room]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.number.trim() || !formData.price.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Room number and price are required.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate price is a number
    if (isNaN(parseFloat(formData.price))) {
      toast({
        title: 'Validation Error',
        description: 'Price must be a valid number.',
        variant: 'destructive',
      });
      return;
    }
    
    // Format the data for submission
    const roomData = {
      ...formData,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity, 10),
    };
    
    onSave(roomData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="number">Room Number</Label>
          <Input
            id="number"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="101"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Room Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => handleSelectChange('type', value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Room</SelectItem>
              <SelectItem value="double">Double Room</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price per Night</Label>
          <Input
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="99.99"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="floor">Floor</Label>
          <Select 
            value={formData.floor.toString()} 
            onValueChange={(value) => handleSelectChange('floor', parseInt(value))}
          >
            <SelectTrigger id="floor">
              <SelectValue placeholder="Select floor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Floor 1</SelectItem>
              <SelectItem value="2">Floor 2</SelectItem>
              <SelectItem value="3">Floor 3</SelectItem>
              <SelectItem value="4">Floor 4</SelectItem>
              <SelectItem value="5">Floor 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Select 
            value={formData.capacity.toString()} 
            onValueChange={(value) => handleSelectChange('capacity', parseInt(value))}
          >
            <SelectTrigger id="capacity">
              <SelectValue placeholder="Select capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Person</SelectItem>
              <SelectItem value="2">2 People</SelectItem>
              <SelectItem value="3">3 People</SelectItem>
              <SelectItem value="4">4 People</SelectItem>
              <SelectItem value="5">5+ People</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amenities">Amenities</Label>
        <Input
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          placeholder="Wi-Fi, TV, Air Conditioning, etc."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Under Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Room description and details"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Room</Button>
      </DialogFooter>
    </form>
  );
}

// Room card component for grid view
function RoomCard({ room, onEdit, onDelete }) {
  const getStatusBadge = () => {
    switch (room.status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">available</Badge>;
      case 'occupied':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">occupied</Badge>;
      case 'reserved':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">reserved</Badge>;
      case 'maintenance':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">maintenance</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{room.status}</Badge>;
    }
  };

  const getAmenityIcon = (amenity) => {
    if (amenity.toLowerCase().includes('wi-fi')) return 'Wi-Fi';
    if (amenity.toLowerCase().includes('tv')) return 'TV';
    if (amenity.toLowerCase().includes('air')) return 'AC';
    return null;
  };
  
  const amenityList = room.amenities ? room.amenities.split(',').map(a => a.trim()) : [];
  
  return (
    <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Room {room.number}</CardTitle>
            <CardDescription className="text-base mt-1">{getRoomTypeLabel(room.type)}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Floor: {room.floor || Math.floor(parseInt(room.number) / 100)}</p>
          <p className="text-sm font-medium">Capacity: {room.capacity} person(s)</p>
        </div>
        <div>
          <p className="text-lg font-bold text-blue-500">${Math.round(room.price)}/night</p>
        </div>
        
        {amenityList.length > 0 && (
          <div className="flex gap-3 mt-2">
            {amenityList.map((amenity, index) => {
              const icon = getAmenityIcon(amenity);
              if (icon) {
                return (
                  <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {icon}
                  </span>
                );
              }
              return null;
            }).filter(Boolean)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(room)}
          className="hover:bg-gray-100"
        >
          <PencilLine className="h-4 w-4" />
          <span className="ml-1">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(room.id)}
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash className="h-4 w-4" />
          <span className="ml-1">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // Load rooms from localStorage or use mock data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // In a real app, we would fetch this data from API
      // For now, we'll use mock data with a slight delay
      setTimeout(() => {
        const savedRooms = localStorage.getItem('hotelRooms');
        const loadedRooms = savedRooms ? JSON.parse(savedRooms) : mockRooms;
        setRooms(loadedRooms);
        setLoading(false);
      }, 500);
    };
    
    fetchData();
  }, []);
  
  // Filter rooms based on search query, type, and status
  useEffect(() => {
    let filtered = [...rooms];
    
    // Filter by room type
    if (filterType !== 'all') {
      filtered = filtered.filter(room => room.type === filterType);
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(room => room.status === filterStatus);
    }
    
    // Search by room number or description
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room => 
        room.number.toLowerCase().includes(query) || 
        (room.description && room.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredRooms(filtered);
  }, [rooms, searchQuery, filterType, filterStatus]);
  
  // Save rooms to localStorage
  const saveRoomsToStorage = (updatedRooms) => {
    localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
  };
  
  // Handle saving a new or edited room
  const handleSaveRoom = (roomData) => {
    let updatedRooms;
    
    if (editingRoom) {
      // Update existing room
      updatedRooms = rooms.map(room => 
        room.id === editingRoom.id ? { ...roomData, id: room.id } : room
      );
      toast({
        title: 'Room Updated',
        description: `Room ${roomData.number} has been updated.`,
      });
    } else {
      // Add new room
      const newRoom = {
        ...roomData,
        id: Date.now(),
      };
      updatedRooms = [...rooms, newRoom];
      toast({
        title: 'Room Added',
        description: `Room ${roomData.number} has been added.`,
      });
    }
    
    setRooms(updatedRooms);
    saveRoomsToStorage(updatedRooms);
    setIsFormOpen(false);
    setEditingRoom(null);
  };
  
  // Handle editing a room
  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setIsFormOpen(true);
  };
  
  // Handle deleting a room
  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      const updatedRooms = rooms.filter(room => room.id !== roomId);
      setRooms(updatedRooms);
      saveRoomsToStorage(updatedRooms);
      toast({
        title: 'Room Deleted',
        description: 'The room has been permanently deleted.',
      });
    }
  };
  
  // Handle adding a new room
  const handleAddRoom = () => {
    setEditingRoom(null);
    setIsFormOpen(true);
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
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage room availability
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddRoom} className="bg-blue-500 hover:bg-blue-600 rounded-full px-4">
              <Plus className="mr-2 h-4 w-4" />
              Add New Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              <DialogDescription>
                {editingRoom 
                  ? `Update details for Room ${editingRoom.number}.`
                  : 'Enter the details to add a new room.'}
              </DialogDescription>
            </DialogHeader>
            <RoomForm 
              room={editingRoom} 
              onSave={handleSaveRoom}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="w-full sm:max-w-md">
          <Input
            type="search"
            placeholder="Search rooms..."
            className="rounded-full px-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={filterType} 
            onValueChange={setFilterType}
          >
            <SelectTrigger className="rounded-full w-28">
              <SelectValue placeholder="all" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="rounded-full w-28">
              <SelectValue placeholder="all" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Calculate pagination */}
      {(() => {
        // Reset to page 1 if filter changes leave us on an invalid page
        const maxPage = Math.ceil(filteredRooms.length / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
          setCurrentPage(1); 
        }
        
        // Get paginated data
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
        
        return viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentItems.map(room => (
                <RoomCard 
                  key={room.id} 
                  room={room}
                  onEdit={handleEditRoom}
                  onDelete={handleDeleteRoom}
                />
              ))}
              
              {filteredRooms.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  No rooms found. Try adjusting your filters or add a new room.
                </div>
              )}
            </div>
            
            {filteredRooms.length > 0 && (
              <Pagination 
                totalItems={filteredRooms.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map(room => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.number}</TableCell>
                      <TableCell>{getRoomTypeLabel(room.type)}</TableCell>
                      <TableCell>{formatCurrency(room.price)}</TableCell>
                      <TableCell>{room.capacity} {room.capacity === 1 ? 'Person' : 'People'}</TableCell>
                      <TableCell>
                        {room.status === 'available' && 
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">available</Badge>
                        }
                        {room.status === 'occupied' && 
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">occupied</Badge>
                        }
                        {room.status === 'reserved' && 
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">reserved</Badge>
                        }
                        {room.status === 'maintenance' && 
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">maintenance</Badge>
                        }
                        {!['available', 'occupied', 'reserved', 'maintenance'].includes(room.status) && 
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{room.status}</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRoom(room)}
                          >
                            <PencilLine className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredRooms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No rooms found. Try adjusting your filters or add a new room.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {filteredRooms.length > 0 && (
              <Pagination 
                totalItems={filteredRooms.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        );
      })()}
    </div>
  );
}

export default Rooms;