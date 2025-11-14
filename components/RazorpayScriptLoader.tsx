"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * Client component to handle Razorpay script loading with event handlers
 */
export function RazorpayScriptLoader() {
  useEffect(() => {
    // Log when Razorpay becomes available
    const checkRazorpay = () => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        console.log("✅ Razorpay script loaded successfully");
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkRazorpay()) {
      return;
    }

    // Poll for Razorpay availability
    const interval = setInterval(() => {
      if (checkRazorpay()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!checkRazorpay()) {
        console.warn("⚠️ Razorpay script may not have loaded");
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="afterInteractive"
      onLoad={() => {
        console.log("✅ Razorpay script loaded successfully");
      }}
      onError={() => {
        console.error("❌ Failed to load Razorpay script");
      }}
    />
  );
}

