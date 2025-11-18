"use client"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, MapPin, Clock, Package, AlertCircle, CheckCircle, Phone, Mail, ArrowRight } from "lucide-react"

export default function ShippingPage() {
  const shippingPolicies = [
    {
      icon: <MapPin className="h-12 w-12 text-[#DD9627]" />,
      title: "Serviceable Locations",
      description:
        "Orders are delivered within the locations listed on our service coverage page. Customers must confirm their delivery address falls within these serviceable areas before placing an order.",
      details: "Orders placed outside our delivery zones may be cancelled, and the customer will be notified promptly.",
    },
    {
      icon: <Clock className="h-12 w-12 text-[#DD9627]" />,
      title: "Delivery Timelines",
      description:
        "Standard Delivery: Orders are typically delivered within 2–5 business days, depending on the location. Expedited delivery timelines will be specified at checkout.",
      details: "Delivery times may be affected by external factors such as weather conditions or public holidays.",
    },
    {
      icon: <Package className="h-12 w-12 text-[#DD9627]" />,
      title: "Packaging Standards",
      description: "All products are packaged to ensure they remain fresh, safe, and intact during transit.",
      details: "If the packaging is damaged upon delivery, please report it immediately to our support team.",
    },
    {
      icon: <Truck className="h-12 w-12 text-[#DD9627]" />,
      title: "Order Tracking",
      description: "Once your order is shipped, you will receive a confirmation email or SMS with tracking details.",
      details: "You can monitor the delivery status of your order through the tracking link provided.",
    },
  ]

  const deliveryIssues = [
    {
      title: "Failed Delivery Attempts",
      description:
        "If the delivery is unsuccessful due to an incorrect address or customer unavailability, the logistics provider may attempt redelivery. Additional charges may apply for redelivery.",
    },
    {
      title: "Delayed Delivery",
      description:
        "Customers will be notified of delays. Refunds or credits will not be issued for delays caused by factors beyond our control.",
    },
    {
      title: "Lost or Stolen Orders",
      description:
        "If an order is marked as delivered but not received, report the issue within 24 hours. We will investigate and resolve the matter in consultation with the logistics provider.",
    },
  ]

  const customerResponsibilities = [
    "Ensure that the delivery address and contact details provided during checkout are accurate.",
    "Be available to receive the delivery at the specified address within the estimated timeframe.",
    "Inspect the order upon receipt and report any issues (e.g., damaged packaging or incorrect items) immediately to our support team.",
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative mt-16 md:mt-24 py-20 bg-gradient-to-br from-black via-black to-[#1a1a1a] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DD9627] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#FED649] text-black mb-6 px-4 py-2 text-sm font-semibold">📦 Shipping Policy</Badge>

          <h1 className="font-serif font-black text-5xl md:text-7xl mb-6 leading-tight">
            Fast, Fresh &{" "}
            <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
              Reliable Delivery
            </span>
          </h1>

          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            We partner with reliable logistics providers to ensure timely and safe delivery of your KOKO Fresh orders.
            By placing an order, you agree to the shipping terms outlined here.
          </p>
        </div>
      </section>

      {/* Scope Section */}
      <section className="py-20 bg-[#FFF9E8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 border-2 border-[#DD9627]/30">
            <h2 className="font-serif font-bold text-3xl mb-4 text-[#3B2B13]">Scope of the Policy</h2>
            <p className="text-lg text-[#6B4A0F] leading-relaxed mb-4">
              This Shipping Policy applies to all orders placed on the KOKO Fresh website.
            </p>
            <p className="text-lg text-[#6B4A0F] leading-relaxed">
              Our goal is to ensure a smooth and reliable delivery experience for our customers. By using our platform,
              you agree to the terms outlined in this policy.
            </p>
          </div>
        </div>
      </section>

      {/* Key Shipping Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl md:text-6xl mb-4 text-[#3B2B13]">
              How We{" "}
              <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
                Ship Your Spices
              </span>
            </h2>
            <p className="text-lg text-[#6B4A0F]/80 max-w-2xl mx-auto">
              From our kitchen to yours, we ensure every order is handled with care and precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shippingPolicies.map((policy, index) => (
              <Card
                key={index}
                className="group bg-white border-2 border-[#DD9627]/20 hover:border-[#DD9627]/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                    {policy.icon}
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3 text-[#3B2B13] text-center group-hover:text-[#DD9627] transition-colors">
                    {policy.title}
                  </h3>
                  <p className="text-sm text-[#3B2B13]/80 text-center mb-3 leading-relaxed">{policy.description}</p>
                  <p className="text-xs text-[#B47B2B] font-semibold text-center bg-[#FFF6CC] px-3 py-2 rounded-full">
                    {policy.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Charges Section */}
      <section className="py-20 bg-[#FFF9E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif font-bold text-4xl md:text-5xl mb-6 text-[#3B2B13]">
                Transparent <span className="text-[#DD9627]">Shipping Charges</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-[#DD9627] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#3B2B13] mb-1">Variable Pricing</h3>
                    <p className="text-[#6B4A0F]">
                      Shipping fees vary based on the order value, weight, and delivery location.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-[#DD9627] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#3B2B13] mb-1">Free Shipping Available</h3>
                    <p className="text-[#6B4A0F]">
                      Free shipping may be offered for orders exceeding a certain value, as indicated during checkout or
                      through promotional campaigns.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-[#DD9627] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#3B2B13] mb-1">Clear at Checkout</h3>
                    <p className="text-[#6B4A0F]">
                      Any applicable shipping charges will be displayed at checkout before payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-[#DD9627]/30 shadow-lg">
              <h3 className="font-serif font-bold text-2xl mb-6 text-[#3B2B13]">Shipping Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-[#EAD9A2]">
                  <span className="text-[#6B4A0F]">Order Value</span>
                  <span className="font-semibold text-[#3B2B13]">Shipping Cost</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#EAD9A2]">
                  <span className="text-[#6B4A0F]">₹0 - ₹500</span>
                  <span className="font-semibold text-[#DD9627]">₹50 - ₹100</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#EAD9A2]">
                  <span className="text-[#6B4A0F]">₹500 - ₹1000</span>
                  <span className="font-semibold text-[#DD9627]">₹30 - ₹60</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#EAD9A2]">
                  <span className="text-[#6B4A0F]">₹1000+</span>
                  <span className="font-semibold text-[#DD9627]">FREE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Issues Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl md:text-6xl mb-4 text-[#3B2B13]">
              Delivery{" "}
              <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
                Issues & Solutions
              </span>
            </h2>
            <p className="text-lg text-[#6B4A0F]/80 max-w-2xl mx-auto">
              We're here to help if anything goes wrong with your delivery. KOKO Fresh ensures the smooth delivery of
              your orders, but the following scenarios may arise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deliveryIssues.map((issue, index) => (
              <Card
                key={index}
                className="bg-white border-2 border-[#DD9627]/20 hover:border-[#DD9627]/50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <AlertCircle className="h-8 w-8 text-[#DD9627] flex-shrink-0 mt-1" />
                    <h3 className="font-serif font-bold text-xl text-[#3B2B13]">{issue.title}</h3>
                  </div>
                  <p className="text-[#6B4A0F] leading-relaxed">{issue.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Responsibilities */}
      <section className="py-20 bg-[#FFF9E8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-12 text-center text-[#3B2B13]">
            Your{" "}
            <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
              Responsibilities
            </span>
          </h2>

          <div className="space-y-6">
            {customerResponsibilities.map((responsibility, index) => (
              <div key={index} className="flex items-start gap-4 bg-white p-6 rounded-xl border-l-4 border-[#DD9627]">
                <div className="flex-shrink-0 w-8 h-8 bg-[#DD9627] text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <p className="text-lg text-[#3B2B13] leading-relaxed">{responsibility}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Returns & Refunds */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-[#DD9627]/10 to-[#FED649]/10 rounded-2xl p-8 border-2 border-[#DD9627]/20">
              <h2 className="font-serif font-bold text-4xl mb-6 text-[#3B2B13]">
                Returns & <span className="text-[#DD9627]">Refunds</span>
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-[#6B4A0F] leading-relaxed">
                  If you receive damaged, incorrect, or incomplete orders, report the issue within{" "}
                  <span className="font-bold text-[#DD9627]">24 hours</span>.
                </p>
                <p className="text-lg text-[#6B4A0F] leading-relaxed">
                  Refunds, replacements, or store credits will be processed as per our Refund Policy.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-8 w-8 text-[#DD9627] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#3B2B13] mb-2">Quick Processing</h3>
                  <p className="text-[#6B4A0F]">We process returns and refunds quickly to get you back on track.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-8 w-8 text-[#DD9627] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#3B2B13] mb-2">Multiple Options</h3>
                  <p className="text-[#6B4A0F]">Choose between refunds, replacements, or store credits.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-8 w-8 text-[#DD9627] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#3B2B13] mb-2">Hassle-Free Process</h3>
                  <p className="text-[#6B4A0F]">No complicated procedures—just reach out to our support team.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liability & Restricted Items */}
      <section className="py-20 bg-[#FFF9E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border-2 border-[#DD9627]/30 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="font-serif font-bold text-2xl mb-4 text-[#3B2B13]">Liability Disclaimer</h3>
                <p className="text-[#6B4A0F] leading-relaxed mb-4">
                  KOKO Fresh is not liable for delays, losses, or damages caused by third-party logistics providers or
                  events beyond our control.
                </p>
                <p className="text-[#6B4A0F] leading-relaxed">
                  We are not responsible for product spoilage due to improper handling or storage after delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#DD9627]/30 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="font-serif font-bold text-2xl mb-4 text-[#3B2B13]">Restricted Items</h3>
                <p className="text-[#6B4A0F] leading-relaxed mb-4">
                  Products that do not comply with food safety regulations or legal standards are strictly prohibited on
                  our platform.
                </p>
                <p className="text-[#6B4A0F] leading-relaxed">
                  Sellers found in violation may face penalties or removal from KOKO Fresh.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Policy Updates */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#FFF9E8] rounded-2xl p-8 border-2 border-[#DD9627]/30">
            <h2 className="font-serif font-bold text-3xl mb-4 text-[#3B2B13]">Changes to Shipping Policy</h2>
            <p className="text-lg text-[#6B4A0F] leading-relaxed mb-4">
              KOKO Fresh reserves the right to modify this Shipping Policy at any time.
            </p>
            <p className="text-lg text-[#6B4A0F] leading-relaxed">
              Updates will be communicated via email or notifications on the platform. Continued use of our services
              after changes implies acceptance of the revised terms.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-6">
            Questions About{" "}
            <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
              Shipping?
            </span>
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Our support team is here to help. Reach out anytime with your questions or concerns regarding shipping.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <Mail className="h-12 w-12 text-[#FED649] mx-auto mb-4" />
              <h3 className="font-serif font-bold text-xl mb-2">Email Us</h3>
              <a
                href="mailto:help@chinmaybhatk.wixsite.com/flavorzapp"
                className="text-[#FED649] hover:text-white transition-colors text-lg font-semibold"
              >
                help@chinmaybhatk.wixsite.com/flavorzapp
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <Phone className="h-12 w-12 text-[#FED649] mx-auto mb-4" />
              <h3 className="font-serif font-bold text-xl mb-2">Call Us</h3>
              <a
                href="tel:+919901360572"
                className="text-[#FED649] hover:text-white transition-colors text-lg font-semibold"
              >
                +91-9901360572
              </a>
            </div>
          </div>

          <p className="text-white/60 text-sm">
            We're available 24/7 to assist you with any shipping-related inquiries.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-6 text-[#3B2B13]">Ready to Order?</h2>
          <p className="text-xl text-[#6B4A0F]/80 mb-8 max-w-2xl mx-auto">
            Browse our collection of authentic, handcrafted spices and get them delivered fresh to your door.
          </p>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black font-bold text-lg px-10 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Shop Now
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
