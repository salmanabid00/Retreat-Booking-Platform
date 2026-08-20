import React from 'react';
import { Inbox, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items available right now matching your criteria.',
  actionLink,
  actionLabel,
  actionOnClick,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 border border-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">{description}</p>

      {actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="gradient-button px-6 py-2.5 rounded-xl text-sm font-semibold text-white inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <Compass className="w-4 h-4" />
          {actionLabel}
        </Link>
      )}

      {actionOnClick && actionLabel && (
        <button
          onClick={actionOnClick}
          className="gradient-button px-6 py-2.5 rounded-xl text-sm font-semibold text-white inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
