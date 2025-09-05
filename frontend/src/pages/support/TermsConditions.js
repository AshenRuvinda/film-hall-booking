// frontend/src/pages/support/TermsConditions.js
import React from 'react';
import { FileText, Shield, Users, CreditCard, AlertCircle, Calendar } from 'lucide-react';

function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
          </div>
          <p className="text-lg text-gray-600">
            Last updated: January 2024
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Ticket.lk. These Terms and Conditions govern your use of our online movie ticket booking platform. 
              By accessing or using our service, you agree to be bound by these terms. If you do not agree with any part of 
              these terms, you may not use our service.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>When you create an account with us, you must provide accurate and complete information.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are responsible for safeguarding your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>Users must be at least 16 years old to create an account</li>
                <li>Each user is limited to one account per email address</li>
                <li>Account sharing is strictly prohibited</li>
              </ul>
            </div>
          </section>

          {/* Booking Terms */}
          <section>
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Booking Terms</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">Ticket Booking Process</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All bookings are subject to availability</li>
                <li>Seat selection is on a first-come, first-served basis</li>
                <li>Booking confirmation is sent via email upon successful payment</li>
                <li>Each booking has a unique reference number for identification</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6">Cancellation Policy</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellations are allowed up to 2 hours before show time</li>
                <li>Cancellation fees may apply as per cinema partner policies</li>
                <li>Refunds will be processed within 5-7 business days</li>
                <li>No-shows will not be eligible for refunds</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Ticket Validity</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tickets are valid only for the specific show, date, and time booked</li>
                <li>Entry to the cinema requires a valid e-ticket or booking reference</li>
                <li>Tickets cannot be transferred or exchanged between different shows</li>
              </ul>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Payment Terms</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All prices are displayed in Sri Lankan Rupees (LKR)</li>
                <li>Payment must be completed at the time of booking</li>
                <li>We accept major credit cards, debit cards, and online banking</li>
                <li>Booking fees and service charges are non-refundable</li>
                <li>Failed payment transactions will automatically release held seats</li>
                <li>All transactions are processed through secure payment gateways</li>
              </ul>
            </div>
          </section>

          {/* User Conduct */}
          <section>
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">User Conduct</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>Users agree to use our platform responsibly and in compliance with all applicable laws. Prohibited activities include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Using automated systems or bots to make bookings</li>
                <li>Attempting to manipulate pricing or availability</li>
                <li>Creating multiple accounts to circumvent booking limits</li>
                <li>Sharing account credentials with third parties</li>
                <li>Using the platform for any unlawful or fraudulent activities</li>
                <li>Interfering with the platform's security features</li>
              </ul>
            </div>
          </section>

          {/* Liability and Disclaimers */}
          <section>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Liability and Disclaimers</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">Platform Availability</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We strive to maintain 24/7 availability but cannot guarantee uninterrupted service</li>
                <li>Scheduled maintenance may temporarily affect platform access</li>
                <li>We are not liable for losses due to technical issues or downtime</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Cinema Partner Policies</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cinema-specific policies and restrictions may apply</li>
                <li>We act as an intermediary between users and cinema partners</li>
                <li>Show times, pricing, and availability are subject to cinema partner changes</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data Protection */}
          <section>
            <div className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                which forms part of these Terms and Conditions. By using our service, you consent to the collection and use of 
                information as outlined in our Privacy Policy.
              </p>
            </div>
          </section>

          {/* Modifications and Updates */}
          <section>
            <div className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately 
                upon posting on our website. Continued use of our service after any changes constitutes acceptance of the new terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="mt-4 space-y-2 text-gray-700">
              <p>Email: legal@ticket.lk</p>
              <p>Phone: +94 11 234 5678</p>
              <p>Address: 123 Galle Road, Colombo 03, Sri Lanka</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsConditions;