export default function FAQSection() {
  const faqs = [
    {
      question: "Is this an official government platform?",
      answer: "No. This is a student project for educational purposes. It demonstrates transparency reporting concepts but does not investigate cases or have official authority."
    },
    {
      question: "Will you share my information with authorities?",
      answer: "We do not collect personally identifiable information. All reports are anonymous by design. This is a demonstration platform for learning purposes."
    },
    {
      question: "How can I verify the platform's security?",
      answer: "This is an academic project built with modern security practices. The code follows standard anonymization methods used in transparency platforms."
    },
    {
      question: "Can I use this for real corruption reporting?",
      answer: "No. This is a prototype for educational purposes. For real corruption reports, please contact official authorities like CIAA listed above."
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="p-5 border border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
            <h4 className="font-medium text-gray-900 mb-2">
              {faq.question}
            </h4>
            <p className="text-sm text-gray-600">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}