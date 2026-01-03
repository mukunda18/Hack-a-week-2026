'use client';

import ContactHeader from '@/components/contact/ContactHeader';
import ImportantNotice from '@/components/contact/ImportantNotice';
import ContactCard from '@/components/contact/ContactCard';
import ProjectInfo from '@/components/contact/ProjectInfo';
import OfficialResources from '@/components/contact/OfficialResources';
import FAQSection from '@/components/contact/FAQSection';
import ProjectDisclaimer from '@/components/contact/ProjectDisclaimer';

export default function ContactPage() {
  const contactOptions = [
    {
      title: "Technical Support",
      description: "Report bugs, technical issues, or get help using the platform",
      email: "support.project@example.com"
    },
    {
      title: "General Inquiries",
      description: "Questions about the project or how it works",
      email: "info.project@example.com"
    },
    {
      title: "Feedback & Suggestions",
      description: "Share your thoughts on improving the platform",
      email: "feedback.project@example.com"
    },
    {
      title: "Collaboration",
      description: "Interested in contributing or collaborating",
      email: "collaborate.project@example.com"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          
          <ContactHeader />
          
          <ImportantNotice />

          {/* Contact Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {contactOptions.map((option, index) => (
              <ContactCard
                key={index}
                title={option.title}
                description={option.description}
                email={option.email}
              />
            ))}
          </div>

          <ProjectInfo />

          <OfficialResources />

          <FAQSection />

          <ProjectDisclaimer />
        </div>
      </div>
    </div>
  );
}