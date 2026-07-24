import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import Card from './Card';
import Avatar from './Avatar';

export const ProfileCard = ({ profile = {}, name = '', email = '', phone = '', className, ...props }) => {
  const headline = profile.professional_headline || 'Professional Job Seeker';
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || profile.address || 'Location not specified';
  const displayPhone = profile.phone_number || phone || 'Not specified';
  const displayEmail = email || 'Not specified';

  return (
    <Card className={`p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-6 ${className}`} {...props}>
      {/* Photo & Name */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <Avatar
          src={profile.profile_photo_url}
          name={name}
          size="lg"
          className="w-16 h-16 sm:w-20 sm:h-20"
        />
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{name}</h2>
          <p className="text-xs font-bold text-blue-600 tracking-wide uppercase">{headline}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Contact Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2.5">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate" title={displayEmail}>{displayEmail}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{displayPhone}</span>
        </div>
      </div>

      {/* Social Links Row */}
      {(profile.linkedin_url || profile.github_url || profile.portfolio_url) && (
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-4 border-t border-slate-100">
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="p-2 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl text-slate-500 hover:text-blue-600 transition-all flex items-center gap-1.5 font-bold text-xs"
            >
              <Linkedin className="w-4 h-4 shrink-0" />
              <span>LinkedIn</span>
            </a>
          )}
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noreferrer"
              className="p-2 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1.5 font-bold text-xs"
            >
              <Github className="w-4 h-4 shrink-0" />
              <span>GitHub</span>
            </a>
          )}
          {profile.portfolio_url && (
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="p-2 border border-slate-200 hover:border-teal-500 hover:bg-teal-50 rounded-xl text-slate-500 hover:text-teal-600 transition-all flex items-center gap-1.5 font-bold text-xs"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>Portfolio</span>
            </a>
          )}
        </div>
      )}

      {/* Profile Summary text */}
      {profile.professional_summary && (
        <div className="pt-4 border-t border-slate-100 space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">About Candidate</label>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {profile.professional_summary}
          </p>
        </div>
      )}
    </Card>
  );
};

export default ProfileCard;
