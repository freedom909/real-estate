"use client";

import React, { useState, useEffect } from 'react';

const HostManagement = () => {
  const [pendingHosts, setPendingHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // GraphQL mutation for accepting hosts
  const ACCEPT_HOST_MUTATION = `
    mutation AcceptHost($userId: ID!) {
      acceptHost(userId: $userId) {
        success
        message
        user {
          id
          email
          role
          status
        }
      }
    }
  `;

  // GraphQL query for fetching pending hosts
  const GET_PENDING_HOSTS_QUERY = `
    query GetPendingHosts {
      users(role: PENDING_HOST, status: PENDING_HOST_REGISTRATION) {
        id
        email
        name
        role
        status
        createdAt
        myNumberCardFront
        myNumberCardBack
        hostApplicationDate
      }
    }
  `;

  const fetchPendingHosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_PENDING_HOSTS_QUERY,
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('Error fetching pending hosts:', result.errors);
        setMessage('Failed to fetch pending hosts');
        return;
      }

      setPendingHosts(result.data?.users || []);
    } catch (error) {
      console.error('Error fetching pending hosts:', error);
      setMessage('Failed to fetch pending hosts');
    } finally {
      setLoading(false);
    }
  };

  const acceptHost = async (userId) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: ACCEPT_HOST_MUTATION,
          variables: { userId },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('Error accepting host:', result.errors);
        setMessage('Failed to accept host: ' + result.errors[0].message);
        return;
      }

      if (result.data?.acceptHost?.success) {
        setMessage('Host accepted successfully!');
        // Refresh the list
        fetchPendingHosts();
      } else {
        setMessage('Failed to accept host: ' + result.data?.acceptHost?.message);
      }
    } catch (error) {
      console.error('Error accepting host:', error);
      setMessage('Failed to accept host');
    }
  };

  useEffect(() => {
    fetchPendingHosts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">👥 Host Management</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading pending hosts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">👥 Host Management</h3>
        <button
          onClick={fetchPendingHosts}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {pendingHosts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No pending host applications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingHosts.map((host) => (
            <div key={host.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{host.name || 'Unnamed User'}</h4>
                  <p className="text-gray-600">{host.email}</p>
                  <div className="flex space-x-2 mt-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      {host.role}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {host.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Applied: {new Date(host.createdAt).toLocaleDateString()}
                  </p>
                  
                  {/* My Number Card Preview */}
                  {host.myNumberCardFront && host.myNumberCardBack && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">📇 My Number Card Verification</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Front Side:</p>
                          <img 
                            src={host.myNumberCardFront} 
                            alt="My Number Card Front" 
                            className="w-full h-20 object-cover rounded border"
                            onClick={() => window.open(host.myNumberCardFront, '_blank')}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Back Side:</p>
                          <img 
                            src={host.myNumberCardBack} 
                            alt="My Number Card Back" 
                            className="w-full h-20 object-cover rounded border"
                            onClick={() => window.open(host.myNumberCardBack, '_blank')}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Click on images to view full size
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => acceptHost(host.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => console.log('Reject host:', host.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mock data for demo purposes */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">📊 Host Statistics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Pending Hosts:</span>
            <span className="font-medium ml-2">{pendingHosts.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Hosts:</span>
            <span className="font-medium ml-2">12</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostManagement;