import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  MusicalNoteIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/') 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Dashboard
            </Link>

            <Link
              to="/music-happiness"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/music-happiness')
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <MusicalNoteIcon className="h-5 w-5 mr-2" />
              Music & Happiness
            </Link>

            <Link
              to="/mhq-analysis"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/mhq-analysis')
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              MHQ Analysis
            </Link>

            <Link
              to="/demographics"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/demographics')
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Demographics
            </Link>

            <Link
              to="/explore"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/explore')
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              Explore
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;