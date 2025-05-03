import { useState } from 'react';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

function Layout({ children }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div 
        className="flex flex-col flex-1 overflow-auto ml-64"
        style={{ minHeight: '100vh' }}
      >
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
        <footer className="border-t py-3 px-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Hotel Management System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Layout;