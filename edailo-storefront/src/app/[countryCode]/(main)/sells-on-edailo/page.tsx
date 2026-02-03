// app/sell-on-edailo/page.tsx
"use client"; // This page is a client component because it contains form interaction

import SellerInquiryForm from "@modules/common/components/seller-inquiry-form";

export default function SellOnEdailoPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      

     
        <SellerInquiryForm />
    
    </main>
  );
}
