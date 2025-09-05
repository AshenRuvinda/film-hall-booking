// frontend/src/pages/support/RefundPolicy.js
import React from 'react';
import { RefreshCw, Clock, CreditCard, AlertCircle, CheckCircle, XCircle, DollarSign } from 'lucide-react';

function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Refund Policy</h1>
          </div>
          <p className="text-lg text-gray-600">
            Last updated: January 2024
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <div className="flex items-center mb-4">
              <DollarSign className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              At Ticket.lk, we understand that plans can change. This Refund Policy outlines the terms and conditions 
              under which refunds are processed for movie ticket bookings. Please read this policy carefully before 
              making your booking, as acceptance of our terms is required at the time of purchase.
            </p>
          </section>

          {/* Refund Eligibility */}
          <section>
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Refund Eligibility</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">Eligible for Full Refund</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellation made more than 4 hours before show time</li>
                <li>Show cancellation by cinema management</li>
                <li>Technical issues preventing ticket delivery</li>
                <li>Payment charged but booking not confirmed</li>
                <li>Duplicate bookings due to system error</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Eligible for Partial Refund</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellation made 2-4 hours before show time (25% service fee applies)</li>
                <li>Show rescheduled by cinema and customer cannot attend new timing</li>
                <li>Seat unavailable due to cinema maintenance issues</li>
              </ul>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-green-700 font-medium">
                    Pro Tip: Book with confidence! Cancellations made more than 4 hours in advance receive a full refund.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Non-Refundable Situations */}
          <section>
            <div className="flex items-center mb-4">
              <XCircle className="h-6 w-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Non-Refundable Situations</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>The following situations are not eligible for refunds:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellation made less than 2 hours before show time</li>
                <li>No-show (failure to attend the booked show)</li>
                <li>Personal emergencies or change of plans</li>
                <li>Weather conditions (unless show is officially cancelled)</li>
                <li>Traffic or transportation issues</li>
                <li>Dissatisfaction with movie content</li>
                <li>Wrong movie or showtime selection by customer</li>
                <li>Tickets purchased for past shows</li>
              </ul>

              <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 font-medium">
                    Important: Please double-check your booking details before payment. 
                    Customer errors in selection are not eligible for refunds.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Timeline */}
          <section>
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Refund Processing Timeline</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Credit/Debit Cards</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      Processing: 1-2 business days
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      Bank processing: 3-7 business days
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      Total time: 4-9 business days
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Online Banking</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Processing: 1 business day
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Bank processing: 1-3 business days
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Total time: 2-4 business days
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Mobile Wallets</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      Processing: Same day
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      Wallet credit: Instant to 24 hours
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      Total time: 1-2 business days
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Bank Transfer</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                      Processing: 2-3 business days
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                      Bank processing: 1-2 business days
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                      Total time: 3-5 business days
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Process */}
          <section>
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">How to Request a Refund</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">Online Cancellation (Recommended)</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Log in to your Ticket.lk account</li>
                <li>Go to "My Bookings" section</li>
                <li>Find your booking and click "Cancel"</li>
                <li>Confirm cancellation and reason</li>
                <li>Receive cancellation confirmation email</li>
                <li>Refund processed automatically if eligible</li>
              </ol>

              <h3 className="text-lg font-semibold mt-6">Customer Support</h3>
              <p>If online cancellation is not available or you need assistance:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Call: +94 11 234 5678 (Available 8 AM - 10 PM)</li>
                <li>Email: refunds@ticket.lk</li>
                <li>Live Chat: Available on our website</li>
                <li>Provide booking reference number and reason for cancellation</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Required Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Booking reference number</li>
                <li>Email address used for booking</li>
                <li>Phone number associated with account</li>
                <li>Reason for cancellation</li>
                <li>Original payment method details</li>
              </ul>
            </div>
          </section>

          {/* Service Fees */}
          <section>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Service Fees and Charges</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cancellation Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refund Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        More than 4 hours before
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        No fee
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        100% refund
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        2-4 hours before
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                        25% of ticket price
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                        75% refund
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Less than 2 hours before
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        100% of ticket price
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        No refund
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                * Service fees are per ticket and may vary based on cinema partner policies
              </p>
            </div>
          </section>

          {/* Special Circumstances */}
          <section>
            <div className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Special Circumstances</h2>
              
              <h3 className="text-lg font-semibold">Show Cancellation by Cinema</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>100% refund including all fees</li>
                <li>Automatic processing within 24 hours</li>
                <li>Option to reschedule to alternative showing</li>
                <li>Email notification with options</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Technical Issues</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payment processing errors: Full refund within 48 hours</li>
                <li>Ticket delivery failures: Full refund or redelivery option</li>
                <li>System downtime during booking: Full refund available</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Group Bookings (10+ tickets)</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Extended cancellation window: 6 hours before show</li>
                <li>Partial cancellations allowed</li>
                <li>Dedicated support for group bookings</li>
                <li>Contact: groups@ticket.lk</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Refunds?</h2>
            <p className="text-gray-700 mb-4">
              Our refund support team is here to assist you with any questions or issues.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2 text-gray-700">
                  <p>Phone: +94 11 234 5678</p>
                  <p>Email: refunds@ticket.lk</p>
                  <p>Hours: 8:00 AM - 10:00 PM (Daily)</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Response Times</h3>
                <div className="space-y-2 text-gray-700">
                  <p>Phone: Immediate assistance</p>
                  <p>Email: Within 4 hours</p>
                  <p>Live Chat: Within 2 minutes</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default RefundPolicy;