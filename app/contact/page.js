"use client";

import { useState } from "react";

export default function Contact() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("Email sent successfully!");
        setSubject("");
        setMessage("");
      } else {
        setStatus("Failed to send email. Try again later.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Failed to send email. Try again later.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

      <p className="text-gray-700 mb-5">
        Ghush-Meter is committed to responsible data use, transparency,
        and ethical reporting. If you notice incorrect information,
        technical issues, or have concerns regarding the representation
        of any organization or office on the heatmap, we encourage you
        to contact the project administrators.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        When should you contact us?
      </h2>

      <ul className="list-disc list-inside text-gray-700 mb-5 space-y-2">
        <li>Incorrect office location or classification</li>
        <li>Technical errors or broken features on the platform</li>
        <li>Duplicate or misleading data visualization</li>
        <li>Concerns about reputational impact on an organization</li>
        <li>Requests for data review or clarification</li>
      </ul>

      <p className="text-gray-700 mb-5">
        All reports are reviewed carefully. Ghush-Meter does not intend
        to accuse individuals or institutions, and displayed data
        reflects aggregated public submissions rather than verified
        legal findings.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        How to reach the admin
      </h2>

      <p className="text-gray-700 mb-6">
        Please contact the Ghush-Meter admin team via email with clear
        details of the issue, including screenshots or references where
        applicable. This helps us investigate and take appropriate
        corrective action.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Subject</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Incorrect heatmap data for an office"
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
        >
          Send Email
        </button>
      </form>

      {status && <p className="mt-4 text-gray-700">{status}</p>}

      <p className="text-gray-700 mt-6">
        📧 Admin Email: <span className="underline">ghushmeter.admin@gmail.com</span>
      </p>
    </div>
  );
}
