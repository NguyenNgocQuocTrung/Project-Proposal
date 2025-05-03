import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Home,
  BedDouble,
  Calendar,
  Gift,
  Coffee,
  FileText,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
  LogOut
} from 'lucide-react';

// Navigation items for the sidebar
const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Rooms', href: '/rooms', icon: BedDouble },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Services', href: '/services', icon: Coffee },
  { name: 'Feedback', href: '/feedback', icon: MessageSquare },
];

function Sidebar({ open, setOpen }) {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const closeSidebar = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col bg-white border-r border-gray-200 h-full",
          open ? "flex" : "hidden"
        )}
      >
        {/* Header */}
        <div className="py-4 px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">Hotel Management</h1>
          </Link>

          {isMobile && (
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center px-4 py-3 text-base font-medium transition-colors",
                      isActive
                        ? "bg-blue-500 text-white rounded-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                    )}
                  >
                    <Icon className="mr-4 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile */}
        <div className="mt-auto border-t border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
                <User className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;