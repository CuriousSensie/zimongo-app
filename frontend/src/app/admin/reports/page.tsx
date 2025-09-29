import DashboardLayout from '@/components/layouts/DashboardLayout'
import ReportsManagement from '@/components/Admin/ReportsManagement'
import React from 'react'

const AdminReportsPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <ReportsManagement />
      </div>
    </DashboardLayout>
  )
}

export default AdminReportsPage;