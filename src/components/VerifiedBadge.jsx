import React from 'react';
import { RiVerifiedBadgeFill, RiShieldCheckFill, RiVipCrownFill } from 'react-icons/ri';

function VerifiedBadge({ subscription, className = "" }) {
  const getBadgeConfig = () => {
    switch(subscription) {
      case 'premium':
        return {
          icon: <RiVipCrownFill className="w-4 h-4" />,
          text: 'Premium Verified',
          classes: 'badge-warning text-warning-content'
        };
      case 'professional':
        return {
          icon: <RiShieldCheckFill className="w-4 h-4" />,
          text: 'Pro Verified',
          classes: 'badge-info text-info-content'
        };
      case 'basic':
        return {
          icon: <RiVerifiedBadgeFill className="w-4 h-4" />,
          text: 'Verified',
          classes: 'badge-success text-success-content'
        };
      default:
        return null;
    }
  };

  const badgeConfig = getBadgeConfig();

  if (!badgeConfig) return null;

  return (
    <div className={`badge gap-1 ${badgeConfig.classes} ${className}`}>
      {badgeConfig.icon}
      <span className="text-xs font-medium">{badgeConfig.text}</span>
    </div>
  );
}

export default VerifiedBadge;
