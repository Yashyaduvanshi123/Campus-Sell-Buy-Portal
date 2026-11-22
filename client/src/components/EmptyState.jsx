import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Try adjusting your search terms or filters to find what you are looking for.',
  actionText,
  actionLink,
  onActionClick,
  onAction
}) => {
  const handleAction = onActionClick || onAction;

  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-[#ECE7DE] text-[#292D32] flex items-center justify-center mb-4 border border-[#E5E0D7] shadow-xs">
        <Icon className="w-8 h-8 text-[#B9A58A]" />
      </div>
      <h3 className="text-lg font-black text-[#292D32] mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-[#6B7075] mb-6 leading-relaxed">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-md shadow-[#292D32]/25 border border-[#B9A58A]/30 transition-all"
        >
          {actionText}
        </Link>
      )}

      {actionText && handleAction && !actionLink && (
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-2 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-md shadow-[#292D32]/25 border border-[#B9A58A]/30 transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
