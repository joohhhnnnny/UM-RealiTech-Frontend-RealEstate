import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RiRobot2Line, 
  RiUserLine, 
  RiEditLine, 
  RiCheckboxCircleLine,
  RiLoader4Line,
  RiErrorWarningLine
} from 'react-icons/ri';
import { userProfileService } from '../services/UserProfileService';

function ProfileStatus({ profileData, setProfileData, onEditProfile, onStartSetup }) {
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkProfileStatus = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await userProfileService.getProfile();
        
        if (response.success) {
          if (response.exists && response.profileData) {
            setProfileExists(true);
            setProfileData(response.profileData);
          } else {
            setProfileExists(false);
            setProfileData(null);
          }
        } else {
          setError('Failed to check profile status');
        }
      } catch (err) {
        console.error('Error checking profile:', err);
        setError('Error checking profile status');
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [setProfileData]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card bg-base-100 shadow-lg p-8 text-center"
      >
        <RiLoader4Line className="w-16 h-16 mx-auto text-primary mb-4 animate-spin" />
        <h3 className="text-xl font-bold mb-2">Checking Profile Status</h3>
        <p className="text-base-content/70">
          Please wait while we check your profile information...
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card bg-base-100 shadow-lg p-8 text-center"
      >
        <RiErrorWarningLine className="w-16 h-16 mx-auto text-error mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Profile</h3>
        <p className="text-base-content/70 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary mx-auto"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  if (!profileExists) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card bg-base-100 shadow-lg p-8 text-center"
      >
        <RiRobot2Line className="w-16 h-16 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-bold mb-2">Welcome! Let's Set Up Your Profile</h3>
        <p className="text-base-content/70 mb-6">
          To get personalized property recommendations, please complete your buyer profile. 
          This is a one-time setup that will help our AI match you with the perfect properties.
        </p>
        <button 
          onClick={onStartSetup} 
          className="btn btn-primary gap-2 mx-auto"
        >
          <RiRobot2Line className="w-5 h-5" />
          Start Profile Setup
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card bg-gradient-to-br from-success/10 to-success/5 border border-success/20 shadow-lg p-8"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-success/20 p-3">
          <RiCheckboxCircleLine className="w-8 h-8 text-success" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-success">Profile Complete!</h3>
          <p className="text-base-content/70 mb-4">
            Your AI buyer profile is set up and ready. You can view personalized recommendations 
            or update your profile anytime.
          </p>
          
          {/* Profile Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-base-100 p-3 rounded-lg border border-base-300/50">
              <div className="text-xs text-base-content/60 mb-1">Buyer Type</div>
              <div className="font-semibold text-sm">{profileData?.buyerType}</div>
            </div>
            <div className="bg-base-100 p-3 rounded-lg border border-base-300/50">
              <div className="text-xs text-base-content/60 mb-1">Budget Range</div>
              <div className="font-semibold text-sm">{profileData?.budgetRange}</div>
            </div>
            <div className="bg-base-100 p-3 rounded-lg border border-base-300/50">
              <div className="text-xs text-base-content/60 mb-1">Location</div>
              <div className="font-semibold text-sm truncate">{profileData?.preferredLocation}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onEditProfile}
              className="btn btn-outline btn-sm gap-2"
            >
              <RiEditLine className="w-4 h-4" />
              Update Profile
            </button>
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <RiUserLine className="w-4 h-4" />
              Last updated: {new Date(profileData?.lastUpdatedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileStatus;
