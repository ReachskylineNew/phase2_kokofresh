"use client"

import { Footer } from "@/components/footer"
import Navigation from "@/components/navigation"


export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            <span className="bg-gradient-to-r from-[#FED649] via-[#DD9627] to-[#B47B2B] bg-clip-text text-transparent">
              Refund Policy
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            At KOKO Fresh, customer satisfaction is our priority. This Refund Policy outlines the conditions and
            processes for requesting refunds, ensuring fairness and clarity for all parties involved.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="space-y-8">
            {/* Section 1 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">1. Eligibility for Refunds</h2>
              <p className="text-gray-700 mb-4">Refunds will be considered under the following circumstances:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    <strong>Damaged or Defective Products:</strong> If the product delivered is damaged, defective, or
                    does not match the description provided on the platform.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    <strong>Missing Items:</strong> If an order is incomplete or items are missing.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    <strong>Delivery Issues:</strong> If the product is not delivered within the specified timeframe due
                    to reasons within the seller's control.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">
                2. Non-Refundable Situations
              </h2>
              <p className="text-gray-700 mb-4">Refunds will not be issued under these conditions:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>Products that have been consumed, tampered with, or improperly stored after delivery.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    Delays caused by factors beyond KOKO Fresh's or the seller's control (e.g., weather, strikes, or
                    natural disasters).
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>Change of mind after the order has been delivered.</span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">
                3. Timeframe for Requesting Refunds
              </h2>
              <p className="text-gray-700">
                Refund requests must be submitted within <strong>48 hours</strong> of receiving the order. Requests
                submitted beyond this timeframe will not be eligible for a refund.
              </p>
            </div>

            {/* Section 4 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">
                4. Process for Requesting Refunds
              </h2>
              <p className="text-gray-700 mb-4">To request a refund, follow these steps:</p>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">1.</span>
                  <span>
                    <strong>Contact Support:</strong> Email help@chinmaybhatk.wixsite.com/flavorzapp or call +91-9901360572 within 48 hours of
                    receiving the order.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">2.</span>
                  <span>
                    <strong>Provide Proof:</strong> Submit clear photographs or videos of the product showing the
                    damage, defect, or issue. Include order details (order ID, date, and item name).
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">3.</span>
                  <span>
                    <strong>Review Process:</strong> Once your request is received, our team will review it in
                    consultation with the seller and respond within 3–5 business days.
                  </span>
                </li>
              </ol>
            </div>

            {/* Section 5 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">
                5. Refund Resolution Options
              </h2>
              <p className="text-gray-700 mb-4">
                If your refund request is approved, you may choose one of the following:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    <strong>Replacement:</strong> The seller will resend the product at no additional cost.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    <strong>Refund to Original Payment Method:</strong> The amount will be credited back to the payment
                    method used at the time of purchase. This process may take 7–10 business days, depending on your
                    bank or payment provider.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    <strong>Store Credit:</strong> You may opt to receive the refund as store credit, which can be used
                    for future purchases on KOKO Fresh.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">6. Conditions for Refunds</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>Refunds will only be processed after verifying the issue.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    KOKO Fresh reserves the right to reject refund requests if sufficient proof is not provided or if
                    the claim is found to be invalid.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 7 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">7. Cancellations</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    Orders can be canceled before they are shipped. Once shipped, the order is no longer eligible for
                    cancellation.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>Cancellations may be subject to a restocking fee, depending on the seller's policy.</span>
                </li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">8. Disputes</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    In the event of disputes regarding refunds, KOKO Fresh will mediate between the buyer and seller to
                    reach a resolution.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>Final decisions will be made by KOKO Fresh based on the evidence provided.</span>
                </li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">
                9. Changes to the Refund Policy
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    KOKO Fresh reserves the right to modify this Refund Policy at any time. Changes will be communicated
                    via email or platform notifications.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>
                    Continued use of the platform after changes implies acceptance of the updated Refund Policy.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-8 text-center">10. Contact Us</h2>
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <p className="text-gray-700 mb-6 text-center">For any refund-related inquiries, please reach out to us:</p>
            <div className="space-y-4 text-center">
              <div>
                <p className="text-gray-600 mb-2">Email</p>
                <a
                  href="mailto:help@chinmaybhatk.wixsite.com/flavorzapp"
                  className="text-[#DD9627] font-semibold hover:text-[#B47B2B] transition-colors"
                >
                  help@chinmaybhatk.wixsite.com/flavorzapp
                </a>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Phone</p>
                <a
                  href="tel:+919901360572"
                  className="text-[#DD9627] font-semibold hover:text-[#B47B2B] transition-colors"
                >
                  +91-9901360572
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Your Satisfaction Matters</h2>
          <p className="text-gray-300 mb-8 text-lg">
            By using KOKO Fresh, you agree to this Refund Policy. We are committed to providing a delightful experience
            and addressing your concerns promptly and fairly.
          </p>
          <a
            href="/"
            className="inline-block bg-[#DD9627] hover:bg-[#B47B2B] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Back to Home
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
