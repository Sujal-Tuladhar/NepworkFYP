'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface Escrow {
  _id: string;
  orderId: {
    _id: string;
    price: number;
    title: string;
    sellerId: {
      username: string;
      email: string;
    };
    buyerId: {
      username: string;
      email: string;
    };
  };
  status: string;
  createdAt: string;
}

interface Payout {
  _id: string;
  orderId: {
    _id: string;
    price: number;
  };
  sellerId: {
    username: string;
    email: string;
  };
  buyerId: {
    username: string;
    email: string;
  };
  amount: number;
  status: string;
  releasedBy: {
    username: string;
    email: string;
  };
  releaseDate: string;
}

export default function Payouts() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const [escrowsRes, payoutsRes] = await Promise.all([
        axios.get('http://localhost:7700/api/escrow/waiting-for-release', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }),
        axios.get('http://localhost:7700/api/escrow/payouts', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      setEscrows(escrowsRes.data);
      setPayouts(payoutsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        Cookies.remove('accessToken');
        localStorage.removeItem('adminUser');
        router.push('/login');
      } else {
        setError('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleReleaseEscrow = async (escrowId: string) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      await axios.post(
        `http://localhost:7700/api/escrow/release/${escrowId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      fetchData();
    } catch (err) {
      console.error('Error releasing escrow:', err);
      setError('Failed to release escrow');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Pending Releases
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Payout History
          </button>
        </div>
      </div>

      {error && (
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
      )}

      {activeTab === 'pending' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {escrows.map((escrow) => (
              <li key={escrow._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-indigo-600 truncate">
                      Order #{escrow.orderId._id.slice(-6)}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Amount: ${escrow.orderId.price}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleReleaseEscrow(escrow._id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Release Escrow
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Seller: {escrow.orderId.sellerId.username} ({escrow.orderId.sellerId.email})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Buyer: {escrow.orderId.buyerId.username} ({escrow.orderId.buyerId.email})</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {payouts.map((payout) => (
              <li key={payout._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-indigo-600 truncate">
                      Payout #{payout._id.slice(-6)}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Amount: ${payout.amount}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payout.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Seller: {payout.sellerId.username} ({payout.sellerId.email})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Buyer: {payout.buyerId.username} ({payout.buyerId.email})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Released by: {payout.releasedBy.username} on {new Date(payout.releaseDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 