"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SiteHeader from '@/components/Headers/SiteHeader';
import { IProfile } from '@/types/profile';
import { ILead } from '@/types/lead';
import BusinessProfilePage from '@/components/Profile/BusinessProfilePage';
import { Spinner } from '@/components/common/Loader/Spinner';
import Api from '@/lib/api';
import useUser from '@/hooks/useUser';

const ProfilePage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const user = useUser();
  
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [recentLeads, setRecentLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile by slug
        const profileResponse = await Api.getProfileBySlug(slug);
        const profileData = profileResponse.data.data;
        setProfile(profileData);

        // Fetch recent leads by this profile
        const leadsResponse = await Api.getLeadsByProfileId(profileData._id, { page: 1, limit: 5 });
        setRecentLeads(leadsResponse.data.data || []);
        
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProfileData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
            <p className="text-gray-600">{error || 'The requested profile could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <BusinessProfilePage profile={profile} recentLeads={recentLeads} />
    </div>
  );
};

export default ProfilePage;