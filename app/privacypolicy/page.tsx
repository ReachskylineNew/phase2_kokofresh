"use client"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Eye, Share2, FileText, Mail, ArrowRight, CheckCircle } from "lucide-react"

export default function PrivacyPage() {
  const dataCollectionItems = [
    {
      icon: <FileText className="h-12 w-12 text-[#DD9627]" />,
      title: "Basic Information",
      description: "Name, email address, phone number, and other contact details.",
    },
    {
      icon: <Lock className="h-12 w-12 text-[#DD9627]" />,
      title: "Payment Information",
      description: "Credit/debit card details, payment method, and billing address.",
    },
    {
      icon: <Share2 className="h-12 w-12 text-[#DD9627]" />,
      title: "Order Information",
      description: "Details about your orders, including items purchased, delivery addresses, and payment information.",
    },
    {
      icon: <Eye className="h-12 w-12 text-[#DD9627]" />,
      title: "Device Information",
      description:
        "Information about the device you use to access our services, such as IP address, browser type, and operating system.",
    },
  ]

  const userRights = [
    {
      title: "Right to Access",
      description: "You have the right to access your personal data held by us.",
    },
    {
      title: "Right to Correction",
      description: "You have the right to request the correction of inaccurate or incomplete personal data.",
    },
    {
      title: "Right to Erasure",
      description: "You have the right to request the deletion of your personal data under certain conditions.",
    },
    {
      title: "Right to Data Portability",
      description:
        "You have the right to receive your personal data in a structured, commonly used, and machine-readable format.",
    },
    {
      title: "Right to Restrict Processing",
      description:
        "You have the right to request the restriction of processing your personal data under certain conditions.",
    },
    {
      title: "Right to Object",
      description: "You have the right to object to the processing of your personal data for marketing purposes.",
    },
  ]

  const escalationLevels = [
    {
      level: "Level 1",
      title: "Customer Support Team",
      email: "help@chinmaybhatk.wixsite.com/flavorzapp",
      phone: "+917899587137",
      responseTime: "Within 24 hours",
      resolutionTime: "Up to 48 hours",
    },
    {
      level: "Level 2",
      title: "Operations Head",
      email: "hitesh@theflavorz.com",
      phone: "+917899587137",
      responseTime: "Within 48 hours from escalation",
      resolutionTime: "Up to 5 business days",
    },
    {
      level: "Level 3",
      title: "Executive Team",
      email: "ceo@theflavorz.com",
      phone: "N/A",
      responseTime: "Within 72 hours from escalation",
      resolutionTime: "Up to 7 business days",
    },
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
          <Badge className="bg-[#FED649] text-black mb-6 px-4 py-2 text-sm font-semibold">🔒 Privacy Policy</Badge>

          <h1 className="font-serif font-black text-5xl md:text-7xl mb-6 leading-tight">
            Your Data,{" "}
            <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
              Your Privacy
            </span>
          </h1>

          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            We are committed to protecting your personal data in compliance with the Digital Personal Data Protection
            Act, 2023 (DPDP Act). Last updated: 30th January 2025
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-[#FFF9E8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 border-2 border-[#DD9627]/30">
            <h2 className="font-serif font-bold text-3xl mb-4 text-[#3B2B13]">Introduction</h2>
            <p className="text-lg text-[#6B4A0F] leading-relaxed">
              This Privacy Policy explains how CKGFLAVORZ FOODTECH PRIVATE LIMITED collects, uses, and protects your personal
              data when you use our services via our Android and iOS applications. By using our platform, you agree to
              the terms outlined in this policy.
            </p>
          </div>
        </div>
      </section>

      {/* Data Collection Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl md:text-6xl mb-4 text-[#3B2B13]">
              Personal Data We{" "}
              <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
                Collect
              </span>
            </h2>
            <p className="text-lg text-[#6B4A0F]/80 max-w-2xl mx-auto">
              We collect only the information necessary to provide you with the best service possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataCollectionItems.map((item, index) => (
              <Card
                key={index}
                className="group bg-white border-2 border-[#DD9627]/20 hover:border-[#DD9627]/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3 text-[#3B2B13] text-center group-hover:text-[#DD9627] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#3B2B13]/80 text-center leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How We Use Data Section */}
      <section className="py-20 bg-[#FFF9E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-12 text-center text-[#3B2B13]">
            How We Use Your <span className="text-[#DD9627]">Personal Data</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "To Provide Services",
                desc: "To process and fulfil your orders, including payment processing and delivery.",
              },
              { title: "Customer Support", desc: "To respond to your inquiries and provide customer support." },
              {
                title: "Improving Services",
                desc: "To analyze and improve our services, including personalizing your experience and improving app performance.",
              },
              {
                title: "Legal Compliance",
                desc: "To comply with legal obligations, including tax laws and regulations.",
              },
              {
                title: "Marketing & Communication",
                desc: "To send you promotional offers, newsletters, and other communications, subject to your consent.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border-l-4 border-[#DD9627]">
                <h3 className="font-serif font-bold text-lg text-[#3B2B13] mb-2">{item.title}</h3>
                <p className="text-[#6B4A0F]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sharing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-12 text-center text-[#3B2B13]">
            Data Sharing & <span className="text-[#DD9627]">Disclosure</span>
          </h2>

          <div className="space-y-6">
            {[
              {
                title: "Service Providers",
                desc: "We may share your data with third-party service providers who assist us in providing our services, such as payment processors and delivery partners.",
              },
              {
                title: "Delivery Partners",
                desc: "To complete the delivery of your orders, we share necessary information, such as your name, delivery address, and contact details, with our delivery partners.",
              },
              {
                title: "Legal Requirements",
                desc: "We may disclose your data if required by law or to protect our rights, property, or safety.",
              },
            ].map((item, index) => (
              <Card key={index} className="bg-white border-2 border-[#DD9627]/20 rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <Shield className="h-8 w-8 text-[#DD9627] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-serif font-bold text-xl text-[#3B2B13] mb-2">{item.title}</h3>
                      <p className="text-[#6B4A0F] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Security & Retention */}
      <section className="py-20 bg-[#FFF9E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white border-2 border-[#DD9627]/30 rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Lock className="h-8 w-8 text-[#DD9627] flex-shrink-0" />
                  <h3 className="font-serif font-bold text-2xl text-[#3B2B13]">Data Security</h3>
                </div>
                <p className="text-[#6B4A0F] leading-relaxed">
                  We take appropriate technical and organizational measures to protect your personal data from
                  unauthorized access, disclosure, alteration, and destruction.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#DD9627]/30 rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <FileText className="h-8 w-8 text-[#DD9627] flex-shrink-0" />
                  <h3 className="font-serif font-bold text-2xl text-[#3B2B13]">Data Retention</h3>
                </div>
                <p className="text-[#6B4A0F] leading-relaxed">
                  We retain your personal data for as long as necessary to fulfil the purposes for which it was
                  collected, or as required by applicable laws.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Your Rights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl md:text-6xl mb-4 text-[#3B2B13]">
              Your{" "}
              <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
                Rights
              </span>
            </h2>
            <p className="text-lg text-[#6B4A0F]/80 max-w-2xl mx-auto">
              Under the DPDP Act, you have the following rights regarding your personal data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRights.map((right, index) => (
              <Card
                key={index}
                className="bg-white border-2 border-[#DD9627]/20 hover:border-[#DD9627]/50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-[#DD9627] flex-shrink-0 mt-1" />
                    <h3 className="font-serif font-bold text-lg text-[#3B2B13]">{right.title}</h3>
                  </div>
                  <p className="text-[#6B4A0F] text-sm leading-relaxed">{right.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Exercise Your Rights */}
      <section className="py-20 bg-[#FFF9E8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 border-2 border-[#DD9627]/30">
            <h2 className="font-serif font-bold text-3xl mb-6 text-[#3B2B13]">How to Exercise Your Rights</h2>
            <p className="text-lg text-[#6B4A0F] leading-relaxed mb-6">
              To exercise any of your rights, please contact us at:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-[#DD9627]" />
                <a href="https://chinmaybhatk.wixsite.com/flavorzapp" className="text-[#DD9627] font-semibold hover:underline">
                  https://chinmaybhatk.wixsite.com/flavorzapp
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#DD9627]" />
                <a href="mailto:help@chinmaybhatk.wixsite.com/flavorzapp" className="text-[#DD9627] font-semibold hover:underline">
                  help@chinmaybhatk.wixsite.com/flavorzapp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Escalation Matrix */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl md:text-6xl mb-4 text-[#3B2B13]">
              Support <span className="text-[#DD9627]">Escalation Matrix</span>
            </h2>
            <p className="text-lg text-[#6B4A0F]/80 max-w-2xl mx-auto">
              We are committed to providing prompt and effective support. Follow our escalation matrix for efficient
              resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {escalationLevels.map((level, index) => (
              <Card key={index} className="bg-white border-2 border-[#DD9627]/20 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#DD9627] to-[#B47B2B] px-6 py-4">
                  <h3 className="font-serif font-bold text-xl text-white">{level.level}</h3>
                </div>
                <CardContent className="p-6">
                  <h4 className="font-serif font-bold text-lg text-[#3B2B13] mb-4">{level.title}</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[#B47B2B] font-semibold mb-1">Email:</p>
                      <a href={`mailto:${level.email}`} className="text-[#DD9627] hover:underline">
                        {level.email}
                      </a>
                    </div>
                    {level.phone !== "N/A" && (
                      <div>
                        <p className="text-[#B47B2B] font-semibold mb-1">Phone:</p>
                        <a href={`tel:${level.phone}`} className="text-[#DD9627] hover:underline">
                          {level.phone}
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-[#B47B2B] font-semibold mb-1">Response Time:</p>
                      <p className="text-[#6B4A0F]">{level.responseTime}</p>
                    </div>
                    <div>
                      <p className="text-[#B47B2B] font-semibold mb-1">Resolution Time:</p>
                      <p className="text-[#6B4A0F]">{level.resolutionTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Updates & Contact */}
      <section className="py-20 bg-[#FFF9E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white border-2 border-[#DD9627]/30 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="font-serif font-bold text-2xl mb-4 text-[#3B2B13]">Changes to This Policy</h3>
                <p className="text-[#6B4A0F] leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. The updated policy will be posted on our app and
                  website.
                </p>
                <p className="text-[#6B4A0F] leading-relaxed">
                  Your continued use of our services after any changes to this policy constitutes your acceptance of the
                  new policy.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#DD9627]/30 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="font-serif font-bold text-2xl mb-4 text-[#3B2B13]">Contact Information</h3>
                <p className="text-[#6B4A0F] leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="space-y-2">
                  <p className="text-[#6B4A0F]">
                    <span className="font-semibold">CKGFLAVORZ FOODTECH PRIVATE LIMITED</span>
                  </p>
                  <a href="https://chinmaybhatk.wixsite.com/flavorzapp" className="text-[#DD9627] hover:underline block">
                    https://chinmaybhatk.wixsite.com/flavorzapp
                  </a>
                  <a href="mailto:help@chinmaybhatk.wixsite.com/flavorzapp" className="text-[#DD9627] hover:underline block">
                    help@chinmaybhatk.wixsite.com/flavorzapp
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-6 text-[#3B2B13]">Your Privacy Matters</h2>
          <p className="text-xl text-[#6B4A0F]/80 mb-8 max-w-2xl mx-auto">
            We're committed to protecting your data and maintaining your trust. Shop with confidence knowing your
            information is secure.
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

import { Globe } from "lucide-react"
