// frontend/src/pages/support/PrivacyPolicy.js
import React from 'react';
import { Shield, Eye, Lock, Database, Users, Settings, Globe, AlertTriangle } from 'lucide-react';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-green-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-600">
            Last updated: January 2024
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              At Ticket.lk, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              movie ticket booking platform. Please read this policy carefully to understand our practices.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <p>When you create an account or make a booking, we may collect:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Date of birth (for age verification)</li>
                <li>Billing address and payment information</li>
                <li>Booking history and preferences</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Technical Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Pages visited and time spent on our platform</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Location data (with your permission)</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Transaction Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Purchase history and booking details</li>
                <li>Payment method and transaction IDs</li>
                <li>Refund and cancellation records</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <div className="flex items-center mb-4">
              <Settings className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>We use the collected information for the following purposes:</p>
              
              <h3 className="text-lg font-semibold">Service Provision</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process ticket bookings and payments</li>
                <li>Send booking confirmations and e-tickets</li>
                <li>Provide customer support and assistance</li>
                <li>Manage your account and preferences</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Communication</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Send important service notifications</li>
                <li>Provide marketing communications (with consent)</li>
                <li>Respond to inquiries and support requests</li>
                <li>Send promotional offers and updates</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Platform Improvement</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Analyze usage patterns and user behavior</li>
                <li>Improve our platform functionality and user experience</li>
                <li>Develop new features and services</li>
                <li>Conduct research and analytics</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Information Sharing and Disclosure</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>We may share your information in the following circumstances:</p>
              
              <h3 className="text-lg font-semibold">Service Partners</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cinema partners for booking confirmations and entry verification</li>
                <li>Payment processors for secure transaction handling</li>
                <li>Email service providers for communication delivery</li>
                <li>Analytics services for platform improvement</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Legal Requirements</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Compliance with legal obligations and court orders</li>
                <li>Protection of our rights and property</li>
                <li>Investigation of fraud or security incidents</li>
                <li>Public safety and law enforcement cooperation</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>We implement comprehensive security measures to protect your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing through certified gateways</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and employee training</li>
                <li>Data backup and recovery procedures</li>
                <li>Continuous monitoring for security threats</li>
              </ul>
              <p className="mt-4 text-sm bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <strong>Important:</strong> While we strive to protect your information, no method of transmission over 
                the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Your Rights and Choices */}
          <section>
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Your Rights and Choices</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at privacy@ticket.lk or through our contact form.
              </p>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>We use cookies and similar technologies to enhance your experience:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Performance Cookies:</strong> Help us analyze platform usage</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
                <li><strong>Marketing Cookies:</strong> Personalize advertisements and content</li>
              </ul>
              <p className="mt-4">
                You can control cookie settings through your browser preferences. Note that disabling certain 
                cookies may affect platform functionality.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <div className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
              <p>We retain your personal information for different periods based on the type of data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Until account deletion or 3 years of inactivity</li>
                <li><strong>Transaction Records:</strong> 7 years for legal and tax compliance</li>
                <li><strong>Marketing Data:</strong> Until you unsubscribe or object</li>
                <li><strong>Technical Data:</strong> 2 years for security and analytics purposes</li>
              </ul>
            </div>
          </section>

          {/* Third-Party Links */}
          <section>
            <div className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Third-Party Links and Services</h2>
              <p>
                Our platform may contain links to third-party websites or services. We are not responsible for 
                the privacy practices of these external sites. We encourage you to review their privacy policies 
                before providing any personal information.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <div className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
              <p>
                Our services are not directed to children under 16. We do not knowingly collect personal information 
                from children under 16. If we become aware that we have collected such information, we will take 
                steps to delete it promptly.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <div className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than Sri Lanka. We ensure 
                appropriate safeguards are in place to protect your information during such transfers, including 
                contractual protections and adequacy decisions.
              </p>
            </div>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <div className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on our website and updating the "Last updated" date. Your continued 
                use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us About Privacy</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-gray-700">
              <p>Email: privacy@ticket.lk</p>
              <p>Phone: +94 11 234 5678</p>
              <p>Address: 123 Galle Road, Colombo 03, Sri Lanka</p>
              <p>Data Protection Officer: dpo@ticket.lk</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;