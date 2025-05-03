import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addService, updateService } from '../store/slices/servicesSlice';
import { useToast } from '@/hooks/use-toast';

function ServiceModal({ isOpen, onClose, service = null }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const isEditing = !!service;
  
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      category: '',
      price: '',
      description: ''
    }
  });
  
  useEffect(() => {
    if (service) {
      setValue('name', service.name);
      setValue('category', service.category);
      setValue('price', service.price);
      setValue('description', service.description || '');
    } else {
      reset();
    }
  }, [service, setValue, reset]);
  
  const onSubmit = (data) => {
    try {
      const serviceData = {
        ...data,
        price: parseFloat(data.price)
      };
      
      if (isEditing) {
        dispatch(updateService({
          ...serviceData,
          id: service.id
        }));
        toast({
          title: "Service updated",
          description: "The service has been updated successfully."
        });
      } else {
        dispatch(addService(serviceData));
        toast({
          title: "Service added",
          description: "The service has been added successfully."
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
          <DialogTitle>{isEditing ? 'Edit Service' : 'Add Service'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                {...register('name', { required: "Service name is required" })}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  onValueChange={(value) => setValue('category', value)}
                  defaultValue={service?.category || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dining">Dining</SelectItem>
                    <SelectItem value="spa">Spa</SelectItem>
                    <SelectItem value="laundry">Laundry</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter service description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Service' : 'Add Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ServiceModal;
