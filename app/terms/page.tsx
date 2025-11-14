"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            <span className="bg-gradient-to-r from-[#FED649] via-[#DD9627] to-[#B47B2B] bg-clip-text text-transparent">
              Terms of Use
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            Please read these terms of use carefully before using our services. By accessing or using KOKO Fresh, you agree to be bound by these terms.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="space-y-8">
            {/* Section 1 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using KOKO Fresh's website and services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p className="text-gray-700">
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily download one copy of the materials on KOKO Fresh's website for personal, non-commercial transitory viewing only.
              </p>
              <p className="text-gray-700">
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-3 text-gray-700 mt-4">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>Modify or copy the materials</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>Use the materials for any commercial purpose or for any public display</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>Attempt to decompile or reverse engineer any software contained on the website</span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">3. Product Information</h2>
              <p className="text-gray-700 mb-4">
                We strive to provide accurate product descriptions and pricing information. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>
              <p className="text-gray-700">
                All products are subject to availability. We reserve the right to discontinue any product at any time.
              </p>
            </div>

            {/* Section 4 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">4. Pricing and Payment</h2>
              <p className="text-gray-700 mb-4">
                All prices are listed in Indian Rupees (INR) and are subject to change without notice. Payment is due at the time of order unless otherwise specified.
              </p>
              <p className="text-gray-700">
                We accept various payment methods as indicated on our website. You agree to provide current, complete, and accurate purchase and account information.
              </p>
            </div>

            {/* Section 5 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">5. Shipping and Delivery</h2>
              <p className="text-gray-700 mb-4">
                We will make reasonable efforts to deliver products within the estimated timeframe. However, delivery dates are estimates only and we are not liable for delays.
              </p>
              <p className="text-gray-700">
                Risk of loss and title for items pass to the buyer upon delivery to the carrier.
              </p>
            </div>

            {/* Section 6 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">6. Returns and Refunds</h2>
              <p className="text-gray-700 mb-4">
                Please refer to our Refund Policy for detailed information about returns and refunds. The Refund Policy is incorporated into these Terms of Use by reference.
              </p>
              <p className="text-gray-700">
                We reserve the right to refuse returns or refunds if the product has been damaged, tampered with, or used inappropriately.
              </p>
            </div>

            {/* Section 7 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">7. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times.
              </p>
              <p className="text-gray-700">
                You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </div>

            {/* Section 8 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">8. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our products or services:</p>
              <ul className="space-y-3 text-gray-700 mt-4">
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>For any unlawful purpose or to solicit others to perform unlawful acts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#DD9627] font-bold mr-3">•</span>
                  <span>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</span>
                </li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall CKGFLAVORZ FOODTECH PRIVATE LIMITED, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
              <p className="text-gray-700">
                Our total liability shall not exceed the amount paid by you for the products purchased.
              </p>
            </div>

            {/* Section 10 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">10. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be interpreted and governed by the laws of India. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </div>

            {/* Section 11 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-700">
                What constitutes a material change will be determined at our sole discretion.
              </p>
            </div>

            {/* Section 12 */}
            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 hover:border-[#DD9627] transition-colors">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Use, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Business Name:</strong> CKGFLAVORZ FOODTECH PRIVATE LIMITED
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> help@kokofresh.in
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +91-7892776610
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> 112, 17th main road, MIG KHB Colony, 5th block, Koramangala, Bangalore 560095
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Questions About Our Terms?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            We're here to help clarify any concerns you might have about our terms of use.
          </p>
          <a
            href="/contact"
            className="inline-block bg-[#DD9627] hover:bg-[#B47B2B] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
