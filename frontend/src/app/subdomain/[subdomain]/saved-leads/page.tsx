import UserLayout from '@/components/layouts/DashboardLayout'
import SavedLeadsComp from '@/components/Lead/SavedLeads'
import React from 'react'

const SavedLeadsPage = () => {
  return (
    <UserLayout>
      <SavedLeadsComp />
    </UserLayout>
  )
}

export default SavedLeadsPage