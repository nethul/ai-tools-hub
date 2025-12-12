import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Scale } from 'lucide-react';
import { FactCheckResult } from './FactCheckTypes';

interface VerdictBadgeProps {
    verdict: FactCheckResult['verdict'];
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict }) => {
    switch (verdict) {
        case 'True':
            return (
                <div className="flex items-center gap-2 bg-emerald-900/30 text-emerald-400 px-4 py-2 rounded-full font-bold border border-emerald-800">
                    <CheckCircle className="w-5 h-5" />
                    <span>TRUE</span>
                </div>
            );
        case 'False':
            return (
                <div className="flex items-center gap-2 bg-rose-900/30 text-rose-400 px-4 py-2 rounded-full font-bold border border-rose-800">
                    <XCircle className="w-5 h-5" />
                    <span>FALSE</span>
                </div>
            );
        case 'Misleading':
            return (
                <div className="flex items-center gap-2 bg-amber-900/30 text-amber-400 px-4 py-2 rounded-full font-bold border border-amber-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span>MISLEADING</span>
                </div>
            );
        case 'Mixed':
            return (
                <div className="flex items-center gap-2 bg-orange-900/30 text-orange-400 px-4 py-2 rounded-full font-bold border border-orange-800">
                    <Scale className="w-5 h-5" />
                    <span>MIXED / COMPLICATED</span>
                </div>
            );
        default:
            return (
                <div className="flex items-center gap-2 bg-slate-700 text-slate-300 px-4 py-2 rounded-full font-bold border border-slate-600">
                    <HelpCircle className="w-5 h-5" />
                    <span>UNVERIFIED</span>
                </div>
            );
    }
};
