"use client"

import { useState } from "react"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  Twitter,
  Youtube,
  Zap,
  Heart,
  Headphones,
  Package,
  Users,
} from "lucide-react"



export default function ContactPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
    newsletter: false,
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    setFormData({
      ...formData,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // ✅ Map frontend → Wix schema keys
      const submissions: Record<string, any> = {}

      if (formData.first_name) submissions["first_name_7a97"] = formData.first_name
      if (formData.last_name) submissions["last_name_8c5e"] = formData.last_name
      if (formData.email) submissions["email_0b8a"] = formData.email
      if (formData.phone) {
        // PhoneInput already provides formatted number with country code
        submissions["phone_6f6c"] = formData.phone
      }
      if (formData.topic) submissions["topic"] = formData.topic
      if (formData.message) submissions["message"] = formData.message
      submissions["form_field_4f50"] = formData.newsletter

      const payload = {
        submission: {
          submissions,
          status: "PENDING",
        },
      }

      console.log("📦 Final payload:", payload)

      const res = await fetch("/api/form-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      if (res.ok && result.success) {
        setSuccess(true)
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          topic: "",
          message: "",
          newsletter: false,
        })
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch (err) {
      console.error(err)
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

 const handlePhoneChange = (value: string) => {
  setFormData((prev) => ({ ...prev, phone: value || "" }))
}

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
<section className="relative pt-2 pb-2 flex items-center justify-center overflow-hidden bg-black mt-16 md:mt-24">

  <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
    {/* Tagline Pill */}
   

    {/* Main Heading - matches KOKOFRESH font & gradient */}
    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-wide mb-6 bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent leading-tight">
      Let’s Talk Spices
    </h1>

    {/* Subheading */}
    <p className="text-2xl md:text-3xl mb-4 font-bold text-white">
      Got Questions? We've Got <span className="text-[#FED649]">Answers</span> 🌶️
    </p>

    {/* Description */}
    <p className="text-lg md:text-xl mb-12 text-white/80 max-w-3xl mx-auto leading-relaxed">
      Whether you need cooking tips, have feedback, or just want to chat about spices — we’re always up for a flavorful conversation.
    </p>
  </div>
</section>


      {/* Contact Methods */}
<section className="p-4 bg-gradient-to-br from-[#DD9627] via-[#FED649] to-[#B47B2B] text-[#3B2B13]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Heading */}
    <div className="text-center mb-16">
      <h2 className="font-serif text-4xl md:text-6xl font-bold tracking-wide mb-6 text-[#3B2B13]">
        Choose Your{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4B3A1F] via-[#7B5617] to-[#3B2B13]">
          Vibe
        </span>
      </h2>
      <p className="text-xl text-[#4B3A1F]/90">
        Pick the way you want to connect. We're everywhere you are.
      </p>
    </div>

    {/* Contact Options Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
  {[
    {
      icon: <Instagram className="h-12 w-12 text-[#4B3A1F]" />,
      title: "Social DMs",
      description:
        "Slide into our DMs on Instagram or Twitter. We're pretty active.",
      action: "@kokofresh",
      highlight: "Most Fun",
    },
    {
      icon: <Mail className="h-12 w-12 text-[#4B3A1F]" />,
      title: "Email Us",
      description:
        "For detailed questions or business inquiries. We reply within 24 hours.",
      action: "help@chinmaybhatk.wixsite.com/flavorzapp",
      highlight: "Most Detailed",
    },
    {
      icon: <Phone className="h-12 w-12 text-[#4B3A1F]" />,
      title: "Call Us",
      description: "Sometimes you just need to talk it out. We get it.",
      action: "+91 7892776610",
      highlight: "Most Personal",
    },
  ].map((method, index) => (
    <Card
      key={index}
      className="group hover:shadow-xl transition-all duration-300  border-2 border-[#C79A25]/40 bg-white/90 backdrop-blur-md text-[#3B2B13]"
    >
      <CardContent className="p-8 text-center">
        <div className="mb-6 flex justify-center">{method.icon}</div>
        <div className="inline-block bg-[#FED649]/30 text-[#4B3A1F] font-semibold px-3 py-1 rounded-full text-xs mb-4">
          {method.highlight}
        </div>
        <h3 className="font-serif font-bold text-2xl mb-4 text-[#3B2B13]">
          {method.title}
        </h3>
        <p className="text-[#4B3A1F]/80 mb-6 leading-relaxed">
          {method.description}
        </p>
        <Button className="w-full bg-[#3B2B13] hover:bg-[#4B3A1F] text-[#FED649] font-bold shadow-md">
          {method.action}
        </Button>
      </CardContent>
    </Card>
  ))}
</div>

  </div>
</section>



      {/* Contact Form (Updated with working logic) */}
      <section className="py-20 bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl md:text-6xl mb-6 text-balance">
  Drop Us a{" "}
  <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
    Line
  </span>
</h2>

            <p className="text-xl text-muted-foreground">
              Fill out the form below and we'll get back to you faster than you can say "garam masala"
            </p>
          </div>

          <Card className="border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-card-foreground mb-2">First Name *</label>
                    <Input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="What should we call you?"
                      className="border-2 border-muted focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-card-foreground mb-2">Last Name</label>
                    <Input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="(Optional)"
                      className="border-2 border-muted focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-card-foreground mb-2">Email Address *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="border-2 border-muted focus:border-primary"
                    required
                  />
                </div>

                <div>
  <label className="block text-sm font-bold text-card-foreground mb-2">
    Phone *
  </label>

  <PhoneInput
    defaultCountry="in"
    value={formData.phone}
    onChange={(value) => handlePhoneChange(value)}
    inputClassName="!w-full border-2 border-muted focus:border-primary rounded-md h-12 text-base"
    className="!w-full"
    countrySelectorStyleProps={
        {
          buttonClassName:
            "border-muted hover:bg-primary/10 rounded-l-md focus:outline-none",
          dropdownArrowClassName: "text-muted-foreground",
          searchPlaceholder: "Search country...",
          showSearch: true, // 👈 enables country search feature
        } as any
      }
  />
</div>



                <div>
                  <label className="block text-sm font-bold text-card-foreground mb-2">What's This About? *</label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-muted focus:border-primary rounded-md bg-background"
                    required
                  >
                    <option value="">Choose your topic...</option>
                    <option value="Product Questions">Product Questions</option>
                    <option value="Order Support">Order Support</option>
                    <option value="Recipe Help">Recipe Help</option>
                    <option value="Business Inquiry">Business Inquiry</option>
                    <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                    <option value="Press & Media">Press & Media</option>
                    <option value="Just Saying Hi!">Just Saying Hi!</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-card-foreground mb-2">Tell Us More *</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Spill the tea... or should we say, spill the spices? 🌶️"
                    rows={6}
                    className="border-2 border-muted focus:border-primary resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleChange}
                    className="rounded border-2 border-muted"
                  />
                  <label htmlFor="newsletter" className="text-sm text-muted-foreground">
                    Yes, I want to receive recipe tips, new product updates, and exclusive offers!
                  </label>
                </div>

                {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                {success && (
                  <p className="text-green-600 text-sm font-bold">✅ Thank you! Your message has been submitted.</p>
                )}

           <Button
  type="submit"
  size="lg"
  disabled={loading}
  className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-90 text-black font-bold text-lg py-4 flex items-center justify-center"
>
  {loading ? "Sending..." : "Send Message"}
  <ArrowRight className="ml-2 h-5 w-5" />
</Button>

              </form>
            </CardContent>
          </Card>
        </div>
      </section>

            {/* FAQ Section */}
<section className="py-20 bg-black text-white font-sans">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="text-center mb-16">
      <h2 className="font-serif font-bold text-4xl md:text-6xl mb-6 text-balance">
        Quick{" "}
        <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
          Answers
        </span>
      </h2>
      <p className="text-lg md:text-xl text-[#FED649]/80 font-light">
        The questions everyone asks (and the answers that'll save you time)
      </p>
    </div>

    {/* FAQ Grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        {
          question: "What does ‘KOKO Fresh’ mean for your masalas?",
          answer:
            "Freshness is our promise. We grind spices in small batches and label each pack with the Date of Blending so you always enjoy pure, aromatic flavor.",
        },
        {
          question: "How fast is delivery across India?",
          answer:
            "We deliver anywhere in India within 2–4 business days. Orders above ₹250 get free shipping, so your favorite spices reach you faster.",
        },
        {
          question: "Are your spices organic and where are they sourced from?",
          answer:
            "Our spices come from trusted partner farms that follow clean and sustainable farming. We believe in honest, farm-to-packet freshness.",
        },
        {
          question: "Do you supply for restaurants or bulk orders?",
          answer:
            "Yes! We love partnering with chefs, cafes, and caterers. Just write to us at help@chinmaybhatk.wixsite.com/flavorzapp for bulk orders or quotes.",
        },
        {
          question: "Are your masalas free from artificial colours and preservatives?",
          answer:
            "Absolutely. Our promise is 100% pure, natural spices. We never add artificial colours, preservatives, or fillers. What you get is just the authentic, unadulterated flavour of premium quality ingredients.",
        },
        {
          question: "How should I store my spices to maintain their freshness?",
          answer:
            "For the best aroma and potency, store your KOKO Fresh masalas in a cool, dark, and dry place away from direct sunlight. Our resealable packs are designed to lock in freshness, but an airtight container is always ideal.",
        },
      ].map((faq, index) => (
        <Card
          key={index}
          className="bg-[#0D0D0D] border border-[#DD9627]/30 hover:border-[#FED649]/60 rounded-2xl transition-all duration-300"
        >
          <CardContent className="p-6">
            <div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-[#FED649] tracking-wide">
                {faq.question}
              </h3>
              <p className="text-[#E6E6E6]/90 leading-relaxed font-light tracking-wide">
                {faq.answer}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>



      {/* Office Info */}
 <section className="py-20 bg-gradient-to-br from-[#DD9627] via-[#FED649] to-[#B47B2B] text-[#2C1B00] font-sans">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Left Content */}
      <div>
        <h2 className="font-serif font-black text-4xl md:text-5xl mb-6 text-balance">
          Come Say <span className="text-black">Hi</span>
        </h2>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 text-black mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1 text-black">Our HQ</h3>
              <p className="text-black/80 leading-relaxed">
                CKGFlavorz FoodTech Pvt Ltd
                <br />
                112, 17th main road, MIG KHB Colony
                <br />
                5th block, Koramangala
                <br />
                Bangalore 560095
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-black mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1 text-black">Office Hours</h3>
              <p className="text-black/80 leading-relaxed">
                Monday - Friday: 9:00 AM - 6:00 PM IST
                <br />
                Saturday: 10:00 AM - 4:00 PM IST
                <br />
                Sunday: Closed (we're grinding spices)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 text-black mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1 text-black">Email Addresses</h3>
              <p className="text-black/80 leading-relaxed">
                General: help@chinmaybhatk.wixsite.com/flavorzapp
                <br />
                Business: business@kokofresh.com
                <br />
                Press: press@kokofresh.com
              </p>
            </div>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-black text-black hover:bg-black hover:text-[#FED649] transition"
          >
            <a
              href="https://www.instagram.com/koko_fresh_india?igsh=dHltYm0waWVtZTdu"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="mr-2 h-4 w-4" />
              @koko_fresh_india
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-black text-black hover:bg-black hover:text-[#FED649] transition"
          >
            <a
              href="https://x.com/KOKOFresh_IN"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="mr-2 h-4 w-4" />
              @KOKOFresh_IN
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-black text-black hover:bg-black hover:text-[#FED649] transition"
          >
            <a
              href="https://youtube.com/@kokofresh_in?si=LxQ0HnklH4rC0Ojc"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Youtube className="mr-2 h-4 w-4" />
              KOKO Fresh
            </a>
          </Button>
        </div>
      </div>

      {/* Right Map Card */}
      <div className="relative">
        <div className="rounded-2xl shadow-2xl overflow-hidden bg-white border-2 border-black/30">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.243859362772!2d77.6278958153479!3d12.935432919215295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15d1a6edc6db%3A0xb1d6f26a9a7b6ef4!2sCKGFlavorz%20FoodTech%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-96"
            title="CKGFlavorz FoodTech Office Location"
          />
        </div>

        <div className="absolute -bottom-6 -left-6 bg-black text-[#FED649] rounded-2xl p-6 shadow-xl">
          <div className="text-2xl font-black mb-2">📍</div>
          <div className="text-sm font-medium">Find Us Here</div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* CTA Section */}
<section className="py-20 bg-white text-gray-900">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <h2 className="font-black text-4xl md:text-6xl mb-6 text-balance">
      Still Have{" "}
      <span className="bg-gradient-to-r from-[#DD962Let’s Talk Spices7] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
        Questions?
      </span>
    </h2>
    <p className="text-xl mb-10 text-muted-foreground">
      Don’t be shy! We love talking about spices almost as much as we love making them.
      Reach out and let’s start a conversation.
    </p>

    <div className="flex flex-col sm:flex-row gap-6 justify-center">
      {/* Gradient Background Button */}
      {/* <Button
        size="lg"
        className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black hover:from-[#DD9627]/90 hover:via-[#FED649]/90 hover:to-[#B47B2B]/90 font-bold text-lg px-8 py-4 flex items-center justify-center"
      >
        Start Live Chat
        <MessageCircle className="ml-2 h-5 w-5" />
      </Button> */}

      {/* Gradient Border / Outline Button */}
<Button
  asChild
  size="lg"
  className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-bold text-lg px-8 py-4 flex items-center justify-center hover:brightness-90"
>
  <a
    href="https://www.instagram.com/koko_fresh_india?igshid=MmVlMjlkMTBhMg=="
    target="_blank"
    rel="noopener noreferrer"
  >
    <Instagram className="mr-2 h-5 w-5" />
    DM Us on Instagram
  </a>
</Button>

    </div>

    <p className="text-sm mt-8 text-muted-foreground">
      ✨ Response time: Usually under 2 hours ✨
    </p>
  </div>
</section>








      <Footer />
    </div>
  )
}
