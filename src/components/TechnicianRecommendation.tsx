import React, { useState } from 'react';
import { Technician, HouseholdService } from '../types';
import { UserCheck, Star, MapPin, Award, CheckCircle2, Navigation, ArrowRight } from 'lucide-react';

interface TechnicianRecommendationProps {
  technicians: Technician[];
  services: HouseholdService[];
  onSelectTechnicianToBook: (tech: Technician, serviceName: string) => void;
}

export const TechnicianRecommendation: React.FC<TechnicianRecommendationProps> = ({
  technicians,
  services,
  onSelectTechnicianToBook
}) => {
  const [selectedService, setSelectedService] = useState<string>(services[1]?.name || 'Advanced AC Repair, Deep Gas & Jet Wash');
  const [selectedCity, setSelectedCity] = useState<string>('Madurai');

  // Coordinates for demonstration
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    Madurai: { lat: 9.9252, lng: 78.1198 },
    Bengaluru: { lat: 12.9716, lng: 77.5946 },
    Chennai: { lat: 13.0012, lng: 80.2565 }
  };

  // Haversine distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const userCoords = cityCoordinates[selectedCity] || cityCoordinates.Madurai;

  // Compute recommendation scores
  const scoredTechnicians = technicians
    .filter(t => t.verificationStatus === 'APPROVED')
    .map(tech => {
      const distanceKm = calculateDistance(userCoords.lat, userCoords.lng, tech.latitude, tech.longitude);
      
      // 1. Service Match (40 pts)
      const serviceMatchScore = tech.services.includes(selectedService) ? 40 : 10;
      
      // 2. Rating Score (30 pts)
      const ratingScore = Math.round((tech.averageRating / 5.0) * 30 * 10) / 10;
      
      // 3. Proximity Haversine Distance (20 pts max)
      const distanceScore = Math.max(0, Math.round((20 - distanceKm * 0.5) * 10) / 10);
      
      // 4. Working Slot Availability (10 pts)
      const availabilityScore = tech.availability.some(a => a.available) ? 10 : 0;

      const totalScore = Math.min(100, Math.round(serviceMatchScore + ratingScore + distanceScore + availabilityScore));

      return {
        tech,
        distanceKm,
        serviceMatchScore,
        ratingScore,
        distanceScore,
        availabilityScore,
        totalScore
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="space-y-8">
      {/* Search & Matching Settings */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              AI & Rule-Based Technician Matcher
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Ranked Mechanic Recommendation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Multi-factor algorithm evaluating Service Specialization (40%), Rating (30%), Haversine Distance (20%), and Slot Availability (10%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Your Service Need:
              </label>
              <select
                value={selectedService}
                onChange={e => setSelectedService(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {services.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Your City Location:
              </label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="Madurai">Madurai (Tamil Nadu)</option>
                <option value="Bengaluru">Bengaluru (Karnataka)</option>
                <option value="Chennai">Chennai (Tamil Nadu)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Algorithm Formula Legend */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block font-num">40 Pts</span>
            <span className="text-[11px] text-slate-500">Service Skill Match</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block font-num">30 Pts</span>
            <span className="text-[11px] text-slate-500">Verified Rating Stars</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block font-num">20 Pts</span>
            <span className="text-[11px] text-slate-500">Haversine GPS Distance</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block font-num">10 Pts</span>
            <span className="text-[11px] text-slate-500">Working Slot Available</span>
          </div>
        </div>
      </div>

      {/* Ranked Mechanics List */}
      <div className="space-y-4">
        {scoredTechnicians.map((item, index) => {
          const isTopMatch = index === 0;

          return (
            <div
              key={item.tech.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all ${
                isTopMatch
                  ? 'border-amber-400 shadow-md ring-1 ring-amber-400/30'
                  : 'border-slate-200/90 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Tech Profile Info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={item.tech.avatarUrl || '/src/assets/images/service_electrician_tech_1793286054123.jpg'}
                      alt={item.tech.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                    />
                    {isTopMatch && (
                      <span className="absolute -top-2 -left-2 bg-amber-500 text-white p-1 rounded-full shadow-sm" title="Rank #1 Match">
                        <Award className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{item.tech.name}</h3>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Background Verified
                      </span>
                      {isTopMatch && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                          Best Overall Match
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-3">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        {item.tech.city} ({item.distanceKm} km away)
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold font-num">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {item.tech.averageRating} ({item.tech.totalReviews} reviews)
                      </span>
                      <span>·</span>
                      <span>{item.tech.experienceYears} Years Experience</span>
                    </div>

                    <div className="text-xs text-slate-600 pt-1">
                      <span className="font-semibold text-slate-700">Specializations:</span>{' '}
                      {item.tech.services.join(' · ')}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Radar & Action */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* Score pill */}
                  <div className="text-center lg:text-right">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 font-num">
                      {item.totalScore}
                      <span className="text-sm font-semibold text-slate-400">/100</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      Recommendation Score
                    </div>
                    <div className="text-[10px] text-slate-600 font-num mt-0.5">
                      Skill:{item.serviceMatchScore} · Stars:{item.ratingScore} · GPS:{item.distanceScore} · Slot:{item.availabilityScore}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTechnicianToBook(item.tech, selectedService)}
                    className={`px-5 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 shrink-0 ${
                      isTopMatch
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Book {item.tech.name.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
