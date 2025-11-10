"use client";

import { useEffect, useState, useRef } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

type PaymentFormProps = {
  checkoutId: string;
  total: number;
  currency?: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
};

function StripePaymentForm({ checkoutId, total, currency = "INR", onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        onPaymentError(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess({
          provider: "stripe",
          paymentIntentId: paymentIntent.id,
        });
      }
    } catch (err: any) {
      onPaymentError(err.message || "Payment processing failed");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold"
      >
        {isProcessing ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
      </Button>
    </form>
  );
}

function RazorpayPaymentButton({ checkoutId, total, currency = "INR", onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const razorpayLoaded = useRef(false);

  useEffect(() => {
    if (!razorpayLoaded.current && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      razorpayLoaded.current = true;
    }
  }, []);

  const handleRazorpayPayment = async () => {
    setIsLoading(true);

    try {
      // Create Razorpay order
      const res = await fetch("/api/checkout/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutId,
          amount: total,
          currency,
          provider: "razorpay",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create payment");
      }

      const { orderId, keyId } = await res.json();

      // Initialize Razorpay checkout
      const options = {
        key: keyId,
        amount: Math.round(total * 100), // Convert to paise
        currency: currency,
        name: "KOKO Fresh",
        description: "Order Payment",
        order_id: orderId,
        handler: function (response: any) {
          onPaymentSuccess({
            provider: "razorpay",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#DD9627",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            onPaymentError("Payment cancelled");
          },
        },
      };

      const razorpay = (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      onPaymentError(error.message || "Failed to initialize payment");
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleRazorpayPayment}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold"
    >
      {isLoading ? "Loading..." : `Pay ₹${total.toFixed(2)} with Razorpay`}
    </Button>
  );
}

export default function PaymentForm({ checkoutId, total, currency = "INR", onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "razorpay">("stripe");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);

  useEffect(() => {
    if (paymentProvider === "stripe" && !clientSecret && checkoutId && total > 0) {
      createStripePaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentProvider, checkoutId]);

  const createStripePaymentIntent = async () => {
    setIsLoadingIntent(true);
    try {
      const res = await fetch("/api/checkout/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutId,
          amount: total,
          currency,
          provider: "stripe",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create payment intent");
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      onPaymentError(error.message || "Failed to initialize payment");
    } finally {
      setIsLoadingIntent(false);
    }
  };

  const stripeOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#DD9627",
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Payment Provider Selection */}
      <div className="flex gap-4">
        {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
          <button
            type="button"
            onClick={() => setPaymentProvider("stripe")}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
              paymentProvider === "stripe"
                ? "border-[#DD9627] bg-[#FFF8E1]"
                : "border-[#E5E0D8] hover:border-[#DD9627]/60"
            }`}
          >
            Stripe
          </button>
        )}
        {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
          <button
            type="button"
            onClick={() => setPaymentProvider("razorpay")}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
              paymentProvider === "razorpay"
                ? "border-[#DD9627] bg-[#FFF8E1]"
                : "border-[#E5E0D8] hover:border-[#DD9627]/60"
            }`}
          >
            Razorpay
          </button>
        )}
      </div>

      {/* Payment Forms */}
      {paymentProvider === "stripe" && clientSecret && (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <StripePaymentForm
            checkoutId={checkoutId}
            total={total}
            currency={currency}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
        </Elements>
      )}

      {paymentProvider === "stripe" && isLoadingIntent && (
        <div className="text-center py-4 text-[#6B4A0F]">Loading payment form...</div>
      )}

      {paymentProvider === "razorpay" && (
        <RazorpayPaymentButton
          checkoutId={checkoutId}
          total={total}
          currency={currency}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      )}

      {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
        <div className="text-center py-4 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="font-medium mb-2">Payment providers not configured</p>
          <p className="text-sm">Please set up Stripe or Razorpay environment variables to enable online payments.</p>
          <p className="text-xs mt-2 text-gray-600">You can still use Cash on Delivery for now.</p>
        </div>
      )}
    </div>
  );
}

