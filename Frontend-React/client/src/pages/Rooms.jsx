import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { Bed, Grid, Hotel, List, PencilLine, Plus, Trash, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '@/store/slices/roomsSlice';

// Room form component
function RoomForm({ room, onSave, onCancel }) {
  const [isEditForm, setIsEditForm] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    roomNo: '',
    type: 'A',
    price: '10',
    maxNum: 1,
    status: 'AVAILABLE',
    description: '',
  });
  const [error, setError] = useState('');

  // Set form data when editing an existing room
  useEffect(() => {
    if (room) {
      setIsEditForm(true)
      setFormData({
        id: room.id,
        roomNo: room.roomNo,
        type: room.type,
        price: room.price,
        maxNum: room.maxNum,
        status: room.status,
        description: room.description,
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSelectChange = (name, value) => {
    if (name === 'type') {
      // Set price based on type
      const priceMap = {
        'A': '10',
        'B': '20',
        'C': '30'
      };
      setFormData(prev => ({
        ...prev,
        [name]: value,
        price: priceMap[value]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.roomNo || !String(formData.roomNo).trim()) {
      setError('Room number is required.');
      return;
    }

    // Format the data for submission
    const roomData = {
      id: formData.id,
      roomNo: formData.roomNo,
      type: formData.type,
      price: parseFloat(formData.price),
      maxNum: parseInt(formData.maxNum, 10),
      status: formData.status,
    };

    onSave(roomData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="roomNo">Room Number</Label>
          <Input
            id="roomNo"
            name="roomNo"
            value={formData.roomNo}
            onChange={handleChange}
            placeholder="101"
            required
            disabled={isEditForm}
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
              <SelectItem value="A">Type A (150.000)</SelectItem>
              <SelectItem value="B">Type B (170.000)</SelectItem>
              <SelectItem value="C">Type C (200.000)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price per Night</Label>
          <Input
            id="price"
            name="price"
            value={formData.price}
            disabled
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxNum">Capacity</Label>
          <Select
            value={formData.maxNum.toString()}
            onValueChange={(value) => handleSelectChange('maxNum', parseInt(value))}
          >
            <SelectTrigger id="maxNum">
              <SelectValue placeholder="Select capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Person</SelectItem>
              <SelectItem value="2">2 People</SelectItem>
              <SelectItem value="3">3 People</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
            <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
            <SelectItem value="BOOKED">BOOKED</SelectItem>
            <SelectItem value="OCCUPIED">OCCUPIED</SelectItem>
            <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
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

function RoomCard({ room, onEdit, onDelete }) {
  const getStatusBadge = () => {
    switch (room.status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      case 'BOOKED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Booked</Badge>;
      case 'OCCUPIED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Occupied</Badge>;
      case 'MAINTENANCE':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Maintenance</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{room.status}</Badge>;
    }
  };

  // const getAmenityIcon = (amenity) => {
  //   if (amenity.toLowerCase().includes('wi-fi')) return 'Wi-Fi';
  //   if (amenity.toLowerCase().includes('tv')) return 'TV';
  //   if (amenity.toLowerCase().includes('air')) return 'AC';
  //   return null;
  // };


  return (
    <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Room {room.roomNo}</CardTitle>
            <CardDescription className="text-base mt-1">Type:{getRoomTypeLabel(room.type)}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Floor: {room.roomNo ? String(room.roomNo)[0] : 'N/A'}</p>
          <p className="text-sm font-medium">Capacity: {room.maxNum} person(s)</p>
        </div>
        <div>
          <p className="text-lg font-bold text-blue-500">
            {room.price?.toLocaleString('vi-VN')} VND/night
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
            Wi-Fi
          </span>
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
            TV
          </span>
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
            AC
          </span>
        </div>
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
  const dispatch = useDispatch();
  const { rooms = [], loading, error } = useSelector((state) => state.rooms);
  const [view, setView] = useState('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error]);

  const handleSaveRoom = async (roomData) => {
    try {
      if (selectedRoom) {
        // Update existing room
        await dispatch(updateRoom({ id: selectedRoom.id, roomData })).unwrap();
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Success</span>
            </div>
          ),
          description: 'Room updated successfully',
        });
      } else {
        // Create new room
        await dispatch(createRoom(roomData)).unwrap();
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Success</span>
            </div>
          ),
          description: 'Room created successfully',
        });
      }
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Error</span>
          </div>
        ),
        description: error || 'Failed to save room',
        variant: 'destructive',
      });
    }
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setIsEditDialogOpen(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await dispatch(deleteRoom(roomId)).unwrap();
        toast({
          title: 'Success',
          description: 'Room deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error || 'Failed to delete room',
          variant: 'destructive',
        });
      }
    }
  };

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setIsAddDialogOpen(true);
  };

  const filteredRooms = (rooms || []).filter(room => {
    if (!room) return false;

    const roomNumber = room.roomNo?.toString() || '';
    const roomStatus = room.status?.toString() || '';

    const matchesSearch =
      roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roomStatus.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || roomType === filterType;
    const matchesStatus = filterStatus === 'all' || roomStatus === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Rooms Management</h1>
        <Button onClick={handleAddRoom} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="w-full">
          <Input
            type="search"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="A">Type A</SelectItem>
              <SelectItem value="B">Type B</SelectItem>
              <SelectItem value="C">Type C</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="BOOKED">Booked</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 ml-auto">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              onClick={() => setView('grid')}
              size="icon"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              onClick={() => setView('list')}
              size="icon"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentItems.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={() => handleEditRoom(room)}
              onDelete={() => handleDeleteRoom(room.id)}
            />
          ))}

          {filteredRooms.length === 0 && (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              No rooms found. Try adjusting your filters or add a new room.
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
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
                {currentItems.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.roomNo}</TableCell>
                    <TableCell>{getRoomTypeLabel(room.type)}</TableCell>
                    <TableCell>{room.price?.toLocaleString('vi-VN')} VND</TableCell>
                    <TableCell>{room.maxNum} {room.maxNum === 1 ? 'Person' : 'People'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          room.status === 'AVAILABLE'
                            ? 'success'
                            : room.status === 'OCCUPIED'
                              ? 'destructive'
                              : room.status === 'BOOKED'
                                ? 'warning'
                                : 'default'
                        }
                      >
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRoom(room)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash className="h-4 w-4" />
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
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new room to the hotel.
            </DialogDescription>
          </DialogHeader>
          <RoomForm
            onSave={handleSaveRoom}
            onCancel={() => {
              setIsAddDialogOpen(false);
              setSelectedRoom(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update the room details.
            </DialogDescription>
          </DialogHeader>
          <RoomForm
            room={selectedRoom}
            onSave={handleSaveRoom}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedRoom(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Rooms;