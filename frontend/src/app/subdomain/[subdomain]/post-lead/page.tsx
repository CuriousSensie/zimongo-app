import UserLayout from '@/components/layouts/DashboardLayout';
import LeadWizard from '@/components/Lead/LeadWizard';
import React from 'react';

const PostLead = () => {
  return (
    <UserLayout>
      <div className="overflow-y-hidden">
        <LeadWizard />
      </div>
    </UserLayout>
  );
};

export default PostLead;