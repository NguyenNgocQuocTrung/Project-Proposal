import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { mockBookings, mockRooms, mockServices } from '@/lib/mockData';
import { formatCurrency, formatDate, calculateNights, getRoomTypeLabel } from '@/lib/utils';
import { Search, Eye, FileText, ArrowDown, ArrowUp, Calendar, Clock } from 'lucide-react';

function InvoiceRow({ invoice, onViewDetails }) {
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-amber-100 text-amber-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{invoice.id}</div>
        <div className="text-sm text-gray-500">{formatDate(invoice.date)}</div>
      </TableCell>
      <TableCell>
        <div>{invoice.guestName}</div>
        <div className="text-sm text-gray-500">Room {invoice.roomNumber}</div>
      </TableCell>
      <TableCell>
        {formatDate(invoice.checkInDate)} to {formatDate(invoice.checkOutDate)}
        <div className="text-sm text-gray-500">
          {calculateNights(invoice.checkInDate, invoice.checkOutDate)} nights
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="font-medium">{formatCurrency(invoice.total)}</div>
        <Badge variant="outline" className={`${getStatusColor(invoice.status)} mt-1 font-medium border-0`}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(invoice)}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

function InvoiceDetails({ invoice, onClose }) {
  const handlePrintInvoice = () => {
    // In a real app, this would generate a PDF or open a print view
    window.print();
  };

  if (!invoice) return null;

  // Find the booking associated with this invoice
  const savedBookings = localStorage.getItem('hotelBookings');
  const bookings = savedBookings ? JSON.parse(savedBookings) : mockBookings;
  const booking = bookings.find(b => b.id === invoice.bookingId);
  
  // Find service items
  const savedServices = localStorage.getItem('hotelServices');
  const services = savedServices ? JSON.parse(savedServices) : mockServices;
  
  // Calculate services total
  const servicesTotal = invoice.items.reduce((total, item) => total + item.amount, 0);

  return (
    <DialogContent className="sm:max-w-[800px]">
      <DialogHeader>
        <DialogTitle className="flex justify-between items-center">
          <span>Invoice #{invoice.id}</span>
          <Badge variant="outline" className={`font-medium ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-800 border-0' : 
            invoice.status === 'unpaid' ? 'bg-amber-100 text-amber-800 border-0' : 
            'bg-red-100 text-red-800 border-0'
          }`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Created on {formatDate(invoice.date)}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Bill To</h4>
          <div className="font-medium">{invoice.guestName}</div>
          {booking && <div className="text-sm text-gray-600">Phone: {booking.phoneNumber}</div>}
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Room Details</h4>
          <div>Room {invoice.roomNumber} ({getRoomTypeLabel(invoice.roomType)})</div>
          <div className="text-sm text-gray-600">
            {formatDate(invoice.checkInDate)} to {formatDate(invoice.checkOutDate)}
          </div>
          <div className="text-sm text-gray-600">
            {calculateNights(invoice.checkInDate, invoice.checkOutDate)} nights
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Description</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Room Charge ({getRoomTypeLabel(invoice.roomType)})</TableCell>
            <TableCell className="text-right">{calculateNights(invoice.checkInDate, invoice.checkOutDate)} nights</TableCell>
            <TableCell className="text-right">{formatCurrency(invoice.roomRate)}</TableCell>
            <TableCell className="text-right">{formatCurrency(invoice.roomTotal)}</TableCell>
          </TableRow>
          
          {invoice.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.description}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
            </TableRow>
          ))}
          
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
            <TableCell className="text-right font-bold">{formatCurrency(invoice.total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handlePrintInvoice}>
          <FileText className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Load invoices from local storage
  useEffect(() => {
    const loadInvoices = () => {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const savedInvoices = localStorage.getItem('hotelInvoices');
        const loadedInvoices = savedInvoices ? JSON.parse(savedInvoices) : [];
        
        setInvoices(loadedInvoices);
        setLoading(false);
      }, 500);
    };
    
    loadInvoices();
  }, []);
  
  // Filter and sort invoices
  useEffect(() => {
    let result = [...invoices];
    
    // Filter by status
    if (selectedStatus !== 'all') {
      result = result.filter(invoice => invoice.status === selectedStatus);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(invoice => 
        invoice.id.toLowerCase().includes(query) ||
        invoice.guestName.toLowerCase().includes(query) ||
        invoice.roomNumber.toLowerCase().includes(query)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'dueDate':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'guestName':
          comparison = a.guestName.localeCompare(b.guestName);
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredInvoices(result);
  }, [invoices, searchQuery, sortField, sortDirection, selectedStatus]);
  
  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsDialog(true);
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1 text-sm">
            View and manage guest payment records
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex flex-col md:flex-row gap-2">
            <div className={`py-1 px-3 rounded-full border flex items-center space-x-2 
              ${selectedStatus === 'paid' ? 'border-green-200 bg-green-50' : 
                selectedStatus === 'unpaid' ? 'border-amber-200 bg-amber-50' : 
                selectedStatus === 'overdue' ? 'border-red-200 bg-red-50' : 
                'border-gray-200 bg-gray-50'}`}>
              <div className={`h-2 w-2 rounded-full 
                ${selectedStatus === 'paid' ? 'bg-green-500' : 
                  selectedStatus === 'unpaid' ? 'bg-amber-500' : 
                  selectedStatus === 'overdue' ? 'bg-red-500' : 
                  'bg-gray-500'}`}></div>
              <span className={`text-sm font-medium 
                ${selectedStatus === 'paid' ? 'text-green-700' : 
                  selectedStatus === 'unpaid' ? 'text-amber-700' : 
                  selectedStatus === 'overdue' ? 'text-red-700' : 
                  'text-gray-700'}`}>
                {selectedStatus === 'all' ? 'All Invoices' : 
                 `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}: ${
                   invoices.filter(i => i.status === selectedStatus).length
                 }`}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Invoice History</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8 border-gray-200 focus-visible:ring-blue-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-full sm:w-40 border-gray-200 text-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Invoice / Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? 
                      <ArrowUp className="ml-1 h-4 w-4" /> : 
                      <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('guestName')}
                >
                  <div className="flex items-center">
                    Guest / Room
                    {sortField === 'guestName' && (
                      sortDirection === 'asc' ? 
                      <ArrowUp className="ml-1 h-4 w-4" /> : 
                      <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Stay Period</TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center justify-end">
                    Total / Status
                    {sortField === 'total' && (
                      sortDirection === 'asc' ? 
                      <ArrowUp className="ml-1 h-4 w-4" /> : 
                      <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(invoice => (
                  <InvoiceRow 
                    key={invoice.id} 
                    invoice={invoice} 
                    onViewDetails={handleViewDetails} 
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText className="h-10 w-10 mb-2 text-gray-300" />
                      <p className="text-lg font-medium">No invoices found</p>
                      <p className="text-sm">
                        {searchQuery || selectedStatus !== 'all' 
                          ? 'Try changing your search or filter criteria'
                          : 'Checkout guests to generate invoices'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Invoice Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <InvoiceDetails 
          invoice={selectedInvoice} 
          onClose={() => setShowDetailsDialog(false)} 
        />
      </Dialog>
    </div>
  );
}