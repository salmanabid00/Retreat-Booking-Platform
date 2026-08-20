import React from 'react';
import { Check, X } from 'lucide-react';

export const checkPasswordRules = (password = '') => {
  return [
    { label: 'Minimum 8 characters', satisfied: password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', satisfied: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter (a-z)', satisfied: /[a-z]/.test(password) },
    { label: 'At least one number (0-9)', satisfied: /[0-9]/.test(password) },
    { label: 'At least one special character (!@#$%^&*)', satisfied: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
};

const PasswordStrengthIndicator = ({ password = '' }) => {
  if (!password) return null;

  const rules = checkPasswordRules(password);
  const satisfiedCount = rules.filter((r) => r.satisfied).length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-rose-500';
  let widthPercent = '20%';

  if (satisfiedCount >= 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    widthPercent = '100%';
  } else if (satisfiedCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
    widthPercent = '60%';
  } else if (satisfiedCount >= 1) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-rose-500';
    widthPercent = '40%';
  }

  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-in fade-in">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-slate-400">Password Strength:</span>
          <span className={satisfiedCount >= 5 ? 'text-emerald-400 font-bold' : satisfiedCount >= 3 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
            {strengthLabel} ({satisfiedCount}/5)
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColor}`}
            style={{ width: widthPercent }}
          ></div>
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className={`p-0.5 rounded-full ${rule.satisfied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              {rule.satisfied ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </div>
            <span className={rule.satisfied ? 'text-slate-200 font-medium' : 'text-slate-500'}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
