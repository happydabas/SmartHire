import React from 'react';
import { Globe, Building2, MapPin, Users } from 'lucide-react';
import Card from './Card';

export const CompanyCard = ({ company = {}, className = '', ...props }) => {
  const websiteLabel = company.website 
    ? company.website.replace(/^https?:\/\/(www\.)?/, '') 
    : '';

  return (
    <Card className={`p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-6 ${className}`} {...props}>
      {/* Branding Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        {company.logo ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm flex items-center justify-center p-1.5 shrink-0">
            <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
        )}
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{company.name || 'Company Name'}</h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-xs text-slate-400 font-semibold">
            {company.industry && (
              <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-500 font-bold text-[10.5px]">
                {company.industry}
              </span>
            )}
            {company.headquarters && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{company.headquarters}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {company.description && (
        <div className="pt-4 border-t border-slate-100 space-y-1.5">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 select-none">
            About Company
          </span>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {company.description}
          </p>
        </div>
      )}

      {/* Structured Details list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
        {company.website && (
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            <a 
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline truncate"
            >
              {websiteLabel || company.website}
            </a>
          </div>
        )}
        {company.company_size && (
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{company.company_size} employees</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CompanyCard;
