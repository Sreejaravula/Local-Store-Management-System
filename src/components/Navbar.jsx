import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, ReceiptIndianRupee, Tags } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 ${
                isActive('/') ? 'text-blue-500' : 'text-gray-700 hover:text-blue-500'
              }`}
            >
              <Store size={24} />
              <span className="font-medium">Items</span>
            </Link>

            <Link
              to="/bills"
              className={`flex items-center space-x-2 ${
                isActive('/bills') ? 'text-blue-500' : 'text-gray-700 hover:text-blue-500'
              }`}
            >
              <ReceiptIndianRupee size={24} />
              <span className="font-medium">Bills</span>
            </Link>

            <Link
              to="/tags"
              className={`flex items-center space-x-2 ${
                isActive('/tags') ? 'text-blue-500' : 'text-gray-700 hover:text-blue-500'
              }`}
            >
              <Tags size={24} />
              <span className="font-medium">Tags</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar