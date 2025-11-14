"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CashfreePaymentFormProps = {
  checkoutId: string;
  total: number;
  currency?: string;
  customerEmail?: string;
  customerPhone?: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
};

export default function CashfreePaymentForm({
  checkoutId,
  total,
  currency = "INR",
  customerEmail,
  customerPhone,
  onPaymentSuccess,
  onPaymentError,
}: CashfreePaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);

  useEffect(() => {
    const loadCashfree = async () => {
      try {
        const { load } = await import("@cashfreepayments/cashfree-js");
        const cf = await load({ mode: "production" });
        setCashfree(cf);
        console.log("✅ Cashfree SDK loaded");
      } catch (error) {
        console.error("❌ Failed to load Cashfree SDK:", error);
      }
    };

    loadCashfree();
  }, []);

  const handleCashfreePayment = async () => {
    console.log("🚀 Starting Cashfree payment flow...");
    setIsLoading(true);

    try {
      const res = await fetch("/api/cashfree/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutId,
          amount: total.toString(),
          customerEmail,
          customerPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment session");
      }

      if (data.payment_session_id && cashfree) {
        console.log("✅ Starting Cashfree checkout with session:", data.payment_session_id);

        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self"
        });
      } else if (data.payment_link) {
        console.log("✅ Fallback: Redirecting to Cashfree:", data.payment_link);
        window.location.href = data.payment_link;
      } else {
        throw new Error("No payment session or link received from Cashfree");
      }
    } catch (error: any) {
      console.error("❌ Cashfree payment error:", error);
      onPaymentError(error.message || "Failed to initialize payment");
      setIsLoading(false);
    }
  };

  if (!process.env.NEXT_PUBLIC_CASHFREE_APP_ID) {
    return (
      <div className="text-center py-4 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="font-medium mb-2">Payment not configured</p>
        <p className="text-sm">Cashfree is not configured. Please set NEXT_PUBLIC_CASHFREE_APP_ID environment variable.</p>
      </div>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleCashfreePayment}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold"
    >
      {isLoading
        ? "Processing..."
        : `Pay ₹${total.toFixed(2)}`}
    </Button>
  );
}
