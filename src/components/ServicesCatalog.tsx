import React, { useState } from 'react';
import { HouseholdService, Technician } from '../types';
import { CheckCircle2, Shield, Clock, Star, Calendar, ArrowRight, UserCheck, X, Check, MapPin } from 'lucide-react';

interface ServicesCatalogProps {
  services: HouseholdService[];
  technicians: Technician[];
  onBookService: (bookingData: {
    service: HouseholdService;
    technicianId: number;
    technicianName: string;
    bookingDate: string;
    bookingTime: string;
    location: string;
    description: string;
    paymentMethod: 'CASH' | 'UPI' | 'CARD';
  }) => void;
  onOpenMatcher: (serviceId?: number) => void;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({
  services,
  technicians,
  onBookService,
  onOpenMatcher
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeBookingService, setActiveBookingService] = useState<HouseholdService | null>(null);

  // Booking Modal State
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState<string>(tomorrow);
  const [bookingTime, setBookingTime] = useState<string>('11:00 AM');
  const [selectedTechId, setSelectedTechId] = useState<number>(technicians[0]?.id || 1);
  const [location, setLocation] = useState<string>('15 Anna Nagar, Madurai, TN');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const categories = ['ALL', 'Electrical', 'AC & Climate Control', 'Plumbing', 'Deep Cleaning', 'Carpentry', 'Painting & Masonry'];

  const filteredServices = services.filter(svc => {
    return selectedCategory === 'ALL' || svc.category === selectedCategory;
  });

  const availableTechsForService = technicians.filter(
    t => t.verificationStatus === 'APPROVED' && (!activeBookingService || t.services.includes(activeBookingService.name))
  );

  const handleOpenBooking = (svc: HouseholdService) => {
    setActiveBookingService(svc);
    setDescription(`Requesting service for ${svc.name}`);
    setBookingSuccess(false);

    // Pick top matched tech if available
    const matched = technicians.find(t => t.verificationStatus === 'APPROVED' && t.services.includes(svc.name));
    if (matched) {
      setSelectedTechId(matched.id);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingService) return;

    const chosenTech = technicians.find(t => t.id === Number(selectedTechId)) || technicians[0];

    onBookService({
      service: activeBookingService,
      technicianId: chosenTech.id,
      technicianName: chosenTech.name,
      bookingDate,
      bookingTime,
      location,
      description,
      paymentMethod
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setActiveBookingService(null);
      setBookingSuccess(false);
    }, 1600);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Doorstep Maintenance & Trade Services
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Verified Household Technicians
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Experienced, background-verified specialists equipped with trade equipment and 30-day workmanship warranty.
            </p>
          </div>

          <button
            onClick={() => onOpenMatcher()}
            className="px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto"
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Launch Pro GPS Matcher</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="pt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All Services' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(svc => (
          <div
            key={svc.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  {svc.category}
                </span>
                <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {svc.estimatedHours}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{svc.name}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {svc.description}
              </p>

              {/* Task list checklist */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  What's Included:
                </div>
                {svc.includedTasks.map((task, i) => (
                  <div key={i} className="text-xs text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Action */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Standard Visit</span>
                <span className="text-xl font-extrabold text-slate-900 font-num">
                  ₹{svc.basePrice}
                </span>
              </div>

              <button
                onClick={() => handleOpenBooking(svc)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Book Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SERVICE BOOKING MODAL */}
      {activeBookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Service Appointment Dispatch
                </span>
                <h3 className="text-base font-bold text-white">
                  Schedule: {activeBookingService.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveBookingService(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  Appointment Scheduled!
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Your appointment for <span className="font-semibold">{activeBookingService.name}</span> has been logged. The technician was notified for acceptance.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
                
                {/* Mechanic Picker */}
                <div className="text-xs">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Select Certified Technician
                  </label>
                  <select
                    value={selectedTechId}
                    onChange={e => setSelectedTechId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {availableTechsForService.length > 0 ? (
                      availableTechsForService.map(tech => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} · {tech.city} ({tech.averageRating}★ · {tech.experienceYears} yrs exp)
                        </option>
                      ))
                    ) : (
                      technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} · {tech.city} ({tech.averageRating}★)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Date & Time Slot */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      min={tomorrow}
                      onChange={e => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Time Slot
                    </label>
                    <select
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="09:00 AM">09:00 AM - Morning</option>
                      <option value="11:00 AM">11:00 AM - Midday</option>
                      <option value="02:00 PM">02:00 PM - Afternoon</option>
                      <option value="04:30 PM">04:30 PM - Late Afternoon</option>
                    </select>
                  </div>
                </div>

                {/* Location / Address */}
                <div className="text-xs">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Service Address
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Enter street address, building, city"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>

                {/* Description of Issue */}
                <div className="text-xs">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Problem Notes & Symptoms
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Briefly describe what needs fixing..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>

                {/* Payment Option */}
                <div className="text-xs">
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Payment Option
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        paymentMethod === 'CASH'
                          ? 'border-amber-500 bg-amber-50/50 text-amber-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cash on Work Completion
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        paymentMethod === 'UPI'
                          ? 'border-amber-500 bg-amber-50/50 text-amber-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Instant UPI Pay
                    </button>
                  </div>
                </div>

                {/* Cost Summary Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Service Base Charge:</span>
                    <span className="font-bold text-slate-900">{activeBookingService.warranty}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 font-num">
                      ₹{activeBookingService.basePrice}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Estimated Amount</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveBookingService(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-lg shadow-sm active:scale-95 transition-all"
                  >
                    Confirm Appointment
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
