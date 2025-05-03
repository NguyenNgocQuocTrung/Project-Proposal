import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addFeedback, updateFeedbackStatus } from '../store/slices/feedbackSlice';
import { useToast } from '@/hooks/use-toast';

function FeedbackModal({ isOpen, onClose, feedback = null, type = 'view' }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const isAdmin = true; // In a real app, you'd get this from auth state
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      guestName: '',
      email: '',
      phone: '',
      type: 'general',
      message: '',
      status: 'new'
    }
  });
  
  useEffect(() => {
    if (feedback && (type === 'view' || type === 'respond')) {
      setValue('guestName', feedback.guestName);
      setValue('email', feedback.email);
      setValue('phone', feedback.phone || '');
      setValue('type', feedback.type);
      setValue('message', feedback.message);
      setValue('status', feedback.status);
    } else if (type === 'create') {
      reset();
    }
  }, [feedback, type, setValue, reset]);
  
  const onSubmit = (data) => {
    try {
      if (type === 'create') {
        dispatch(addFeedback({
          ...data,
          status: 'new',
          dateSubmitted: new Date().toISOString().split('T')[0]
        }));
        toast({
          title: "Feedback submitted",
          description: "Thank you for your feedback."
        });
      } else if (type === 'respond' && feedback) {
        dispatch(updateFeedbackStatus({
          id: feedback.id,
          status: data.status
        }));
        toast({
          title: "Status updated",
          description: "The feedback status has been updated."
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
          <DialogTitle>
            {type === 'create' ? 'Submit Feedback' : 
             type === 'respond' ? 'Respond to Feedback' : 'View Feedback'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Guest Name</Label>
                <Input
                  id="guestName"
                  {...register('guestName', { required: "Guest name is required" })}
                  readOnly={type !== 'create'}
                  disabled={type !== 'create'}
                  className={type !== 'create' ? "bg-[hsl(var(--neutral-50))]" : ""}
                />
                {errors.guestName && <p className="text-xs text-red-500">{errors.guestName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  readOnly={type !== 'create'}
                  disabled={type !== 'create'}
                  className={type !== 'create' ? "bg-[hsl(var(--neutral-50))]" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  readOnly={type !== 'create'}
                  disabled={type !== 'create'}
                  className={type !== 'create' ? "bg-[hsl(var(--neutral-50))]" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Feedback Type</Label>
                <Select 
                  onValueChange={(value) => setValue('type', value)}
                  defaultValue={feedback?.type || "general"}
                  disabled={type !== 'create'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="praise">Praise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                {...register('message', { required: "Message is required" })}
                placeholder="Your feedback..."
                rows={5}
                readOnly={type !== 'create'}
                disabled={type !== 'create'}
                className={type !== 'create' ? "bg-[hsl(var(--neutral-50))]" : ""}
              />
              {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
            </div>
            
            {(type === 'respond' || type === 'view') && isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  onValueChange={(value) => setValue('status', value)}
                  defaultValue={feedback?.status || "new"}
                  disabled={type === 'view'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {(type === 'create' || type === 'respond') && (
              <Button type="submit">
                {type === 'create' ? 'Submit Feedback' : 'Update Status'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default FeedbackModal;
