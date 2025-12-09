import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import './ProfileLayout.css';

const ProfileLayout = ({ children }) => {
  return (
    <div className="profile-layout">
      <ProfileSidebar />
      <div className="profile-content-area">
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;
