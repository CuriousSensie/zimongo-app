import DashboardLayout from '@/components/layouts/DashboardLayout'
import LeadManagement from '@/components/Admin/LeadManagement'
import React from 'react'

const AdminLeadsPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <LeadManagement />
      </div>
    </DashboardLayout>
  )
}

export default AdminLeadsPage;