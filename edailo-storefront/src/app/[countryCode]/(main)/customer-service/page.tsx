import CustomerInquiryForm from "@modules/common/components/customer-inguiry-form";

export default function CustomerServicePage() {
  return (
    <section className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Customer Service
        </h1>

        <p className="text-sm text-gray-600 text-center mb-4">
          Need help? Send us a message and our team will contact you shortly.
        </p>

        <CustomerInquiryForm />
      </div>
    </section>
  );
}
