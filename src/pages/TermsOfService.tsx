
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container max-w-4xl mx-auto pb-20 pt-4 md:pt-20 px-4">
      <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose max-w-none dark:prose-invert">
          <p className="text-lg mb-6">Last updated: April 15, 2025</p>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p>
              Welcome to SocialConnect. These Terms of Service ("Terms") govern your access to and use of SocialConnect's services, including our website, mobile applications, and any related services (collectively, the "Services").
            </p>
            <p className="mt-2">
              By accessing or using the Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">2. Using Our Services</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">User Accounts</h3>
            <p>
              To use many features of the Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Age Requirements</h3>
            <p>
              You must be at least 13 years old to create an account and use the Services. By creating an account and using the Services, you represent that you meet this requirement.
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Account Security</h3>
            <p>
              You are responsible for safeguarding your account password and for any activities or actions under your account. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above requirements.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">3. User Content</h2>
            <p>
              Our Services allow you to post, upload, store, share, send, or display content, including text, images, videos, and audio (collectively, "User Content").
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Content Ownership</h3>
            <p>
              You retain all rights to your User Content. By posting User Content, you grant us a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use, modify, run, copy, publicly display, publicly perform, and distribute your User Content in connection with operating and providing the Services.
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Content Restrictions</h3>
            <p>
              You may not post User Content that:
            </p>
            <ul className="list-disc pl-6">
              <li>Violates the rights of others, including intellectual property rights</li>
              <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or invasive of another's privacy</li>
              <li>Contains nudity, sexually explicit content, or excessive violence</li>
              <li>Promotes discrimination, bigotry, racism, hatred, or harm against any individual or group</li>
              <li>Impersonates another person or entity</li>
              <li>Contains spam, chain letters, or pyramid schemes</li>
              <li>Contains malware, viruses, or other harmful code</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">4. Special Features</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Location Sharing</h3>
            <p>
              Our Services allow you to share your location with other users. You control when and with whom you share your location. By using our location features, you consent to the collection and use of your location data for the purpose of providing these features.
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Video Calls</h3>
            <p>
              Our Services include video calling features. By using these features, you agree not to misuse them for any inappropriate communications or activities. We do not record video calls, but we may collect metadata about calls for service improvement and security purposes.
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">AI Image Generation</h3>
            <p>
              Our Services include AI-powered image generation tools. By using these tools, you agree:
            </p>
            <ul className="list-disc pl-6">
              <li>Not to generate content that violates our Content Restrictions</li>
              <li>That you are responsible for all content generated, even if generated by AI</li>
              <li>That we may store and use generation prompts to improve our Services</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
            <p>
              The Services and their original content, features, and functionality are owned by SocialConnect and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">6. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">7. Disclaimer</h2>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p>
              IN NO EVENT SHALL SOCIALCONNECT, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of changes by posting the updated Terms on the Services. Your continued use of the Services after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: terms@socialconnect.example.com<br />
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
