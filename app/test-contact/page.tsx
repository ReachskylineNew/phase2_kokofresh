"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight, MessageCircle } from "lucide-react"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

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
    const { name, type, value } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: `+${value}` }) // ensures + prefix
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const submissions: Record<string, any> = {}

      if (formData.first_name) submissions["first_name_7a97"] = formData.first_name
      if (formData.last_name) submissions["last_name_8c5e"] = formData.last_name
      if (formData.email) submissions["email_0b8a"] = formData.email
      if (formData.phone) submissions["phone_6f6c"] = formData.phone
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-20 bg-card/30">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                  />
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                  />
                </div>

                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />

                {/* ✅ Full country phone input */}
                <div>
                  <label className="block text-sm font-bold mb-2">Phone</label>
                  <PhoneInput
                    country={"in"}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputStyle={{
                      width: "100%",
                      border: "2px solid #ccc",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  />
                </div>

                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border-2 border-muted focus:border-primary rounded-md bg-background"
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

                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Your message..."
                  required
                />

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleChange}
                  />
                  <label htmlFor="newsletter">Subscribe to newsletter</label>
                </div>

                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-600">✅ Thank you! Your message has been submitted.</p>}

                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
