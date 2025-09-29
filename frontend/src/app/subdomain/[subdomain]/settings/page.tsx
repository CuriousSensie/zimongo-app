import UserLayout from '@/components/layouts/DashboardLayout'
import SettingsPageComp from '@/components/Profile/UserSettings'
import React from 'react'

const UserSettingsPage = () => {
  return (
    <UserLayout>
      <SettingsPageComp />
    </UserLayout>
  )
}

export default UserSettingsPage