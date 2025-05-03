import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { mockServices } from '@/lib/mockData';
import { formatCurrency, getServiceCategoryLabel } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  CheckCircle, 
  ChefHat, 
  Sparkles,
  Car,
  Coffee,
  DollarSign,
  Users,
  BellRing
} from 'lucide-react';

// Service Card Component
function ServiceCard({ service, onEdit, onDelete }) {
  // Get icon based on service category
  const getServiceIcon = (category) => {
    switch (category) {
      case 'food':
        return <ChefHat className="h-5 w-5 text-orange-500" />;
      case 'cleaning':
        return <Sparkles className="h-5 w-5 text-blue-500" />;
      case 'transport':
        return <Car className="h-5 w-5 text-green-500" />;
      case 'amenities':
        return <Coffee className="h-5 w-5 text-amber-500" />;
      case 'spa':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'business':
        return <DollarSign className="h-5 w-5 text-gray-500" />;
      default:
        return <BellRing className="h-5 w-5 text-red-500" />;
    }
  };

  // Get border color based on service category
  const getBorderColor = (category) => {
    switch (category) {
      case 'food':
        return 'border-l-orange-500';
      case 'cleaning':
        return 'border-l-blue-500';
      case 'transport':
        return 'border-l-green-500';
      case 'amenities':
        return 'border-l-amber-500';
      case 'spa':
        return 'border-l-purple-500';
      case 'business':
        return 'border-l-gray-500';
      default:
        return 'border-l-red-500';
    }
  };

  return (
    <div className={`bg-white rounded-md shadow-sm border border-gray-100 border-l-4 ${getBorderColor(service.category)} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="mr-3">
              {getServiceIcon(service.category)}
            </div>
            <div>
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-sm text-gray-500">{getServiceCategoryLabel(service.category)}</p>
            </div>
          </div>
          <div>
            <Badge variant="outline" className="font-medium bg-blue-50 text-blue-700 border-blue-200">
              {formatCurrency(service.price)}
            </Badge>
          </div>
        </div>
        
        <p className="mt-3 text-sm text-gray-600">{service.description}</p>
        
        <div className="mt-4 flex justify-between items-center">
          {service.isAvailable ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Available
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              Not Available
            </Badge>
          )}
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(service)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(service.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Form Component
function ServiceForm({ service, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: service?.id || '',
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    category: service?.category || 'food',
    isAvailable: service?.isAvailable ?? true
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Service name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.price <= 0) {
      toast({
        title: 'Error',
        description: 'Price must be greater than zero',
        variant: 'destructive',
      });
      return;
    }
    
    // Save the service
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      id: formData.id || Date.now().toString()
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter service name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="cleaning">Housekeeping</SelectItem>
              <SelectItem value="transport">Transportation</SelectItem>
              <SelectItem value="amenities">Guest Amenities</SelectItem>
              <SelectItem value="spa">Spa & Wellness</SelectItem>
              <SelectItem value="business">Business Services</SelectItem>
              <SelectItem value="other">Other Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description of the service"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="pl-7"
            />
          </div>
        </div>
        
        <div className="flex items-center pt-8">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isAvailable" className="font-normal">Available for booking</Label>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {service ? 'Update Service' : 'Add Service'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Main Services Component
export default function Services() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Load services from localStorage on component mount
  useEffect(() => {
    const loadServices = () => {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const savedServices = localStorage.getItem('hotelServices');
        const loadedServices = savedServices ? JSON.parse(savedServices) : mockServices;
        
        if (!savedServices) {
          // Save mock services to localStorage on first run
          localStorage.setItem('hotelServices', JSON.stringify(mockServices));
        }
        
        setServices(loadedServices);
        setLoading(false);
      }, 500);
    };
    
    loadServices();
  }, []);
  
  // Filter services based on search, category, and tab
  useEffect(() => {
    let filtered = [...services];
    
    // Filter by tab (availability)
    if (activeTab === 'available') {
      filtered = filtered.filter(service => service.isAvailable);
    } else if (activeTab === 'unavailable') {
      filtered = filtered.filter(service => !service.isAvailable);
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredServices(filtered);
  }, [services, searchQuery, selectedCategory, activeTab]);
  
  // Save services to localStorage
  const saveServicesToStorage = (updatedServices) => {
    localStorage.setItem('hotelServices', JSON.stringify(updatedServices));
  };
  
  // Handle adding or updating a service
  const handleSaveService = (serviceData) => {
    let updatedServices;
    
    if (editingService) {
      // Update existing service
      updatedServices = services.map(service => 
        service.id === editingService.id ? serviceData : service
      );
      toast({
        title: 'Service Updated',
        description: `${serviceData.name} has been updated successfully.`,
      });
    } else {
      // Add new service
      updatedServices = [...services, serviceData];
      toast({
        title: 'Service Added',
        description: `${serviceData.name} has been added to the service list.`,
      });
    }
    
    setServices(updatedServices);
    saveServicesToStorage(updatedServices);
    setIsFormOpen(false);
    setEditingService(null);
  };
  
  // Handle editing a service
  const handleEditService = (service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };
  
  // Handle deleting a service
  const handleDeleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      const updatedServices = services.filter(service => service.id !== serviceId);
      setServices(updatedServices);
      saveServicesToStorage(updatedServices);
      toast({
        title: 'Service Deleted',
        description: 'The service has been deleted successfully.',
      });
    }
  };
  
  // Handle adding a new service
  const handleAddService = () => {
    setEditingService(null);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 px-2 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage hotel services and amenities
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="py-1 px-3 rounded-full border border-blue-200 bg-blue-50 flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-blue-700">Total: {services.length}</span>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddService} className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                <DialogDescription>
                  {editingService 
                    ? 'Update the service details below'
                    : 'Fill in the details to add a new service'}
                </DialogDescription>
              </DialogHeader>
              <ServiceForm 
                service={editingService} 
                onSave={handleSaveService}
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
              <h2 className="text-lg font-medium">Service Catalog</h2>
              <div className="text-sm text-gray-500">
                {filteredServices.length} of {services.length} services
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search services..."
                  className="pl-8 border-gray-200 focus-visible:ring-blue-500 rounded-md text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48 border-gray-200 rounded-md text-sm">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="cleaning">Housekeeping</SelectItem>
                  <SelectItem value="transport">Transportation</SelectItem>
                  <SelectItem value="amenities">Guest Amenities</SelectItem>
                  <SelectItem value="spa">Spa & Wellness</SelectItem>
                  <SelectItem value="business">Business Services</SelectItem>
                  <SelectItem value="other">Other Services</SelectItem>
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
                All Services
              </TabsTrigger>
              <TabsTrigger value="available" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
                Available
              </TabsTrigger>
              <TabsTrigger value="unavailable" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
                Unavailable
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="p-4">
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <div className="mb-3">No services found</div>
                <p className="text-sm text-gray-400">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Add a new service to get started'}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="p-4">
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <div className="mb-3">No available services found</div>
                <p className="text-sm text-gray-400">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Mark services as available or add new services'}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unavailable" className="p-4">
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <div className="mb-3">No unavailable services found</div>
                <p className="text-sm text-gray-400">All services are currently marked as available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}