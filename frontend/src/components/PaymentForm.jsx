"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "@apollo/client";
import { PROCESS_PAYMENT, CONFIRM_PAYMENT } from "@/graphql/payments";

export default function PaymentForm({ order, totalAmount, onPaymentSuccess, onPaymentCancel }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  
  const [processPayment] = useMutation(PROCESS_PAYMENT);
  const [confirmPayment] = useMutation(CONFIRM_PAYMENT);

  const handlePayment = async () => {
    if (!session?.user?.id) {
      setError("You must be logged in to make a payment");
      return;
    }

    if (!order?.id) {
      setError("Order information is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate payment intent creation (in real app, integrate with Stripe/PayPal)
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Process payment
      const result = await processPayment({
        variables: {
          input: {
            orderId: order.id,
            paymentIntentId: paymentIntentId,
            amount: totalAmount
          }
        }
      });

      if (result.data?.processPayment?.success) {
        // Simulate payment confirmation (in real app, wait for webhook/confirmation)
        setTimeout(async () => {
          try {
            const confirmResult = await confirmPayment({
              variables: {
                paymentId: result.data.processPayment.payment.id
              }
            });

            if (confirmResult.data?.confirmPayment?.success) {
              onPaymentSuccess(result.data.processPayment.payment);
            } else {
              setError(confirmResult.data?.confirmPayment?.message || "Payment confirmation failed");
            }
          } catch (confirmError) {
            setError(confirmError.message || "Payment confirmation error");
          } finally {
            setLoading(false);
          }
        }, 2000);
      } else {
        setError(result.data?.processPayment?.message || "Payment processing failed");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred during payment processing");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="text-red-700 font-medium">Payment Error</div>
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={paymentMethod === "credit_card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Credit/Debit Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="wallet"
                checked={paymentMethod === "wallet"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Wallet Balance</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">PayPal</span>
            </label>
          </div>
        </div>

        {/* Payment Amount Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="text-xl font-semibold text-green-600">
              ¥{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-semibold transition-colors"
          >
            {loading ? "Processing Payment..." : "Pay Now"}
          </button>
          
          <button
            onClick={onPaymentCancel}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center">
          🔒 Your payment information is secure and encrypted
        </div>
      </div>
    </div>
  );
}