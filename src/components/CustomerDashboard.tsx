import React, { useState } from 'react';
import { ServiceBooking, ToolRental, GrievanceComplaint } from '../types';
import { Wrench, Calendar, Clock, MapPin, CheckCircle, AlertCircle, MessageSquare, Star, ArrowUpRight, ShieldCheck, X } from 'lucide-react';

interface CustomerDashboardProps {
  bookings: ServiceBooking[];
  rentals: ToolRental[];
  complaints: GrievanceComplaint[];
  onCancelBooking: (bookingId: number) => void;
  onRequestToolReturn: (rentalId: number) => void;
  onSubmitReview: (bookingId: number, rating: number, comment: string) => void;
  onSubmitComplaint: (complaint: { bookingId?: number; subject: string; description: string }) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  bookings,
  rentals,
  complaints,
  onCancelBooking,
  onRequestToolReturn,
  onSubmitReview,
  onSubmitComplaint
}) => {
  const [subTab, setSubTab] = useState<'RENTALS' | 'BOOKINGS' | 'COMPLAINTS'>('RENTALS');

  // Review Modal
  const [reviewBooking, setReviewBooking] = useState<ServiceBooking | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Complaint Form
  const [complaintSubject, setComplaintSubject] = useState<string>('');
  const [complaintDesc, setComplaintDesc] = useState<string>('');
  const [complaintSubmitted, setComplaintSubmitted] = useState<boolean>(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    onSubmitReview(reviewBooking.id, ratingStars, reviewComment);
    setReviewBooking(null);
    setReviewComment('');
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) return;
    onSubmitComplaint({
      subject: complaintSubject,
      description: complaintDesc
    });
    setComplaintSubject('');
    setComplaintDesc('');
    setComplaintSubmitted(true);
    setTimeout(() => setComplaintSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Customer Account Activity
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              My Orders & Leases
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live status tracking for equipment rentals, technician appointments, and support tickets.
            </p>
          </div>

          {/* Subtabs Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setSubTab('RENTALS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'RENTALS'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tool Leases ({rentals.length})
            </button>
            <button
              onClick={() => setSubTab('BOOKINGS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'BOOKINGS'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Service Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setSubTab('COMPLAINTS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'COMPLAINTS'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grievance Desk ({complaints.length})
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: TOOL RENTALS */}
      {subTab === 'RENTALS' && (
        <div className="space-y-4">
          {rentals.map(rental => (
            <div
              key={rental.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={rental.toolImageUrl || '/src/assets/images/power_tools_collection_1793286054081.jpg'}
                  alt={rental.toolName}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 font-num">
                      #LEAS-{rental.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {rental.toolName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rental.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : rental.status === 'RETURN_REQUESTED'
                          ? 'bg-amber-50 text-amber-700'
                          : rental.status === 'RETURNED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {rental.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {rental.startDate} to {rental.endDate} ({rental.rentalDays} days)
                    </span>
                    <span>·</span>
                    <span>Daily: ₹{rental.dailyRate}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold font-num">
                      Escrow Deposit: ₹{rental.securityDeposit}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 pt-1 font-num">
                    Total Handover Value: <span className="font-bold">₹{rental.totalAmount}</span> · Payment: <span className="text-emerald-600 font-bold">{rental.paymentStatus}</span> ({rental.paymentMethod})
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                {rental.status === 'ACTIVE' && (
                  <button
                    onClick={() => onRequestToolReturn(rental.id)}
                    className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    Request Return & Refund
                  </button>
                )}

                {rental.status === 'RETURN_REQUESTED' && (
                  <div className="text-xs text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    Admin Inspection Pending
                  </div>
                )}

                {rental.status === 'RETURNED' && (
                  <div className="text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Deposit Refunded (₹{rental.refundableDeposit})</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {rentals.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No equipment rentals recorded. Head to the Tools Catalog to rent commercial tools.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: SERVICE BOOKINGS */}
      {subTab === 'BOOKINGS' && (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 font-num">
                    #JOB-{booking.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {booking.serviceName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      booking.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : booking.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700'
                        : booking.status === 'ACCEPTED'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-slate-800">
                    Mechanic: {booking.technicianName}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    {booking.bookingDate} at {booking.bookingTime}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {booking.location}
                  </span>
                </div>

                <p className="text-xs text-slate-600 italic">
                  "{booking.description}"
                </p>

                <div className="text-xs text-slate-700 pt-1 font-num">
                  Service Amount: <span className="font-bold">₹{booking.estimatedAmount}</span> · Payment: <span className="font-bold text-emerald-600">{booking.paymentStatus}</span> ({booking.paymentMethod})
                </div>

                {booking.rating && (
                  <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-bold">{booking.rating}★ Review:</span>
                    <span className="text-slate-600 italic">"{booking.reviewComment}"</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                  <button
                    onClick={() => onCancelBooking(booking.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                  >
                    Cancel Appointment
                  </button>
                )}

                {booking.status === 'COMPLETED' && !booking.rating && (
                  <button
                    onClick={() => setReviewBooking(booking)}
                    className="px-3.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Rate Technician</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No household service bookings placed yet.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: GRIEVANCES & COMPLAINTS */}
      {subTab === 'COMPLAINTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* File New Grievance */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              File a Grievance or Query
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All complaints are audited by system administration within 2 hours.
            </p>

            {complaintSubmitted && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                Grievance ticket created successfully. Our team will follow up.
              </div>
            )}

            <form onSubmit={handleComplaintSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Subject / Issue Topic
                </label>
                <input
                  type="text"
                  value={complaintSubject}
                  onChange={e => setComplaintSubject(e.target.value)}
                  placeholder="e.g. Incomplete pipe fitting / Overdue deposit question"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  value={complaintDesc}
                  onChange={e => setComplaintDesc(e.target.value)}
                  placeholder="Describe the service or tool issue..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Submit Grievance Ticket
              </button>
            </form>
          </div>

          {/* Grievance History */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Filed Tickets ({complaints.length})
            </h3>
            {complaints.map(t => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 font-num">
                      #TCK-{t.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{t.subject}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{t.description}</p>

                {t.adminResponse && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Admin Resolution Response
                    </span>
                    <div>{t.adminResponse}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* RATING REVIEW MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Rate Technician: {reviewBooking.technicianName}
              </h3>
              <button
                onClick={() => setReviewBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-2">
                  Select Rating Stars:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingStars(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= ratingStars
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm text-slate-800 font-num">
                    {ratingStars} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Review Feedback Comment
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share details about the technician's punctuality and quality of work..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
