"use client";

import { useState } from "react";

type CustomerFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function CustomerInquiryForm() {
  const [form, setForm] = useState<CustomerFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:5000/api/customer-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSuccess("Message sent successfully!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      />

      <input
        name="email"
        type="email"
        placeholder="Email Address"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      />

      <input
        name="subject"
        placeholder="Subject"
        value={form.subject}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      />

      <textarea
        name="message"
        placeholder="Your Message"
        rows={3}
        value={form.message}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded-md resize-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-700 transition disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>

      {success && <p className="text-sucess text-sm text-center">{success}</p>}
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
    </form>
  );
}
