"use client";

import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const StripePaymentForm = ({ order, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) {
        toast.error("Please login to make payment");
        return;
      }

      // Initialize Stripe payment
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/initialize-stripe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: order._id,
          }),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      if (!data.clientSecret) {
        throw new Error("No client secret received from server");
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to success page with payment intent ID
      router.push(`/payment-success?payment_intent=${paymentIntent.id}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-md p-4">
        <CardElement
          options={{
            disabled: loading,
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`flex-1 py-2 px-4 rounded-md text-white ${
            loading || !stripe
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 rounded-md text-white bg-red-500 hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StripePaymentForm;
