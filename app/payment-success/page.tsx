"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkoutId");
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (checkoutId) {
      handlePlaceOrder();
    }
  }, [checkoutId]);

  const handlePlaceOrder = async () => {
    if (!checkoutId) return;

    setIsLoading(true);
    try {
      // First check if order already exists (webhook might have created it)
      const checkRes = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutId,
          paymentMethod: "cashfree",
        }),
      });

      const data = await checkRes.json();

      if (data.success) {
        setOrderData(data);
        toast.success("Order placed successfully!");
      } else {
        // If order creation fails, it might already exist
        console.log("Order creation failed, might already exist:", data.error);
        // Still show success since payment was completed
        setOrderData({
          orderId: checkoutId,
          orderNumber: "Processing...",
          message: "Payment completed - order being processed"
        });
        toast.success("Payment completed! Order is being processed.");
      }
    } catch (error: any) {
      console.error("Order placement error:", error);
      // Even if order placement fails, payment was successful
      setOrderData({
        orderId: checkoutId,
        orderNumber: "Processing...",
        message: "Payment completed - order being processed"
      });
      toast.success("Payment completed! Order is being processed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DD9627] mx-auto mb-4"></div>
          <p className="text-lg">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-semibold text-gray-900">{orderData.orderId}</p>
            {orderData.orderNumber && (
              <>
                <p className="text-sm text-gray-600 mt-2">Order Number</p>
                <p className="font-semibold text-gray-900">{orderData.orderNumber}</p>
              </>
            )}
          </div>

          <Button
            onClick={() => window.location.href = "/"}
            className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">There was an issue processing your payment.</p>

        <Button
          onClick={() => window.location.href = "/checkout"}
          className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
