"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function PaymentSuccess() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentIntentId = searchParams.get("payment_intent");
        const pidx = searchParams.get("pidx");
        const transactionId = searchParams.get("transaction_id");

        if (!paymentIntentId && !pidx) {
          throw new Error("No payment ID found in URL");
        }

        const token = localStorage.getItem("currentUser");
        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again."
          );
        }

        let response;
        if (paymentIntentId) {
          // Verify Stripe payment
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payment/verify-stripe`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ paymentIntentId }),
            }
          );
        } else if (pidx) {
          // Verify Khalti payment
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payment/verify-khalti`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ pidx, transactionId }),
            }
          );
        }

        const data = await response.json();
        console.log("Verification response:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to verify payment");
        }

        if (data.status === "succeeded" || data.status === "success") {
          setIsSuccess(true);
          // Set payment details from the response
          setPaymentDetails({
            orderId: data.payment.orderId,
            amount: data.payment.amount,
            paymentId: data.payment.transactionId || data.payment.pidx,
            paymentMethod: data.payment.paymentGateway,
            date: new Date(data.payment.createdAt).toLocaleString(),
            status: data.payment.status,
          });
          toast.success("Payment successful! Your order has been confirmed.");

          // Redirect to orders page after 5 seconds
          setTimeout(() => {
            router.push("/orders");
          }, 5000);
        } else if (data.status === "pending") {
          toast.info("Payment is still processing. Please wait...");
          // Check again after 5 seconds
          setTimeout(verifyPayment, 5000);
        } else {
          throw new Error(data.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setErrorMessage(
          error.message ||
            "Failed to verify payment. Please contact support if this persists."
        );
        toast.error(error.message || "Failed to verify payment");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {isVerifying ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Verifying your payment...
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we process your payment.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Payment Successful!
            </h2>
            {paymentDetails && (
              <div className="mt-4 text-left space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Order ID:</span>{" "}
                  {paymentDetails.orderId}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Amount:</span> Rs{" "}
                  {paymentDetails.amount}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Payment ID:</span>{" "}
                  {paymentDetails.paymentId}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Payment Method:</span>{" "}
                  {paymentDetails.paymentMethod}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Date:</span>{" "}
                  {paymentDetails.date}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="capitalize">{paymentDetails.status}</span>
                </p>
              </div>
            )}
            <p className="mt-4 text-gray-600">Your order has been confirmed.</p>
            <div className="mt-6 space-y-4">
              <Link
                href="/orders"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                View Orders
              </Link>
              <p className="text-sm text-gray-500">
                Redirecting to orders page in 5 seconds...
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-gray-600">{errorMessage}</p>
            <button
              onClick={() => router.push("/orders")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
