
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto pb-20 pt-4 md:pt-20 px-4">
      <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none dark:prose-invert">
          <p className="text-lg mb-6">Last updated: April 15, 2025</p>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p>
              Welcome to SocialConnect. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our services.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p>We collect information when you:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Create an account and profile</li>
              <li>Connect with other users</li>
              <li>Post content, including text, photos, and videos</li>
              <li>Use our messaging features</li>
              <li>Share your location</li>
              <li>Participate in video calls</li>
              <li>Generate images with AI tools</li>
            </ul>
            <p>This information may include:</p>
            <ul className="list-disc pl-6">
              <li>Contact details (email, phone number)</li>
              <li>Profile information</li>
              <li>Content you create</li>
              <li>Location data (when enabled)</li>
              <li>Usage information</li>
              <li>Device information</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6">
              <li>Provide, maintain, and improve our services</li>
              <li>Connect you with friends and content</li>
              <li>Enable communications between users</li>
              <li>Enhance security and safety</li>
              <li>Personalize content and features</li>
              <li>Process location sharing requests</li>
              <li>Facilitate video calls</li>
              <li>Enable AI image generation</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">4. How We Share Information</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6">
              <li>Other users (based on your privacy settings)</li>
              <li>Service providers and partners</li>
              <li>Legal authorities when required</li>
            </ul>
            <p>We do not sell your personal information to advertisers or other third parties.</p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">5. Your Choices and Rights</h2>
            <p>You can:</p>
            <ul className="list-disc pl-6">
              <li>Access and update your information</li>
              <li>Control your privacy settings</li>
              <li>Delete content and accounts</li>
              <li>Turn off location sharing at any time</li>
              <li>Opt out of communications</li>
              <li>Request your data</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. However, no system is 100% secure, and we cannot guarantee the security of your information.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">7. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly collect information from children under 13. If you believe we have information from a child under 13, please contact us.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email: privacy@socialconnect.example.com<br />
              Address: 123 Social Street, App City, AC 12345
            </p>
          </section>
        </div>
        
        <div className="mt-8">
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
