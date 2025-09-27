import UserLayout from '@/components/layouts/UserLayout'
import DashboardAnalytics from '@/components/Dashboard/DashboardAnalytics'
import React from 'react'

const UserDashboard = () => {
  return (
    <UserLayout>
      <DashboardAnalytics />
    </UserLayout>
  )
}

export default UserDashboard;