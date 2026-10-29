import React, { useState } from 'react';
import { ServiceBooking, Technician } from '../types';
import { HardHat, CheckCircle2, Clock, MapPin, DollarSign, Phone, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface TechnicianHubProps {
  technician: Technician;
  bookings: ServiceBooking[];
  onUpdateStatus: (bookingId: number, status: 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED') => void;
  onRecordCashPayment: (bookingId: number) => void;
  onToggleAvailability: (day: string) => void;
}

export const TechnicianHub: React.FC<TechnicianHubProps> = ({
  technician,
  bookings,
  onUpdateStatus,
  onRecordCashPayment,
  onToggleAvailability
}) => {
  const [activeTab, setActiveTab] = useState<'JOBS' | 'AVAILABILITY'>('JOBS');

  const myAssignedJobs = bookings.filter(b => b.technicianId === technician.id);

  return (
    <div className="space-y-8">
      {/* Mechanic Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <img
              src={technician.avatarUrl || '/src/assets/images/service_electrician_tech_1793286054123.jpg'}
              alt={technician.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-blue-400 shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{technician.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Pro
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {technician.city} Service Zone · {technician.experienceYears} Years Trade Experience
              </p>
              <div className="text-xs text-blue-300 flex items-center gap-3 mt-1.5 font-num">
                <span>Rating: <strong className="text-amber-400">{technician.averageRating}★</strong> ({technician.totalReviews} reviews)</span>
                <span>·</span>
                <span>Assigned Jobs: <strong className="text-white">{myAssignedJobs.length}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-900/60 p-1.5 rounded-xl border border-blue-700/50 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('JOBS')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'JOBS' ? 'bg-blue-600 text-white shadow' : 'text-blue-200 hover:text-white'
              }`}
            >
              Assigned Work Orders ({myAssignedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('AVAILABILITY')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'AVAILABILITY' ? 'bg-blue-600 text-white shadow' : 'text-blue-200 hover:text-white'
              }`}
            >
              Weekly Schedule
            </button>
          </div>

        </div>
      </div>

      {/* VIEW 1: ASSIGNED JOBS */}
      {activeTab === 'JOBS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Field Work Orders & Progress Tracking
            </h3>
            <span className="text-xs text-slate-500">
              Advance state machine: Accepted → In Progress → Completed
            </span>
          </div>

          {myAssignedJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 font-num">
                    #JOB-{job.id}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    {job.serviceName}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      job.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : job.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 font-num">
                  Service Value: ₹{job.estimatedAmount}
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="text-slate-500">
                    <strong className="text-slate-800">Customer:</strong> {job.customerName}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{job.customerPhone}</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Scheduled: {job.bookingDate} at {job.bookingTime}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 italic border border-slate-100">
                    "{job.description}"
                  </div>
                </div>
              </div>

              {/* Status progression bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                
                {/* Payment state */}
                <div className="text-xs">
                  <span className="text-slate-500">Payment: </span>
                  <span
                    className={`font-bold font-num ${
                      job.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {job.paymentStatus} ({job.paymentMethod})
                  </span>
                  {job.transactionId && (
                    <span className="text-[10px] text-slate-400 font-num ml-2">
                      Receipt: {job.transactionId}
                    </span>
                  )}
                </div>

                {/* Progress Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {job.status === 'PENDING' && (
                    <button
                      onClick={() => onUpdateStatus(job.id, 'ACCEPTED')}
                      className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                    >
                      Accept Job Request
                    </button>
                  )}

                  {job.status === 'ACCEPTED' && (
                    <button
                      onClick={() => onUpdateStatus(job.id, 'IN_PROGRESS')}
                      className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                    >
                      Mark In Progress (At Site)
                    </button>
                  )}

                  {job.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => onUpdateStatus(job.id, 'COMPLETED')}
                      className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                    >
                      Mark Job Completed
                    </button>
                  )}

                  {job.status === 'COMPLETED' && job.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => onRecordCashPayment(job.id)}
                      className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Record Cash Payment (₹{job.estimatedAmount})</span>
                    </button>
                  )}

                  {job.status === 'COMPLETED' && job.paymentStatus === 'PAID' && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Settled & Closed</span>
                    </span>
                  )}
                </div>

              </div>
            </div>
          ))}

          {myAssignedJobs.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No active job assignments for this technician.
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: WEEKLY AVAILABILITY */}
      {activeTab === 'AVAILABILITY' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Weekly Working Hours & Days
            </h3>
            <p className="text-xs text-slate-500">
              Only available slots are matched in customer recommendations.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {technician.availability.map(slot => (
              <div key={slot.day} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{slot.day}</span>
                  <span className="text-slate-500 ml-3 font-num">
                    {slot.available ? `${slot.startTime} - ${slot.endTime}` : 'Off Duty'}
                  </span>
                </div>

                <button
                  onClick={() => onToggleAvailability(slot.day)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    slot.available
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {slot.available ? 'Active (Working)' : 'Unavailable (Off)'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
