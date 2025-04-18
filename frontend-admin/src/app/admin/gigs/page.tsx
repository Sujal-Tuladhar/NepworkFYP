'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Gig {
  _id: string;
  title: string;
  price: number;
  status: string;
  createdAt: string;
  userId: {
    username: string;
    email: string;
  };
}

interface GigsResponse {
  gigs: Gig[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export default function Gigs() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchGigs = async (page: number = 1, searchQuery: string = '') => {
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      if (!adminUserStr) {
        router.push('/login');
        return;
      }

      const adminUser = JSON.parse(adminUserStr);
      if (!adminUser.accessToken) {
        router.push('/login');
        return;
      }

      const res = await axios.get(
        `http://localhost:7700/api/admin/gigs?page=${page}&search=${searchQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${adminUser.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data: GigsResponse = res.data;
      setGigs(data.gigs);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.error('Error fetching gigs:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('adminUser');
        router.push('/login');
      } else {
        setError('Failed to load gigs');
      }
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchGigs(1, e.target.value);
  };

  const handleUpdateStatus = async (gigId: string, status: string) => {
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      if (!adminUserStr) {
        router.push('/login');
        return;
      }

      const adminUser = JSON.parse(adminUserStr);
      if (!adminUser.accessToken) {
        router.push('/login');
        return;
      }

      await axios.put(
        `http://localhost:7700/api/admin/gigs/${gigId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${adminUser.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchGigs(currentPage, search);
    } catch (err) {
      console.error('Error updating gig status:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('adminUser');
        router.push('/login');
      } else {
        setError('Failed to update gig status');
      }
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gigs Management</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search gigs..."
            value={search}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {gigs.map((gig) => (
            <li key={gig._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-indigo-600">
                      {gig.title}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        gig.status === 'approved' ? 'bg-green-100 text-green-800' :
                        gig.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {gig.status}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(gig._id, 'approved')}
                      className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 hover:bg-green-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(gig._id, 'rejected')}
                      className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <div className="flex items-center text-sm text-gray-500">
                      {gig.userId.username} ({gig.userId.email})
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <span>
                      ${gig.price} • {new Date(gig.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchGigs(page, search)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === page
                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
} 