"use client"

import { useState } from "react"

type SellerFormData = {
  fullName: string
  email: string
  phone: string
  businessName: string
  address: string
  productTypes: string
  message: string
}

export default function SellerInquiryForm() {
  const [form, setForm] = useState<SellerFormData>({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    address: "",
    productTypes: "",
    message: "",
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)
    setError(null)

    try {
      const res = await fetch("http://localhost:5000/api/seller-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Submission failed")

      setSuccess("Your seller application has been submitted 🎉")
      setForm({
        fullName: "",
        email: "",
        phone: "",
        businessName: "",
        address: "",
        productTypes: "",
        message: "",
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800">
        Sell on eDAILO
      </h2>
      <p className="text-sm text-gray-500 text-center">
        Submit your details and start selling with us
      </p>

      {/* Grid fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Business Name"
          name="businessName"
          value={form.businessName}
          onChange={handleChange}
        />
      </div>

      <Textarea
        label="Business Address"
        name="address"
        value={form.address}
        onChange={handleChange}
        required
        rows={1}
      />

      <Textarea
        label="Products You Sell"
        name="productTypes"
        value={form.productTypes}
        onChange={handleChange}
        required
        rows={1}
      />

      <Textarea
        label="Additional Message (optional)"
        name="message"
        value={form.message}
        onChange={handleChange}
        rows={2}
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl text-white font-medium transition ${
          loading
            ? "bg-primary cursor-not-allowed"
            : "bg-primary hover:bg-primary-700"
        }`}
      >
        {loading ? "Submitting..." : "Apply to Sell"}
      </button>

      {success && <p className="text-sucess text-center">{success}</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}
    </form>
  )
}

/* ---------- Reusable Inputs ---------- */

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
    </div>
  )
}

function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        {...props}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
      />
    </div>
  )
}
