import UserLayout from "@/components/layouts/UserLayout";
import LeadManagement from "@/components/Lead/LeadManagement";
import React from "react";

const LeadsManagement = () => {
  return (
    <UserLayout>
      <div className="container mx-auto">
        <LeadManagement />
      </div>
    </UserLayout>
  );
};

export default LeadsManagement;
