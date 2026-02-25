"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_WALLET, ADD_FUNDS } from "@/graphql/payments";

export default function Wallet() {
  const { data: session } = useSession();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, loading: walletLoading, refetch } = useQuery(GET_WALLET, {
    variables: { userId: session?.user?.id },
    skip: !session?.user?.id
  });

  const [addFunds] = useMutation(ADD_FUNDS);

  const wallet = data?.wallet;

  const handleAddFunds = async (e) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError("You must be logged in to add funds");
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await addFunds({
        variables: {
          input: {
            userId: session.user.id,
            amount: amountNum
          }
        }
      });

      if (result.data?.addFunds?.success) {
        setSuccess(`Successfully added ¥${amountNum.toFixed(2)} to your wallet`);
        setAmount("");
        setShowAddFunds(false);
        refetch();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.data?.addFunds?.message || "Failed to add funds");
      }
    } catch (err) {
      setError(err.message || "An error occurred while adding funds");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center text-gray-500">
          Please log in to view your wallet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Wallet</h3>
        <button
          onClick={() => setShowAddFunds(!showAddFunds)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Funds
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="text-red-700 font-medium">Error</div>
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="text-green-700 font-medium">Success</div>
          <div className="text-green-600 text-sm">{success}</div>
        </div>
      )}

      {walletLoading ? (
        <div className="text-center py-4">
          <div className="text-gray-500">Loading wallet...</div>
        </div>
      ) : wallet ? (
        <div className="space-y-4">
          {/* Wallet Balance */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Current Balance</div>
            <div className="text-3xl font-bold text-gray-900">
              ¥{wallet.balance.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {wallet.currency}
            </div>
          </div>

          {/* Wallet Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Member Since</div>
              <div className="font-medium">
                {new Date(wallet.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Last Updated</div>
              <div className="font-medium">
                {new Date(wallet.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-gray-500">No wallet found</div>
          <div className="text-sm text-gray-400 mt-1">
            Add funds to create your wallet
          </div>
        </div>
      )}

      {/* Add Funds Form */}
      {showAddFunds && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Add Funds</h4>
          
          <form onSubmit={handleAddFunds} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (¥)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex space-x-2">
              {[1000, 5000, 10000, 20000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm transition-colors"
                >
                  ¥{quickAmount.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                {loading ? "Adding Funds..." : "Add Funds"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddFunds(false);
                  setAmount("");
                  setError("");
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}