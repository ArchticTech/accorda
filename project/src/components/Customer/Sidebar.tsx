import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, User, X } from 'lucide-react';

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  // Navigation items with icons - now using actual routes instead of hash links
  const navItems = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: 'My Loan Requests', path: '/customer/loan-requests', icon: <FileText className="w-5 h-5 mr-3" /> },
    { name: 'New Loan', path: '/customer/new-loan', icon: <PlusCircle className="w-5 h-5 mr-3" /> },
    { name: 'Profile', path: '/customer/profile', icon: <User className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="bg-white shadow-md w-full h-full flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-600">Customer Portal</h2>
        {closeSidebar && (
          <button 
            onClick={closeSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <nav className="mt-2 flex-grow">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) => 
                  `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : ''
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="w-full p-4 border-t border-gray-200 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-700">Customer Account</p>
            <p className="text-gray-500 truncate">Manage your account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;