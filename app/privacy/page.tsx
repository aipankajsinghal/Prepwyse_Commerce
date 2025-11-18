import Navbar from "@/components/Navbar";
import { Shield, Lock, Eye, Download, Trash2, FileText } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="edu-card p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary-100 rounded-lg p-3">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-primary">Privacy Policy</h1>
                <p className="text-sm font-body text-text-secondary mt-1">Last updated: November 18, 2024</p>
              </div>
            </div>
            <p className="font-body text-text-primary leading-relaxed">
              At PrepWyse Commerce, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data in compliance with GDPR, Indian DPDP Act 2023, and other applicable data protection laws.
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Links</h3>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <a href="#information-we-collect" className="text-blue-600 hover:underline">• Information We Collect</a>
              <a href="#how-we-use-data" className="text-blue-600 hover:underline">• How We Use Your Data</a>
              <a href="#data-storage" className="text-blue-600 hover:underline">• Data Storage & Security</a>
              <a href="#your-rights" className="text-blue-600 hover:underline">• Your Rights</a>
              <a href="#cookies" className="text-blue-600 hover:underline">• Cookies & Tracking</a>
              <a href="#contact" className="text-blue-600 hover:underline">• Contact Us</a>
            </div>
          </div>

          {/* Section 1: Information We Collect */}
          <section id="information-we-collect" className="mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary-600" />
              1. Information We Collect
            </h2>
            <div className="space-y-4 font-body text-text-primary">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account Information:</strong> Name, email address, grade level when you register</li>
                  <li><strong>Profile Information:</strong> Optional profile picture, study preferences, goals</li>
                  <li><strong>Quiz & Test Data:</strong> Your answers, scores, time spent, and performance metrics</li>
                  <li><strong>Communication:</strong> Messages you send to support or feedback</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.2 Information Automatically Collected</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
                  <li><strong>Log Data:</strong> IP address, access times, error logs</li>
                  <li><strong>Cookies:</strong> Session cookies, preference cookies (see Cookies section)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.3 Information from Third Parties</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Authentication:</strong> Basic profile information from Clerk authentication service</li>
                  <li><strong>AI Services:</strong> Anonymized query data sent to OpenAI for quiz generation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: How We Use Your Data */}
          <section id="how-we-use-data" className="mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary-600" />
              2. How We Use Your Data
            </h2>
            <div className="space-y-3 font-body text-text-primary">
              <p>We use your personal information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provide Services:</strong> Deliver quiz content, track progress, generate personalized recommendations</li>
                <li><strong>Improve Platform:</strong> Analyze usage patterns, enhance features, fix bugs</li>
                <li><strong>Personalization:</strong> Adapt difficulty levels, suggest relevant content, customize experience</li>
                <li><strong>Communication:</strong> Send important updates, respond to support requests, notify about account activity</li>
                <li><strong>Security:</strong> Prevent fraud, protect against abuse, maintain platform integrity</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations, enforce terms of service</li>
              </ul>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-green-900">
                  <strong>Legal Basis (GDPR):</strong> We process your data based on:
                  <br />• Contract performance (providing educational services)
                  <br />• Legitimate interests (improving platform, security)
                  <br />• Consent (marketing communications, optional features)
                  <br />• Legal obligations (compliance, data retention)
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Data Storage & Security */}
          <section id="data-storage" className="mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary-600" />
              3. Data Storage & Security
            </h2>
            <div className="space-y-3 font-body text-text-primary">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 Data Storage</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your data is stored on secure servers hosted by reputable cloud providers</li>
                  <li>Database backups are encrypted and stored separately</li>
                  <li>Data is retained as long as your account is active or as required by law</li>
                  <li>Inactive accounts (no login for 3+ years) may be anonymized or deleted</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Security Measures</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Encryption:</strong> All data transmitted using TLS/SSL encryption</li>
                  <li><strong>Authentication:</strong> Secure authentication via Clerk with MFA support</li>
                  <li><strong>Access Control:</strong> Role-based access, principle of least privilege</li>
                  <li><strong>Monitoring:</strong> Continuous security monitoring and audit logs</li>
                  <li><strong>Regular Updates:</strong> Security patches applied promptly</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.3 Data Sharing</h3>
                <p className="mb-2">We do not sell your personal information. We may share data with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Service Providers:</strong> Clerk (auth), OpenAI (AI features), hosting providers</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or legal process</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Your Rights */}
          <section id="your-rights" className="mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-4 flex items-center gap-2">
              <Download className="h-6 w-6 text-primary-600" />
              4. Your Rights
            </h2>
            <div className="space-y-3 font-body text-text-primary">
              <p>Under GDPR and Indian DPDP Act, you have the following rights:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Access</h4>
                  <p className="text-sm">Request a copy of your personal data we hold</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Rectification</h4>
                  <p className="text-sm">Correct inaccurate or incomplete data</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Erasure</h4>
                  <p className="text-sm">Request deletion of your personal data</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Data Portability</h4>
                  <p className="text-sm">Export your data in machine-readable format</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Object</h4>
                  <p className="text-sm">Object to processing of your data</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Withdraw Consent</h4>
                  <p className="text-sm">Withdraw consent for optional processing</p>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-primary-900">
                  <strong>Exercise Your Rights:</strong> Visit your <Link href="/profile" className="underline font-semibold">Profile Settings</Link> to:
                  <br />• Download your data
                  <br />• Update your information
                  <br />• Delete your account
                  <br />• Manage privacy preferences
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Cookies */}
          <section id="cookies" className="mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-4">5. Cookies & Tracking Technologies</h2>
            <div className="space-y-3 font-body text-text-primary">
              <p>We use cookies and similar technologies to enhance your experience:</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Essential Cookies (Required)</h4>
                  <p className="text-sm">Authentication, security, session management. Cannot be disabled.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900">Preference Cookies (Optional)</h4>
                  <p className="text-sm">Remember your settings, theme, language preferences.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900">Analytics Cookies (Optional)</h4>
                  <p className="text-sm">Help us understand how you use the platform to improve features.</p>
                </div>
              </div>

              <p className="text-sm mt-4">
                You can manage cookie preferences through our cookie consent banner or your browser settings.
              </p>
            </div>
          </section>

          {/* Section 6: Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-4">6. Children's Privacy</h2>
            <div className="space-y-3 font-body text-text-primary">
              <p>
                PrepWyse Commerce is designed for students aged 13 and above. We do not knowingly collect personal information from children under 13 without parental consent. If we become aware of such collection, we will delete the information immediately.
              </p>
              <p>
                For students under 18, we recommend parental guidance and supervision while using the platform.
              </p>
            </div>
          </section>

          {/* Section 7: Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-4">7. Changes to This Policy</h2>
            <div className="space-y-3 font-body text-text-primary">
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or prominent notice on the platform.
              </p>
              <p className="text-sm font-semibold">
                Last Updated: November 18, 2024
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-6">
            <h2 className="text-2xl font-display font-bold text-primary mb-4">8. Contact Us</h2>
            <div className="font-body text-text-primary space-y-2">
              <p>
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <ul className="space-y-1">
                <li><strong>Email:</strong> privacy@prepwyse.com</li>
                <li><strong>Data Protection Officer:</strong> dpo@prepwyse.com</li>
                <li><strong>Address:</strong> PrepWyse Commerce, India</li>
              </ul>
              <p className="text-sm mt-4">
                We will respond to your requests within 30 days as required by applicable law.
              </p>
            </div>
          </section>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
            <Link href="/profile" className="text-primary-600 hover:underline">Privacy Settings</Link>
            <Link href="/dashboard" className="text-primary-600 hover:underline">Back to Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
