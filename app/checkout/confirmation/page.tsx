"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

type Order = {
  _id: string;
  number: string;
  buyerInfo?: {
    email?: string;
    phone?: string;
  };
  shippingInfo?: {
    logistics?: {
      shippingDestination?: {
        address?: {
          addressLine1?: string;
          addressLine2?: string;
          city?: string;
          subdivision?: string;
          postalCode?: string;
          country?: string;
        };
        contactDetails?: {
          firstName?: string;
          lastName?: string;
          phone?: string;
        };
      };
    };
  };
  totals?: {
    subtotal?: { amount?: string; formattedAmount?: string };
    tax?: { amount?: string; formattedAmount?: string };
    shipping?: { amount?: string; formattedAmount?: string };
    total?: { amount?: string; formattedAmount?: string };
  };
  lineItems?: Array<{
    id: string;
    productName?: { original?: string };
    quantity?: number;
    price?: { amount?: string; formattedAmount?: string };
    image?: { url?: string };
  }>;
};

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      toast.error("Order ID not found");
      router.push("/shop");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?orderId=${orderId}`, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await res.json();
        setOrder(data.order);
      } catch (error: any) {
        console.error("Failed to fetch order:", error);
        toast.error(error.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9EF] flex items-center justify-center">
        <div className="text-center text-[#3B2B13]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DD9627] mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFF9EF] text-[#3B2B13]">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-serif font-semibold mb-4">Order not found</h1>
          <p className="text-[#6B4A0F] mb-8">We couldn't find the order you're looking for.</p>
          <Button asChild className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold px-8">
            <a href="/shop">Continue Shopping</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const address = order.shippingInfo?.logistics?.shippingDestination?.address;
  const contact = order.shippingInfo?.logistics?.shippingDestination?.contactDetails;

  return (
    <div className="min-h-screen bg-[#FFF9EF] text-[#3B2B13]">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-[#DD9627]/20 rounded-2xl p-8 shadow-lg">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-semibold mb-2">Order Confirmed!</h1>
            <p className="text-[#6B4A0F]">Thank you for your purchase. We've received your order.</p>
            <div className="mt-4 inline-block bg-[#FFF8E1] border border-[#DD9627]/30 rounded-lg px-4 py-2">
              <p className="text-sm text-[#6B4A0F]">Order Number</p>
              <p className="text-lg font-bold text-[#3B2B13]">{order.number || order._id}</p>
            </div>
          </div>

          <Separator className="my-8 bg-[#E5E0D8]" />

          {/* Order Items */}
          <section className="mb-8">
            <h2 className="text-xl font-serif font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.lineItems?.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg bg-[#FFF3C6] border border-[#F6DEAA] overflow-hidden flex-shrink-0">
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={item.productName?.original || "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#B47B2B] font-semibold text-xs">KF</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3B2B13]">{item.productName?.original || "Product"}</p>
                    <p className="text-sm text-[#6B4A0F]">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-[#B47B2B]">
                    {item.price?.formattedAmount || `₹${Number.parseFloat(item.price?.amount || "0").toFixed(2)}`}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-8 bg-[#E5E0D8]" />

          {/* Order Summary */}
          <section className="mb-8">
            <h2 className="text-xl font-serif font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B4A0F]">Subtotal</span>
                <span className="font-semibold">{order.totals?.subtotal?.formattedAmount || "₹0.00"}</span>
              </div>
              {order.totals?.shipping && Number.parseFloat(order.totals.shipping.amount || "0") > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#6B4A0F]">Shipping</span>
                  <span className="font-semibold">{order.totals.shipping.formattedAmount || "Free"}</span>
                </div>
              )}
              {order.totals?.tax && Number.parseFloat(order.totals.tax.amount || "0") > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#6B4A0F]">Tax</span>
                  <span className="font-semibold">{order.totals.tax.formattedAmount || "₹0.00"}</span>
                </div>
              )}
              <Separator className="my-2 bg-[#E5E0D8]" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-[#3B2B13]">{order.totals?.total?.formattedAmount || "₹0.00"}</span>
              </div>
            </div>
          </section>

          <Separator className="my-8 bg-[#E5E0D8]" />

          {/* Shipping Address */}
          {address && (
            <section className="mb-8">
              <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className="bg-[#FFF8E1] border border-[#DD9627]/20 rounded-lg p-4">
                {contact && (
                  <p className="font-medium text-[#3B2B13] mb-2">
                    {contact.firstName} {contact.lastName}
                  </p>
                )}
                <p className="text-[#6B4A0F]">{address.addressLine1}</p>
                {address.addressLine2 && <p className="text-[#6B4A0F]">{address.addressLine2}</p>}
                <p className="text-[#6B4A0F]">
                  {address.city}, {address.subdivision} {address.postalCode}
                </p>
                <p className="text-[#6B4A0F]">{address.country}</p>
                {contact?.phone && (
                  <p className="text-[#6B4A0F] mt-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Contact Info */}
          {order.buyerInfo?.email && (
            <section className="mb-8">
              <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h2>
              <div className="bg-[#FFF8E1] border border-[#DD9627]/20 rounded-lg p-4">
                <p className="text-[#6B4A0F]">{order.buyerInfo.email}</p>
                {order.buyerInfo.phone && (
                  <p className="text-[#6B4A0F] mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {order.buyerInfo.phone}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Next Steps */}
          <div className="bg-[#FFF8E1] border border-[#DD9627]/30 rounded-lg p-6 mt-8">
            <h3 className="font-semibold text-[#3B2B13] mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-[#6B4A0F]">
              <li>• You'll receive an order confirmation email shortly</li>
              <li>• We'll notify you when your order ships</li>
              <li>• Track your order in your account dashboard</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              asChild
              variant="outline"
              className="flex-1 border-[#DD9627] text-[#3B2B13] hover:bg-[#FFF8E1]"
            >
              <a href="/profile">View Orders</a>
            </Button>
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold"
            >
              <a href="/shop">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

