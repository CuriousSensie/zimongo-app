import UserLayout from '@/components/layouts/DashboardLayout'
import DashboardAnalytics from '@/components/UserDashboard/DashboardAnalytics'
import React from 'react'

const UserDashboard = () => {
  return (
    <UserLayout>
      <DashboardAnalytics />
    </UserLayout>
  )
}

export default UserDashboard;