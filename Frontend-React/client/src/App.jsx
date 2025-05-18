import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Layout from '@/components/Layout';

// Pages
import Dashboard from '@/pages/Dashboard';
import Rooms from '@/pages/Rooms';
import Bookings from '@/pages/Bookings';
import Services from '@/pages/Services';
import Invoices from '@/pages/Invoices';
import CreateInvoice from '@/pages/CreateInvoice';
import Feedback from '@/pages/Feedback';
import NotFound from '@/pages/not-found';
import Login from '@/pages/Login';
import BookingDetail from '@/pages/BookingDetail';
function App() {
  return (
    <TooltipProvider>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route path="/rooms" component={Rooms} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/bookings/:id" component={BookingDetail} />
          <Route path="/services" component={Services} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/invoices/create/:bookingId" component={CreateInvoice} />
          <Route path="/feedback" component={Feedback} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;