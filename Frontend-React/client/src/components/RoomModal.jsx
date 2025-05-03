import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addRoom, updateRoom } from '../store/slices/roomsSlice';
import { useToast } from '@/hooks/use-toast';

function RoomModal({ isOpen, onClose, room = null }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const isEditing = !!room;
  
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      number: '',
      type: '',
      price: '',
      capacity: '',
      status: 'available',
      amenities: ''
    }
  });
  
  useEffect(() => {
    if (room) {
      setValue('number', room.number);
      setValue('type', room.type);
      setValue('price', room.price);
      setValue('capacity', room.capacity);
      setValue('status', room.status);
      setValue('amenities', room.amenities || '');
    } else {
      reset();
    }
  }, [room, setValue, reset]);
  
  const onSubmit = (data) => {
    try {
      const roomData = {
        ...data,
        price: parseFloat(data.price),
        capacity: parseInt(data.capacity)
      };
      
      if (isEditing) {
        dispatch(updateRoom({
          ...roomData,
          id: room.id
        }));
        toast({
          title: "Room updated",
          description: "The room has been updated successfully."
        });
      } else {
        dispatch(addRoom(roomData));
        toast({
          title: "Room added",
          description: "The room has been added successfully."
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
          <DialogTitle>{isEditing ? 'Edit Room' : 'Add Room'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Room Number</Label>
                <Input
                  id="number"
                  {...register('number', { required: "Room number is required" })}
                />
                {errors.number && <p className="text-xs text-red-500">{errors.number.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Room Type</Label>
                <Select 
                  onValueChange={(value) => setValue('type', value)}
                  defaultValue={room?.type || ""}
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
                {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per Night ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('price', { 
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" }
                  })}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  {...register('capacity', { 
                    required: "Capacity is required",
                    min: { value: 1, message: "Capacity must be at least 1" }
                  })}
                />
                {errors.capacity && <p className="text-xs text-red-500">{errors.capacity.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                onValueChange={(value) => setValue('status', value)}
                defaultValue={room?.status || "available"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities</Label>
              <Textarea
                id="amenities"
                {...register('amenities')}
                placeholder="List amenities separated by commas (e.g., TV, WiFi, Mini-bar)..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Room' : 'Add Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RoomModal;
