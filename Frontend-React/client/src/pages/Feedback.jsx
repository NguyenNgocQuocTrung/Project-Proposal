import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, PlusCircle, MoreHorizontal, MessageSquare, 
  CheckCircle, AlertCircle, Loader2, Eye, ThumbsUp
} from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import { deleteFeedback } from '../store/slices/feedbackSlice';
import { useToast } from '@/hooks/use-toast';

function Feedback() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const feedbacks = useSelector(state => state.feedback.feedbacks);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'view', 'respond'
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const searchLower = searchQuery.toLowerCase();
    return (
      feedback.guestName.toLowerCase().includes(searchLower) ||
      feedback.type.toLowerCase().includes(searchLower) ||
      feedback.email.toLowerCase().includes(searchLower) ||
      feedback.message.toLowerCase().includes(searchLower)
    );
  });
  
  const handleCreateFeedback = () => {
    setSelectedFeedback(null);
    setModalType('create');
    setModalOpen(true);
  };
  
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setModalType('view');
    setModalOpen(true);
  };
  
  const handleRespondFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setModalType('respond');
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  const handleDeleteFeedback = (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      dispatch(deleteFeedback(feedbackId));
      toast({
        title: "Feedback deleted",
        description: "The feedback has been deleted successfully."
      });
    }
  };
  
  const getStatusBadge = (status) => {
    if (status === 'new') {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="outline">
          <AlertCircle className="h-3 w-3 mr-1" />
          New
        </Badge>
      );
    }
    if (status === 'in-progress') {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="outline">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="outline">
        <CheckCircle className="h-3 w-3 mr-1" />
        Resolved
      </Badge>
    );
  };
  
  const getTypeBadge = (type) => {
    if (type === 'complaint') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="outline">Complaint</Badge>;
    }
    if (type === 'suggestion') {
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100" variant="outline">Suggestion</Badge>;
    }
    if (type === 'praise') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="outline">Praise</Badge>;
    }
    return <Badge className="bg-[hsl(var(--neutral-100))] text-[hsl(var(--neutral-800))] hover:bg-[hsl(var(--neutral-100))]" variant="outline">General</Badge>;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--neutral-800))]">Feedback & Complaints</h1>
        <Button onClick={handleCreateFeedback}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Submit Feedback
        </Button>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4 border-b border-[hsl(var(--neutral-200))]">
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
            <CardTitle className="text-base font-semibold">Feedback Management</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--neutral-400))]" />
              <Input 
                placeholder="Search feedback..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[hsl(var(--neutral-50))]">
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{feedback.guestName}</span>
                        <span className="text-xs text-[hsl(var(--neutral-500))]">{feedback.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(feedback.type)}</TableCell>
                    <TableCell>{feedback.dateSubmitted}</TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {feedback.message}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewFeedback(feedback)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRespondFeedback(feedback)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Respond
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredFeedbacks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-[hsl(var(--neutral-500))]">
                      {searchQuery ? 'No feedback matching your search' : 'No feedback available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <FeedbackModal 
        isOpen={modalOpen}
        onClose={handleCloseModal}
        feedback={selectedFeedback}
        type={modalType}
      />
    </div>
  );
}

export default Feedback;
