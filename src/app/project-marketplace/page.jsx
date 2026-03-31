'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Target, Mail, Megaphone, Globe, TrendingUp, Zap, Users,
  BarChart3, Briefcase, ChevronRight, X, Star, Clock, CheckCircle,
  Layers, Sparkles, Award, Bot, Send,
  Network, Headphones, FileText, Handshake, Rocket, Building2,
  MapPin, Flame, Trophy, UserCheck, Navigation, ChevronDown,
  Radio, Loader2, ArrowRight, Check, Shield, Play, BadgeCheck
} from 'lucide-react';
import NavbarAuth from '@/components/NavbarAuth';
import { PROJECT_CATEGORIES } from './projects';
import { fetchAllProjects } from '@/lib/catalogApi';

// ============================================
// DISCOVERY MODES
// ============================================
const DISCOVERY_MODES = [
  { id: 'all', label: 'All Projects', icon: Layers, activeBg: 'bg-gray-900', activeText: 'text-white', inactiveText: 'text-gray-600', inactiveBorder: 'border-gray-200' },
  { id: 'trending', label: 'Trending Now', icon: Flame, activeBg: 'bg-orange-500', activeText: 'text-white', inactiveText: 'text-orange-600', inactiveBorder: 'border-orange-200' },
  { id: 'success', label: 'Success Stories', icon: Trophy, activeBg: 'bg-amber-500', activeText: 'text-white', inactiveText: 'text-amber-600', inactiveBorder: 'border-amber-200' },
  { id: 'nearby', label: 'Near You', icon: MapPin, activeBg: 'bg-green-600', activeText: 'text-white', inactiveText: 'text-green-600', inactiveBorder: 'border-green-200' },
  { id: 'foryou', label: 'For You', icon: UserCheck, activeBg: 'bg-blue-600', activeText: 'text-white', inactiveText: 'text-blue-600', inactiveBorder: 'border-blue-200' },
];

const DIFFICULTY_COLORS = {
  Beginner: 'bg-green-100 text-green-700 border-green-200',
  Intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  Advanced: 'bg-orange-100 text-orange-700 border-orange-200',
};

const CITY_COORDS = {
  Mumbai: { lat: 19.07, lon: 72.87 }, Delhi: { lat: 28.61, lon: 77.20 },
  Bangalore: { lat: 12.97, lon: 77.59 }, Hyderabad: { lat: 17.38, lon: 78.48 },
  Pune: { lat: 18.52, lon: 73.85 }, Chennai: { lat: 13.08, lon: 80.27 },
  Kolkata: { lat: 22.57, lon: 88.36 }, Ahmedabad: { lat: 23.02, lon: 72.57 },
  Jaipur: { lat: 26.91, lon: 75.78 }, Noida: { lat: 28.54, lon: 77.39 },
};

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function getNearestCity(lat, lon) {
  let best = null, bestDist = Infinity;
  for (const [city, c] of Object.entries(CITY_COORDS)) { const d = getDistanceKm(lat, lon, c.lat, c.lon); if (d < bestDist) { bestDist = d; best = city; } }
  return best;
}

// ============================================
// APPLY MODAL
// ============================================
function ApplyModal({ project, onClose }) {
  const [pitch, setPitch] = useState('');
  const [rate, setRate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">Your pitch for <span className="font-semibold text-gray-700">{project?.title}</span> has been sent.</p>
        <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-orange-600">Done</button>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div><h2 className="text-lg font-bold text-gray-900">Apply for Project</h2><p className="text-sm text-gray-500">{project?.title}</p></div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Pitch <span className="text-red-500">*</span></label>
            <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} required rows={4} placeholder="Why are you the best person for this project?"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Rate</label>
            <input type="text" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. $500 fixed or $50/hr"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// FEATURED SPOTLIGHT (top trending project)
// ============================================
function FeaturedSpotlight({ project, userRole, onApply }) {
  const router = useRouter();
  const Icon = project.icon;
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${project.gradient} shadow-2xl mb-10`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 px-8 py-10 md:px-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                <Flame className="w-3.5 h-3.5 text-orange-200" /> Featured Project of the Week
              </span>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">{project.number}</span>
              {project.badge && <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">{project.badge}</span>}
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white leading-tight">{project.title}</h2>
                <p className="text-white/80 text-base mt-0.5">{project.subtitle}</p>
              </div>
            </div>

            <p className="text-white/90 text-base leading-relaxed mb-5 max-w-lg">{project.description.slice(0, 180)}...</p>

            {/* Key deliverables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {project.deliverables.slice(0, 4).map((d) => (
                <div key={d} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/90 text-sm">{d}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2.5 w-fit border border-white/10">
              <Trophy className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <p className="text-white/90 text-sm italic">{project.successHighlight}</p>
              <span className="font-black text-yellow-300 text-sm ml-1 whitespace-nowrap">{project.successROI}</span>
            </div>
          </div>

          {/* Right: stats + CTA */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Starting from</p>
              <p className="text-3xl font-black text-gray-900 mb-1">{project.budgetRange}</p>
              <p className="text-xs text-gray-400 mb-5">{project.duration} · {project.difficulty}</p>

              <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-gray-100">
                {[
                  { icon: Star, val: project.avgRating, label: 'Rating', color: 'text-amber-500' },
                  { icon: CheckCircle, val: project.completedCount + '+', label: 'Done', color: 'text-green-500' },
                  { icon: Users, val: project.expertCount, label: 'Experts', color: 'text-blue-500' },
                ].map((s) => { const SI = s.icon; return (
                  <div key={s.label} className="text-center">
                    <SI className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                    <p className="text-base font-black text-gray-900">{s.val}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ); })}
              </div>

              {/* Trending count */}
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mb-4">
                <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-orange-700">{project.trendingLabel}</span>
              </div>

              <button
                onClick={() => router.push(userRole === 'expert' ? `/project-marketplace/${project.id}` : `/project-marketplace/${project.id}/overview`)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 mb-2"
              >
                <Rocket className="w-4 h-4" /> {userRole === 'expert' ? 'Apply Now' : 'Get Started'}
              </button>
              <button onClick={() => router.push(`/project-marketplace/${project.id}`)} className="w-full py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
                View Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PROMOTIONAL PROJECT ROW
// ============================================
function ProjectRow({ project, userRole, discoveryMode, userCity, userIndustry, onApply, index }) {
  const router = useRouter();
  const Icon = project.icon;

  const score = discoveryMode === 'foryou' && userIndustry ? (project.matchScore?.[userIndustry] || 70) : null;
  const nearbyCount = discoveryMode === 'nearby' && userCity ? (project.nearbyExpertCount?.[userCity] || 0) : null;

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300">
      <div className="flex flex-col lg:flex-row">

        {/* Left accent bar */}
        <div className={`w-full lg:w-1.5 h-1.5 lg:h-auto bg-gradient-to-r lg:bg-gradient-to-b ${project.gradient} flex-shrink-0`} />

        {/* Icon column */}
        <div className={`${project.bgLight} border-b lg:border-b-0 lg:border-r ${project.borderColor} px-6 py-5 lg:py-6 flex lg:flex-col items-center justify-start lg:justify-center gap-4 lg:gap-3 lg:w-36 flex-shrink-0`}>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="lg:text-center">
            <p className={`text-xs font-bold ${project.textColor} leading-tight`}>{project.number}</p>
            <span className={`hidden lg:inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[project.difficulty]}`}>{project.difficulty}</span>
          </div>
          {/* Badge (desktop) */}
          {project.badge && (
            <span className="hidden lg:block text-xs font-bold text-center px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-sm leading-tight">
              {project.badge}
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 py-5 lg:py-6 min-w-0">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">{project.title}</h3>
            {project.badge && <span className="lg:hidden text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-orange-500 text-white">{project.badge}</span>}
            {project.trending && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                <Flame className="w-3 h-3" /> {project.trendingCount} this week
              </span>
            )}
            {score !== null && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                <Sparkles className="w-3 h-3" /> {score}% match
              </span>
            )}
            {nearbyCount !== null && nearbyCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                <MapPin className="w-3 h-3" /> {nearbyCount} in {userCity}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-gray-500 mb-3">{project.subtitle}</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-2xl">{project.tagline}</p>

          {/* Deliverables preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
            {project.deliverables.slice(0, 4).map((d) => (
              <div key={d} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{d}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.expertSkills.slice(0, 6).map((skill) => (
              <span key={skill} className="text-xs border border-gray-200 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full font-medium">{skill}</span>
            ))}
            {project.expertSkills.length > 6 && (
              <span className="text-xs border border-gray-200 text-gray-400 px-2.5 py-1 rounded-full">+{project.expertSkills.length - 6} more</span>
            )}
          </div>

          {/* Success story strip */}
          <div className={`flex items-center gap-3 ${project.bgLight} border ${project.borderColor} rounded-xl px-4 py-2.5`}>
            <Trophy className={`w-4 h-4 ${project.textColor} flex-shrink-0`} />
            <p className={`text-sm ${project.textColor} font-medium italic flex-1 min-w-0 truncate`}>{project.successHighlight}</p>
            <span className={`text-sm font-black ${project.textColor} flex-shrink-0`}>{project.successROI}</span>
          </div>

          {/* Sub-projects tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {project.subProjects.map((sub) => (
              <span key={sub} className={`text-xs font-semibold px-3 py-1 rounded-full ${project.bgLight} ${project.textColor} border ${project.borderColor}`}>{sub}</span>
            ))}
          </div>
        </div>

        {/* Right: Price + CTA */}
        <div className="border-t lg:border-t-0 lg:border-l border-gray-100 px-6 py-5 lg:py-6 flex flex-col justify-between gap-4 lg:w-56 flex-shrink-0">
          {/* Price block */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Starting from</p>
            <p className="text-2xl font-black text-gray-900 leading-tight">{project.budgetRange}</p>

            <div className="mt-3 space-y-2">
              {[
                { icon: Star, val: `${project.avgRating} rating`, color: 'text-amber-500', fill: true },
                { icon: CheckCircle, val: `${project.completedCount} completed`, color: 'text-green-500' },
                { icon: Users, val: `${project.expertCount} experts`, color: 'text-blue-500' },
                { icon: Clock, val: project.duration, color: 'text-gray-400' },
              ].map((s) => { const SI = s.icon; return (
                <div key={s.val} className="flex items-center gap-2">
                  <SI className={`w-3.5 h-3.5 flex-shrink-0 ${s.color} ${s.fill ? 'fill-amber-400' : ''}`} />
                  <span className="text-xs text-gray-600 font-medium">{s.val}</span>
                </div>
              ); })}
            </div>

            {/* City dots */}
            {project.expertCities.slice(0, 4).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1.5">Available in</p>
                <div className="flex flex-wrap gap-1">
                  {project.expertCities.slice(0, 4).map((city) => (
                    <span key={city} className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-medium">{city}</span>
                  ))}
                  {project.expertCities.length > 4 && (
                    <span className="text-xs text-gray-400 px-1 py-0.5">+{project.expertCities.length - 4}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            {userRole === 'expert' ? (
              <button onClick={() => onApply(project)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
                <Send className="w-4 h-4" /> Apply Now
              </button>
            ) : (
              <button onClick={() => router.push(`/project-marketplace/${project.id}/overview`)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
                <Rocket className="w-4 h-4" /> Get Started
              </button>
            )}
            <button onClick={() => router.push(`/project-marketplace/${project.id}`)}
              className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all flex items-center justify-center gap-1.5">
              View Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MID-PAGE PROMO CALLOUT
// ============================================
function PromoCallout({ type }) {
  if (type === 'platform') return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-7 my-6">
      <div className="absolute inset-0 opacity-10"><div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" /></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-lg mb-1">Let Karya-AI Handle Everything</p>
            <p className="text-blue-200 text-sm leading-relaxed max-w-lg">Don't have time to manage projects yourself? Our Platform Managed service assembles your team, runs the project, and delivers results — you just approve the outputs.</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
            <BadgeCheck className="w-4 h-4 text-green-300" />
            <span className="text-white text-xs font-semibold">SLA-backed delivery</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
            <Shield className="w-4 h-4 text-blue-300" />
            <span className="text-white text-xs font-semibold">Dedicated success manager</span>
          </div>
          <button className="mt-1 px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> Request Quote
          </button>
        </div>
      </div>
    </div>
  );

  if (type === 'agency') return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 px-8 py-6 my-6">
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-gray-900 font-black text-lg mb-1">Prefer Working with an Agency?</p>
            <p className="text-gray-600 text-sm leading-relaxed max-w-lg">Browse vetted specialist agencies in our Leads network — fully managed teams with account managers, proven SOPs, and 30-day performance guarantees.</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Link href="/leads" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> Browse Agencies
          </Link>
        </div>
      </div>
    </div>
  );

  return null;
}

// ============================================
// TRUST STRIP
// ============================================
function TrustStrip() {
  return (
    <div className="bg-gray-50 border-y border-gray-200 py-5 px-6 overflow-hidden">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          {[
            { icon: Shield, label: 'All experts vetted & background-checked', color: 'text-blue-500' },
            { icon: BadgeCheck, label: 'SLA-backed delivery on every project', color: 'text-green-500' },
            { icon: Trophy, label: '743+ projects completed successfully', color: 'text-amber-500' },
            { icon: Star, label: '4.8 average client satisfaction rating', color: 'text-orange-500' },
            { icon: Users, label: '180+ active fractional experts', color: 'text-violet-500' },
          ].map((item) => {
            const II = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2">
                <II className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                <span className="font-medium text-gray-700 whitespace-nowrap">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BOTTOM CTA BANNER
// ============================================
function BottomCTA({ userRole }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 mt-12 px-6 py-14">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          {userRole === 'expert' ? 'Join 180+ experts earning on Karya-AI' : 'Trusted by 400+ growing businesses'}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          {userRole === 'expert' ? 'Ready to work on projects\nyou actually love?' : "Ready to 10x your growth\nwith the right team?"}
        </h2>
        <p className="text-gray-400 text-base mb-8 leading-relaxed max-w-xl mx-auto">
          {userRole === 'expert'
            ? 'Browse live projects, submit your pitch, and get matched with businesses that need exactly what you offer.'
            : 'Pick a project, choose how you want to work, and get matched with vetted experts who have done it before.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={userRole === 'expert' ? '/expert-marketplace' : '/project-marketplace/virtual-assistant-marketing'}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-xl text-sm flex items-center justify-center gap-2">
            <Rocket className="w-4 h-4" /> {userRole === 'expert' ? 'Find Projects Now' : 'Start Your First Project'}
          </Link>
          <Link href="/expert-marketplace"
            className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> Browse Expert Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function ProjectMarketplace() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [userRole, setUserRole] = useState('owner');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyProject, setApplyProject] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [discoveryMode, setDiscoveryMode] = useState('all');
  const [userIndustry, setUserIndustry] = useState('');
  const [userCity, setUserCity] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle');
  const [manualCity, setManualCity] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch projects from backend
  useEffect(() => {
    fetchAllProjects()
      .then(({ projects }) => setProjects(projects))
      .catch(console.error)
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      try { const u = JSON.parse(userData); setUserRole(u.activeRole === 'expert' ? 'expert' : 'owner'); if (u.industry) setUserIndustry(u.industry); } catch { }
    }
    const od = typeof window !== 'undefined' ? localStorage.getItem('onboardingData') : null;
    if (od) { try { const d = JSON.parse(od); const ind = d?.companyDetails?.industry || d?.industry; if (ind) setUserIndustry(ind); } catch { } }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return; }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserCity(getNearestCity(pos.coords.latitude, pos.coords.longitude) || ''); setLocationStatus('set'); },
      () => setLocationStatus('denied')
    );
  };

  useEffect(() => { if (discoveryMode === 'nearby' && locationStatus === 'idle') detectLocation(); }, [discoveryMode]);

  const activeCity = userCity || manualCity;

  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesDifficulty = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || (p.subtitle || '').toLowerCase().includes(q) || (p.expertSkills || []).some(s => s.toLowerCase().includes(q)) || (p.targetFor || []).some(t => t.toLowerCase().includes(q));
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
    if (discoveryMode === 'trending') { list = list.filter(p => p.trending).sort((a, b) => b.trendingCount - a.trendingCount); }
    else if (discoveryMode === 'success') { list = [...list].sort((a, b) => b.completedCount * b.avgRating - a.completedCount * a.avgRating); }
    else if (discoveryMode === 'nearby' && activeCity) { list = list.filter(p => (p.nearbyExpertCount?.[activeCity] || 0) > 0).sort((a, b) => (b.nearbyExpertCount?.[activeCity] || 0) - (a.nearbyExpertCount?.[activeCity] || 0)); }
    else if (discoveryMode === 'foryou' && userIndustry) { list = [...list].sort((a, b) => (b.matchScore?.[userIndustry] || 60) - (a.matchScore?.[userIndustry] || 60)); }
    return list;
  }, [projects, selectedCategory, searchQuery, difficultyFilter, discoveryMode, activeCity, userIndustry]);

  // Featured = top trending project
  const trendingProjects = projects.filter(p => p.trending);
  const featuredProject = trendingProjects.length > 0
    ? trendingProjects.reduce((best, p) => p.trendingCount > best.trendingCount ? p : best, trendingProjects[0])
    : null;
  const totalExperts = projects.reduce((s, p) => s + (p.expertCount || 0), 0);
  const totalCompleted = projects.reduce((s, p) => s + (p.completedCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Karya<span className="text-blue-600">AI</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/expert-marketplace" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors hidden sm:block">Expert Marketplace</Link>
            <NavbarAuth theme="light" loginRole={userRole === 'expert' ? 'expert' : 'owner'} />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  <Zap className="w-3 h-3 text-orange-500" />
                  {userRole === 'expert' ? 'Find Projects & Get Paid' : 'GTM Project Catalog — Powered by AI Experts'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
                {userRole === 'expert' ? 'Projects Built for\nExperts Like You' : 'Pre-Built Projects\nThat Drive Real Growth'}
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
                {userRole === 'expert'
                  ? 'Browse live project blueprints across sales, marketing, and growth. Submit your pitch and get matched with businesses that need your exact expertise.'
                  : 'Each project is a proven GTM blueprint — structured deliverables, vetted experts, and a success track record. Pick one, choose how to hire, and start in 24 hours.'}
              </p>
            </div>

            {/* Role toggle + stats */}
            <div className="flex flex-col items-start lg:items-end gap-4">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setUserRole('owner')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'owner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Building2 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Business View
                </button>
                <button onClick={() => setUserRole('expert')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'expert' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Award className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Expert View
                </button>
              </div>
              <div className="flex items-center gap-6">
                {[
                  { label: 'Project Types', value: projects.length || 12, color: 'text-blue-600' },
                  { label: 'Active Experts', value: totalExperts + '+', color: 'text-orange-500' },
                  { label: 'Completed', value: totalCompleted + '+', color: 'text-green-500' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <TrustStrip />

      {/* Discovery Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {DISCOVERY_MODES.map((mode) => {
              const MIcon = mode.icon;
              const isActive = discoveryMode === mode.id;
              return (
                <button key={mode.id} onClick={() => { setDiscoveryMode(mode.id); if (mode.id === 'nearby' && locationStatus === 'idle') detectLocation(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap flex-shrink-0 ${isActive ? `${mode.activeBg} ${mode.activeText} border-transparent shadow-md` : `bg-white ${mode.inactiveText} ${mode.inactiveBorder} hover:shadow-sm`}`}>
                  <MIcon className="w-4 h-4" />
                  {mode.label}
                  {mode.id === 'trending' && <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>{trendingProjects.length}</span>}
                  {mode.id === 'nearby' && activeCity && <span className={`text-xs ${isActive ? 'text-white/80' : 'text-green-600'}`}>{activeCity}</span>}
                  {mode.id === 'foryou' && userIndustry && <span className={`text-xs truncate max-w-[80px] ${isActive ? 'text-white/80' : 'text-blue-500'}`}>{userIndustry}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Context banners */}
      {discoveryMode === 'trending' && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-orange-800">Trending Now — {trendingProjects.length} projects with highest activity this week, sorted by momentum</p>
          </div>
        </div>
      )}
      {discoveryMode === 'success' && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-amber-800">Success Stories — Sorted by track record. Every row below shows a real result from a past client.</p>
          </div>
        </div>
      )}
      {discoveryMode === 'nearby' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-800">
                {locationStatus === 'detecting' ? 'Detecting your location...' : activeCity ? `Showing projects with experts near ${activeCity}` : 'Select your city below'}
              </p>
              {locationStatus === 'detecting' && <Loader2 className="w-4 h-4 text-green-500 animate-spin" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.keys(CITY_COORDS).map(city => (
                <button key={city} onClick={() => { setManualCity(city); setUserCity(city); setLocationStatus('manual'); }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${activeCity === city ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'}`}>
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {discoveryMode === 'foryou' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-blue-800">
                {userIndustry ? `Personalised for ${userIndustry} — sorted by match score` : 'Complete your onboarding to get personalised project recommendations'}
              </p>
            </div>
            {!userIndustry && <Link href="/onboarding-owner/company-details" className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-orange-500 px-3 py-1.5 rounded-lg">Complete Onboarding →</Link>}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, skills, or industries..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 shadow-sm" />
          </div>
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {PROJECT_CATEGORIES.slice(0, 6).map((cat) => {
              const CI = cat.icon;
              return (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap flex-shrink-0 transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-600'}`}>
                  <CI className="w-3.5 h-3.5" /> {cat.label}
                </button>
              );
            })}
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white text-gray-600 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0">
              {PROJECT_CATEGORIES.slice(6).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          {/* Difficulty filter */}
          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0">
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            <span className="font-black text-gray-900 text-base">{filteredProjects.length}</span> project{filteredProjects.length !== 1 ? 's' : ''} found
            {discoveryMode !== 'all' && <span className="ml-2 font-semibold text-gray-700">· {discoveryMode === 'trending' ? '🔥 Trending' : discoveryMode === 'success' ? '🏆 Success Stories' : discoveryMode === 'nearby' && activeCity ? `📍 Near ${activeCity}` : discoveryMode === 'foryou' && userIndustry ? `✨ For ${userIndustry}` : ''}</span>}
          </p>
          {userRole === 'expert' && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 rounded-xl px-4 py-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-gray-700">Expert view — click Apply Now on any project</span>
            </div>
          )}
        </div>

        {/* Featured Spotlight */}
        {discoveryMode === 'all' && !searchQuery && selectedCategory === 'all' && featuredProject && (
          <FeaturedSpotlight project={featuredProject} userRole={userRole} onApply={setApplyProject} />
        )}

        {/* Project list */}
        {loadingProjects ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            {discoveryMode === 'nearby' && !activeCity ? (
              <>
                <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-black text-gray-700 text-lg mb-2">Set your location first</p>
                <p className="text-sm text-gray-500 mb-4">Grant location access or pick a city above to see nearby experts</p>
                <button onClick={detectLocation} className="px-6 py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors">Detect My Location</button>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-black text-gray-700 text-lg mb-2">No projects match your filters</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setDifficultyFilter('all'); }}
                  className="mt-4 px-5 py-2.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">Clear Filters</button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project, index) => (
              <div key={project.id}>
                <ProjectRow
                  project={project}
                  userRole={userRole}
                  discoveryMode={discoveryMode}
                  userCity={activeCity}
                  userIndustry={userIndustry}
                  onApply={setApplyProject}
                  index={index}
                />
                {/* Insert promo callout every 4 items */}
                {index === 3 && <PromoCallout type="platform" />}
                {index === 7 && <PromoCallout type="agency" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <BottomCTA userRole={userRole} />

      {/* Apply Modal */}
      {applyProject && <ApplyModal project={applyProject} onClose={() => setApplyProject(null)} />}
    </div>
  );
}
