"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { useUser } from "@/context/user-context";
import { toast } from "sonner";
import CashfreePaymentForm from "@/components/checkout/CashfreePaymentForm";

type CheckoutStep = "contact" | "delivery" | "payment";

type ContactFormState = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
};

type AddressFormState = {
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  notes: string;
};

type ShippingOption = {
  id: string;
  title: string;
  description: string;
  cost: string;
  formattedCost: string;
};

type CheckoutTotals = {
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  total: string;
};

const steps: { id: CheckoutStep; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
];

export default function HeadlessCheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, updateQuantity, remove } = useCart();
  const { contact } = useUser();

  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(true);
  const [totals, setTotals] = useState<CheckoutTotals | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("contact");
  const [contactState, setContactState] = useState<ContactFormState>({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
  });
  const [addressState, setAddressState] = useState<AddressFormState>({
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "India",
    notes: "",
  });
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cashfree");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const [giftCardCode, setGiftCardCode] = useState<string>("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isApplyingGiftCard, setIsApplyingGiftCard] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<AddressFormState[]>([]);
  const [useSavedAddress, setUseSavedAddress] = useState<boolean>(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const items = cart?.lineItems || [];

  // Initialize checkout on mount
  useEffect(() => {
    if (cartLoading || !items.length) return;

    const initCheckout = async () => {
      try {
        setCheckoutLoading(true);
        
        // Calculate cart subtotal first for fallback
        const cartSubtotal = items.reduce((sum: number, item: any) => {
          const price = parseFloat(item.price?.amount || item.price?.value || "0");
          const qty = item.quantity || 0;
          return sum + price * qty;
        }, 0);
        console.log("🛒 Cart subtotal calculated:", cartSubtotal);
        console.log("🛒 Cart items:", items);
        
        const res = await fetch("/api/checkout/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to initialize checkout");
        }

        const data = await res.json();
        console.log("📦 Checkout init response:", data);
        
        setCheckoutId(data.checkoutId);
        
        // Verify totals before setting
        if (data.totals) {
          console.log("💰 Received totals:", data.totals);
          const subtotalValue = parseFloat(data.totals.subtotal || "0");
          const totalValue = parseFloat(data.totals.total || "0");
          
          // If totals are 0 or invalid, use cart calculation
          if (subtotalValue === 0 && cartSubtotal > 0) {
            console.warn("⚠️ API returned 0 subtotal, using cart calculation");
            setTotals({
              subtotal: cartSubtotal.toString(),
              tax: data.totals.tax || "0",
              shipping: data.totals.shipping || "0",
              discount: data.totals.discount || "0",
              total: (cartSubtotal + parseFloat(data.totals.tax || "0") + parseFloat(data.totals.shipping || "0") - parseFloat(data.totals.discount || "0")).toString(),
            });
          } else {
            setTotals(data.totals);
          }
        } else {
          console.warn("⚠️ No totals in response, calculating from cart");
          // Fallback: calculate from cart items
          setTotals({
            subtotal: cartSubtotal.toString(),
            tax: "0",
            shipping: "0",
            discount: "0",
            total: cartSubtotal.toString(),
          });
        }
        
        setShippingOptions(data.shippingOptions || []);

        // Select first shipping option by default
        if (data.shippingOptions?.length > 0 && !selectedShipping) {
          setSelectedShipping(data.shippingOptions[0].id);
        }
      } catch (error: any) {
        console.error("Failed to initialize checkout:", error);
        toast.error(error.message || "Failed to initialize checkout");
        
        // Even on error, set totals from cart so user can see something
        const cartSubtotal = items.reduce((sum: number, item: any) => {
          const price = parseFloat(item.price?.amount || item.price?.value || "0");
          const qty = item.quantity || 0;
          return sum + price * qty;
        }, 0);
        
        if (cartSubtotal > 0) {
          setTotals({
            subtotal: cartSubtotal.toString(),
            tax: "0",
            shipping: "0",
            discount: "0",
            total: cartSubtotal.toString(),
          });
        }
      } finally {
        setCheckoutLoading(false);
      }
    };

    initCheckout();
  }, [cartLoading, items.length]);

  const subtotal = useMemo(() => {
    if (totals && totals.subtotal) {
      const parsed = Number.parseFloat(totals.subtotal);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    // Fallback to cart calculation
    return items.reduce((sum: number, item: any) => {
      const price = Number.parseFloat(item.price?.amount || "0");
      const qty = item.quantity || 0;
      return sum + price * qty;
    }, 0);
  }, [totals, items]);

  const tax = useMemo(() => {
    return totals ? Number.parseFloat(totals.tax || "0") : 0;
  }, [totals]);

  const shippingCost = useMemo(() => {
    if (totals) {
      return Number.parseFloat(totals.shipping || "0");
    }
    const method = shippingOptions.find((m) => m.id === selectedShipping);
    return method ? Number.parseFloat(method.cost || "0") : 0;
  }, [totals, shippingOptions, selectedShipping]);

  const discount = useMemo(() => {
    return totals ? Number.parseFloat(totals.discount || "0") : 0;
  }, [totals]);

  const total = useMemo(() => {
    if (totals && totals.total) {
      const parsed = Number.parseFloat(totals.total);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    // Fallback calculation
    const calculated = subtotal + shippingCost + tax - discount;
    return calculated > 0 ? calculated : subtotal;
  }, [totals, subtotal, shippingCost, tax, discount]);

  useEffect(() => {
    if (!contact) return;

    setContactState((prev) => ({
      email: contact.primaryInfo?.email || prev.email,
      phone: contact.primaryInfo?.phone || prev.phone,
      firstName: contact.info?.name?.first || prev.firstName,
      lastName: contact.info?.name?.last || prev.lastName,
    }));

    // Load saved addresses - handle both items array and direct array
    const addressesList = contact.info?.addresses?.items || contact.info?.addresses || [];
    if (addressesList.length > 0) {
      const addresses = addressesList.map((addr: any) => {
        // Handle different address structures
        const addressObj = addr.address || addr;
        return {
          line1: addressObj?.streetAddress?.firstLine || addressObj?.addressLine1 || "",
          line2: addressObj?.streetAddress?.secondLine || addressObj?.addressLine2 || "",
          city: addressObj?.city || "",
          region: addressObj?.subdivision || "",
          postalCode: addressObj?.postalCode || "",
          country: addressObj?.country || "India",
          notes: "",
        };
      });
      setSavedAddresses(addresses);

      // Pre-fill with primary address
      const primaryAddress = addressesList[0];
      const addressObj = primaryAddress.address || primaryAddress;
      setAddressState((prev) => ({
        line1: addressObj?.streetAddress?.firstLine || addressObj?.addressLine1 || prev.line1,
        line2: addressObj?.streetAddress?.secondLine || addressObj?.addressLine2 || prev.line2,
        city: addressObj?.city || prev.city,
        region: addressObj?.subdivision || prev.region,
        postalCode: addressObj?.postalCode || prev.postalCode,
        country: addressObj?.country || prev.country || "India",
        notes: prev.notes,
      }));
    }
  }, [contact]);

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateCheckout = async (buyerInfo?: any, shippingAddress?: any, shippingOptionId?: string) => {
    if (!checkoutId) return;

    try {
      const res = await fetch("/api/checkout/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutId,
          buyerInfo,
          shippingAddress,
          shippingOptionId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update checkout");
      }

      const data = await res.json();
      setTotals(data.totals);
      return data;
    } catch (error: any) {
      console.error("Failed to update checkout:", error);
      toast.error(error.message || "Failed to update checkout");
      throw error;
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contactState.email.trim()) {
      toast.error("Please add a valid email address");
      return;
    }

    try {
      await updateCheckout({
        email: contactState.email,
        phone: contactState.phone,
        firstName: contactState.firstName,
        lastName: contactState.lastName,
      });
      goToStep("delivery");
    } catch (error) {
      // Error already handled in updateCheckout
    }
  };

  const handleDeliverySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!addressState.line1 || !addressState.city || !addressState.postalCode) {
      toast.error("Please complete all required address fields");
      return;
    }

    try {
      await updateCheckout(
        {
          email: contactState.email,
          phone: contactState.phone,
          firstName: contactState.firstName,
          lastName: contactState.lastName,
        },
        addressState,
        selectedShipping
      );
      goToStep("payment");
    } catch (error) {
      // Error already handled in updateCheckout
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim() || !checkoutId) return;

    setIsApplyingCoupon(true);
    try {
      const res = await fetch("/api/checkout/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId, couponCode: couponCode.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to apply coupon");
      }

      const data = await res.json();
      setTotals(data.totals);
      toast.success("Coupon applied successfully!");
      setCouponCode("");
    } catch (error: any) {
      toast.error(error.message || "Invalid coupon code");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const applyGiftCard = async () => {
    if (!giftCardCode.trim() || !checkoutId) return;

    setIsApplyingGiftCard(true);
    try {
      const res = await fetch("/api/checkout/apply-gift-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId, giftCardCode: giftCardCode.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to apply gift card");
      }

      const data = await res.json();
      setTotals(data.totals);
      toast.success("Gift card applied successfully!");
      setGiftCardCode("");
    } catch (error: any) {
      toast.error(error.message || "Invalid gift card code");
    } finally {
      setIsApplyingGiftCard(false);
    }
  };

  const validateAddress = async () => {
    try {
      const res = await fetch("/api/checkout/validate-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addressState }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.errors) {
          error.errors.forEach((err: string) => toast.error(err));
        } else {
          toast.error(error.error || "Address validation failed");
        }
        return false;
      }

      return true;
    } catch (error: any) {
      toast.error("Failed to validate address");
      return false;
    }
  };

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!checkoutId) {
      toast.error("Checkout not initialized. Please refresh the page.");
      return;
    }

    // For cashfree payments, the order is placed automatically after payment success
    // This form submission is only for COD
    if (paymentMethod === "cashfree") {
      if (!paymentData) {
        toast.error("Please complete the payment process above");
        return;
      }
      // If payment data exists, order should have been placed already
      // But allow manual retry if needed
      if (paymentData) {
        toast.info("Order placement in progress...");
        return;
      }
    }

    setIsPlacingOrder(true);

    try {
      const orderPayload: any = {
        checkoutId,
        paymentMethod,
      };

      // Add payment data for cashfree payments
      if (paymentMethod === "cashfree" && paymentData) {
        orderPayload.paymentProvider = paymentData.provider;
        // Cashfree payment data is handled via webhook
        // No additional data needed in payload
      }

      const res = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to place order");
      }

      const data = await res.json();
      toast.success("Order placed successfully!");

      // Redirect to confirmation page
      router.push(`/checkout/confirmation?orderId=${data.orderId}`);
    } catch (error: any) {
      console.error("Failed to place order:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = async (data: any) => {
    console.log("✅ Payment successful:", data);
    setPaymentData(data);
    
    // Automatically place order after successful payment
    if (!checkoutId) {
      toast.error("Checkout not initialized");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderPayload: any = {
        checkoutId,
        paymentMethod: "online",
        paymentProvider: data.provider,
      };

      // Cashfree payment data is handled differently
      // The payment success page will handle order placement

      const res = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to place order");
      }

      const orderData = await res.json();
      toast.success("Order placed successfully!");

      // Redirect to confirmation page
      router.push(`/checkout/confirmation?orderId=${orderData.orderId}`);
    } catch (error: any) {
      console.error("Failed to place order:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const renderStepForm = () => {
    switch (currentStep) {
      case "contact":
        return (
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <section className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm">
              <header className="mb-6">
                <h2 className="text-2xl font-serif font-semibold text-[#3B2B13]">Contact details</h2>
                <p className="text-sm text-[#6B4A0F] mt-1">We will send order updates to this email address and phone number.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2B13]" htmlFor="contact-email">Email *</label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactState.email}
                    onChange={(event) => setContactState((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2B13]" htmlFor="contact-phone">Phone *</label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={contactState.phone}
                    onChange={(event) => setContactState((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2B13]" htmlFor="contact-firstName">First name *</label>
                  <Input
                    id="contact-firstName"
                    value={contactState.firstName}
                    onChange={(event) => setContactState((prev) => ({ ...prev, firstName: event.target.value }))}
                    placeholder="Arun"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2B13]" htmlFor="contact-lastName">Last name *</label>
                  <Input
                    id="contact-lastName"
                    value={contactState.lastName}
                    onChange={(event) => setContactState((prev) => ({ ...prev, lastName: event.target.value }))}
                    placeholder="Kumar"
                    required
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <Button type="submit" className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold px-8">
                Continue to delivery
              </Button>
            </div>
          </form>
        );

      case "delivery":
        return (
          <form onSubmit={handleDeliverySubmit} className="space-y-6">
            <section className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm">
              <header className="mb-6">
                <h2 className="text-2xl font-serif font-semibold text-[#3B2B13]">Delivery details</h2>
                <p className="text-sm text-[#6B4A0F] mt-1">Enter the shipping address for this order.</p>
              </header>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2B13]" htmlFor="address-line1">Address line 1 *</label>
                  <Input
                    id="address-line1"
                    value={addressState.line1}
                    onChange={(event) => setAddressState((prev) => ({ ...prev, line1: event.target.value }))}
                    placeholder="House / Flat / Street"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2B13]" htmlFor="address-line2">Address line 2</label>
                  <Input
                    id="address-line2"
                    value={addressState.line2}
                    onChange={(event) => setAddressState((prev) => ({ ...prev, line2: event.target.value }))}
                    placeholder="Area / Landmark"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#3B2B13]" htmlFor="address-city">City *</label>
                    <Input
                      id="address-city"
                      value={addressState.city}
                      onChange={(event) => setAddressState((prev) => ({ ...prev, city: event.target.value }))}
                      placeholder="Chennai"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#3B2B13]" htmlFor="address-region">State *</label>
                    <Input
                      id="address-region"
                      value={addressState.region}
                      onChange={(event) => setAddressState((prev) => ({ ...prev, region: event.target.value }))}
                      placeholder="Tamil Nadu"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#3B2B13]" htmlFor="address-postal">PIN code *</label>
                    <Input
                      id="address-postal"
                      value={addressState.postalCode}
                      onChange={(event) => setAddressState((prev) => ({ ...prev, postalCode: event.target.value }))}
                      placeholder="600001"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2B13]" htmlFor="address-country">Country *</label>
                  <Input
                    id="address-country"
                    value={addressState.country}
                    onChange={(event) => setAddressState((prev) => ({ ...prev, country: event.target.value }))}
                    placeholder="India"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2B13]" htmlFor="address-notes">Delivery instructions</label>
                  <Textarea
                    id="address-notes"
                    value={addressState.notes}
                    onChange={(event) => setAddressState((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Add landmark or special notes for the delivery partner"
                    rows={3}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm">
              <header className="mb-4">
                <h3 className="text-lg font-serif font-semibold text-[#3B2B13]">Shipping method</h3>
                <p className="text-sm text-[#6B4A0F] mt-1">Choose how you would like us to deliver your order.</p>
              </header>

              <div className="space-y-3">
                {shippingOptions.length > 0 ? (
                  shippingOptions.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                        selectedShipping === method.id
                          ? "border-[#DD9627] bg-[#FFF8E1]"
                          : "border-[#E5E0D8] hover:border-[#DD9627]/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping-method"
                        value={method.id}
                        checked={selectedShipping === method.id}
                        onChange={async () => {
                          setSelectedShipping(method.id);
                          // Update checkout with new shipping method
                          try {
                            await updateCheckout(
                              {
                                email: contactState.email,
                                phone: contactState.phone,
                                firstName: contactState.firstName,
                                lastName: contactState.lastName,
                              },
                              addressState.line1 ? addressState : undefined,
                              method.id
                            );
                          } catch (error) {
                            // Error already handled
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[#3B2B13] font-medium">{method.title}</p>
                          <p className="text-[#3B2B13] font-semibold">
                            {method.formattedCost || (Number.parseFloat(method.cost || "0") === 0 ? "Free" : `₹${Number.parseFloat(method.cost || "0").toFixed(2)}`)}
                          </p>
                        </div>
                        {method.description && (
                          <p className="text-sm text-[#6B4A0F]">{method.description}</p>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-[#6B4A0F]">Loading shipping options...</p>
                )}
              </div>
            </section>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => goToStep("contact")}>
                Back to contact
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold px-8">
                Continue to payment
              </Button>
            </div>
          </form>
        );

      case "payment":
        return (
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <section className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm">
              <header className="mb-6">
                <h2 className="text-2xl font-serif font-semibold text-[#3B2B13]">Payment</h2>
                <p className="text-sm text-[#6B4A0F] mt-1">Select a payment method. We will add the secure payment widget in the next step.</p>
              </header>

              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#DD9627] bg-[#FFF8E1]"
                      : "border-[#E5E0D8] hover:border-[#DD9627]/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <div>
                    <p className="text-[#3B2B13] font-medium">Cash on delivery</p>
                    <p className="text-sm text-[#6B4A0F]">Pay when the order arrives at your doorstep.</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                    paymentMethod === "cashfree"
                      ? "border-[#DD9627] bg-[#FFF8E1]"
                      : "border-[#E5E0D8] hover:border-[#DD9627]/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value="cashfree"
                    checked={paymentMethod === "cashfree"}
                    onChange={() => setPaymentMethod("cashfree")}
                  />
                  <div>
                    <p className="text-[#3B2B13] font-medium">Online payment</p>
                    <p className="text-sm text-[#6B4A0F]">Pay securely with card, UPI, or other online methods.</p>
                  </div>
                </label>
              </div>

              {/* Payment Form - Show when cashfree payment is selected */}
              {paymentMethod === "cashfree" && checkoutId && (
                <div className="mt-6 pt-6 border-t border-[#E5E0D8]">
                  <CashfreePaymentForm
                    checkoutId={checkoutId}
                    total={total}
                    currency="INR"
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    customerEmail={contactState.email}
                    customerPhone={contactState.phone}
                  />
                </div>
              )}
            </section>

            <section className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm">
              <header className="mb-4">
                <h3 className="text-lg font-serif font-semibold text-[#3B2B13]">Order review</h3>
                <p className="text-sm text-[#6B4A0F]">Please confirm your details before placing the order.</p>
              </header>

              <div className="space-y-4 text-sm text-[#3B2B13]">
                <div>
                  <p className="font-medium">Contact</p>
                  <p>{contactState.firstName} {contactState.lastName}</p>
                  <p>{contactState.email}</p>
                  {contactState.phone && <p>{contactState.phone}</p>}
                </div>
                <Separator className="bg-[#E5E0D8]" />
                <div>
                  <p className="font-medium">Delivery address</p>
                  <p>{addressState.line1}</p>
                  {addressState.line2 && <p>{addressState.line2}</p>}
                  <p>
                    {addressState.city}, {addressState.region} {addressState.postalCode}
                  </p>
                  <p>{addressState.country}</p>
                  {addressState.notes && <p className="mt-1 text-[#6B4A0F]">Note: {addressState.notes}</p>}
                </div>
              </div>
            </section>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-[#3B2B13]">
                I agree to the Kokofresh <a href="/privacypolicy" className="underline text-[#B47B2B]">Privacy Policy</a> and <a href="/shipping" className="underline text-[#B47B2B]">Shipping Policy</a>.
              </label>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => goToStep("delivery")}>
                Back to delivery
              </Button>
              <Button
                type="submit"
                disabled={isPlacingOrder || (paymentMethod === "cashfree" && !paymentData)}
                className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold px-8"
              >
                {isPlacingOrder
                  ? "Placing order..."
                  : paymentMethod === "cashfree" && !paymentData
                    ? "Complete payment above"
                    : "Place order"}
              </Button>
            </div>
          </form>
        );
    }
  };

  const renderStepper = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);

    return (
      <ol className="flex items-center justify-between gap-3 mb-10">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <li key={step.id} className="flex-1">
              <div
                className={`flex flex-col items-center text-center gap-2 px-2 py-1 transition-all ${
                  isActive
                    ? "text-[#3B2B13]"
                    : isCompleted
                      ? "text-[#3B2B13] opacity-80"
                      : "text-[#6B4A0F] opacity-60"
                }`}
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full border text-sm font-semibold ${
                    isActive
                      ? "border-[#DD9627] bg-[#FFF8E1]"
                      : isCompleted
                        ? "border-[#DD9627] bg-[#DD9627] text-black"
                        : "border-[#E5E0D8]"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span className="text-xs uppercase tracking-wide">{step.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    );
  };

  if (cartLoading || checkoutLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-[#3B2B13]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DD9627] mx-auto mb-4"></div>
          <p>Loading your checkout...</p>
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="min-h-screen bg-white text-[#3B2B13]">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-serif font-semibold mb-4">Your cart is empty</h1>
          <p className="text-[#6B4A0F] mb-8">Add some delicious Kokofresh products to start checkout.</p>
          <Button asChild className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold px-8">
            <a href="/shop">Browse products</a>
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9EF] text-[#3B2B13]">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 pb-16 pt-10">
        <div className="mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B47B2B]">Secure checkout</span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mt-3">Complete your order</h1>
          <p className="text-[#6B4A0F] mt-2">Stay on Kokofresh to finish your purchase with a smooth, headless checkout.</p>
        </div>

        {renderStepper()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {renderStepForm()}
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm sticky top-28">
              <h2 className="font-serif text-2xl font-semibold mb-4">Order summary</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-[#FFF3C6] border border-[#F6DEAA] overflow-hidden flex-shrink-0">
                      {item.image?.url ? (
                        <img
                          src={item.image.url}
                          alt={item.productName?.original || item.name}
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            (event.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#B47B2B] font-semibold">KF</div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-[#3B2B13]">{item.productName?.original || item.name}</p>
                          <p className="text-xs text-[#6B4A0F]">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-[#B47B2B]">
                          {item.price?.formattedAmount || `₹${Number.parseFloat(item.price?.amount || "0").toFixed(2)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-xs text-[#6B4A0F]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                          className="underline hover:text-[#B47B2B]"
                        >
                          - Remove one
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="underline hover:text-[#B47B2B]"
                        >
                          Remove item
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6 bg-[#E5E0D8]" />

              {/* Coupon Code */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium text-[#3B2B13]">Coupon Code</label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim() || !checkoutId}
                    size="sm"
                    className="text-xs"
                  >
                    {isApplyingCoupon ? "..." : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Gift Card */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium text-[#3B2B13]">Gift Card</label>
                <div className="flex gap-2">
                  <Input
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyGiftCard();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyGiftCard}
                    disabled={isApplyingGiftCard || !giftCardCode.trim() || !checkoutId}
                    size="sm"
                    className="text-xs"
                  >
                    {isApplyingGiftCard ? "..." : "Apply"}
                  </Button>
                </div>
              </div>

              <Separator className="my-4 bg-[#E5E0D8]" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B4A0F]">Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span className="text-[#6B4A0F]">Discount</span>
                    <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#6B4A0F]">Shipping</span>
                  <span className="font-semibold">{shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6B4A0F]">Tax</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator className="my-6 bg-[#E5E0D8]" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-serif font-semibold text-[#3B2B13]">₹{total.toFixed(2)}</span>
              </div>

              {totals && (
                <p className="text-xs text-[#6B4A0F] mt-4">
                  All prices include taxes and shipping as calculated by Wix.
                </p>
              )}
            </div>
          </aside>
        </div>
    </main>
      <Footer />
    </div>
  );
}
