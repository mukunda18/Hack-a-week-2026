"use client";

import { useState } from "react";
import PageHeader from '../components/common/PageHeader';
import ContentSection from '../components/common/ContentSection';

export default function Contact() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = "ghushmeter.admin@gmail.com"; // Admin email
    const mailSubject = encodeURIComponent(subject);
    const mailBody = encodeURIComponent(message);

    // Open user's default email client with pre-filled email
    window.location.href = `mailto:${email}?subject=${mailSubject}&body=${mailBody}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <PageHeader title="Contact Us" />

      <ContentSection>
        <p>
          Ghush-Meter is committed to responsible data use, transparency,
          and ethical reporting. If you notice incorrect information,
          technical issues, or have concerns regarding the representation
          of any organization or office on the heatmap, we encourage you
          to contact the project administrators.
        </p>
      </ContentSection>

      <ContentSection title="When should you contact us?">
        <ul className="list-disc list-inside text-gray-700 mb-5 space-y-2 pl-4">
          <li>Incorrect office location or classification</li>
          <li>Technical errors or broken features on the platform</li>
          <li>Duplicate or misleading data visualization</li>
          <li>Concerns about reputational impact on an organization</li>
          <li>Requests for data review or clarification</li>
        </ul>
      </ContentSection>

      <ContentSection>
        <p>
          All reports are reviewed carefully. Ghush-Meter does not intend
          to accuse individuals or institutions, and displayed data
          reflects aggregated public submissions rather than verified
          legal findings.
        </p>
      </ContentSection>

      <ContentSection title="How to reach the admin">
        <p>
          Please contact the Ghush-Meter admin team via email with clear
          details of the issue, including screenshots or references where
          applicable. This helps us investigate and take appropriate
          corrective action.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Incorrect heatmap data for an office"
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Message</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="6"
              placeholder="Please describe the issue clearly, including office name and location."
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 w-full md:w-auto font-medium"
          >
            Send Email
          </button>
        </form>

        <p className="text-gray-700 mt-6 pt-4 border-t border-gray-100">
          📧 Admin Email: <span className="underline font-semibold text-blue-800">ghushmeter.admin@gmail.com</span>
        </p>
      </ContentSection>
    </div>
  );
}
