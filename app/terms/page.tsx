import Navbar from "@/components/Navbar";
import { FileText, Shield, AlertCircle, UserCheck } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary-100 rounded-lg p-3">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                <p className="text-sm text-gray-600 mt-1">Last updated: November 18, 2024</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Please read these Terms of Service carefully before using PrepWyse Commerce. By accessing or using our platform, you agree to be bound by these terms.
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <strong>Important:</strong> These terms constitute a legal agreement between you and PrepWyse Commerce. If you do not agree to these terms, please do not use our services.
              </div>
            </div>
          </div>

          {/* Section 1: Acceptance */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                By creating an account, accessing, or using PrepWyse Commerce ("Service", "Platform"), you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Be bound by these Terms of Service</li>
                <li>Comply with our <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link></li>
                <li>Follow all applicable laws and regulations</li>
                <li>Be at least 13 years old (or have parental consent)</li>
              </ul>
            </div>
          </section>

          {/* Section 2: User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary-600" />
              2. User Accounts
            </h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.1 Account Registration</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You must provide accurate, current, and complete information</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized access</li>
                  <li>One account per person; multiple accounts may be terminated</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.2 Account Security</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You are solely responsible for all activities under your account</li>
                  <li>Use strong passwords and enable two-factor authentication when available</li>
                  <li>Do not share your account credentials with others</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.3 Account Termination</h3>
                <p>We reserve the right to suspend or terminate accounts that:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Violate these terms or our policies</li>
                  <li>Engage in fraudulent, abusive, or illegal activities</li>
                  <li>Remain inactive for extended periods</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Use of Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Services</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 Permitted Use</h3>
                <p>You may use PrepWyse Commerce for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Personal educational purposes</li>
                  <li>Preparing for commerce exams (Class 11, 12, CUET)</li>
                  <li>Accessing quizzes, mock tests, and study materials</li>
                  <li>Tracking your academic progress</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Prohibited Activities</h3>
                <p>You must NOT:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Copy, reproduce, or redistribute quiz content without permission</li>
                  <li>Use automated tools (bots, scrapers) to access the platform</li>
                  <li>Attempt to circumvent security measures or access restrictions</li>
                  <li>Share or sell access to quizzes or premium content</li>
                  <li>Impersonate others or create false identities</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Use the platform for commercial purposes without authorization</li>
                  <li>Reverse engineer or decompile any part of the platform</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Content & Intellectual Property</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.1 Our Content</h3>
                <p>
                  All quiz questions, study materials, designs, logos, and platform features are owned by PrepWyse Commerce or our licensors. They are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.2 Your Content</h3>
                <p>
                  By submitting feedback, suggestions, or other content, you grant us a worldwide, royalty-free license to use, modify, and incorporate such content into our services.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.3 AI-Generated Content</h3>
                <p>
                  Some quiz questions are generated using AI. While we strive for accuracy, you acknowledge that:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>AI-generated content may occasionally contain errors</li>
                  <li>Content should be used as supplementary study material</li>
                  <li>You should verify critical information from authoritative sources</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Subscription & Payment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscription & Payment Terms</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.1 Free Trial</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>New users receive a 1-day free trial</li>
                  <li>No credit card required for trial</li>
                  <li>Access ends automatically after trial period</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.2 Paid Subscriptions</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Subscription plans are billed in advance</li>
                  <li>Payments processed securely through Razorpay</li>
                  <li>Auto-renewal unless cancelled before next billing cycle</li>
                  <li>Price changes communicated 30 days in advance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.3 Refund Policy</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Refunds considered on case-by-case basis</li>
                  <li>Technical issues must be reported within 7 days</li>
                  <li>No refunds for partial months or unused portions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6: Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-600" />
              6. Disclaimers & Limitations
            </h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6.1 Service "As Is"</h3>
                <p>
                  PrepWyse Commerce is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Uninterrupted or error-free operation</li>
                  <li>Specific exam results or performance improvements</li>
                  <li>Accuracy of all content at all times</li>
                  <li>Compatibility with all devices or browsers</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6.2 Educational Purpose</h3>
                <p>
                  PrepWyse Commerce is a supplementary learning tool. We are not:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>A replacement for formal education or textbooks</li>
                  <li>Responsible for your exam performance</li>
                  <li>Providing guaranteed admission to any institution</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6.3 Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by law, PrepWyse Commerce shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to Terms</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We may update these Terms of Service to reflect changes in our practices or legal requirements. Material changes will be communicated via:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email notification to your registered address</li>
                <li>Prominent notice on the platform</li>
                <li>In-app notification</li>
              </ul>
              <p>
                Continued use after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </section>

          {/* Section 8: Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law & Dispute Resolution</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                These terms are governed by the laws of India. Any disputes shall be resolved through:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>First:</strong> Good faith negotiation</li>
                <li><strong>Second:</strong> Mediation in a neutral location</li>
                <li><strong>Finally:</strong> Binding arbitration in accordance with Indian law</li>
              </ul>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Questions about these Terms of Service? Contact us:
              </p>
              <ul className="space-y-1">
                <li><strong>Email:</strong> legal@prepwyse.com</li>
                <li><strong>Support:</strong> support@prepwyse.com</li>
                <li><strong>Address:</strong> PrepWyse Commerce, India</li>
              </ul>
            </div>
          </section>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
            <Link href="/dashboard" className="text-primary-600 hover:underline">Back to Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
