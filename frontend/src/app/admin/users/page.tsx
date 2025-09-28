import UserLayout from '@/components/layouts/DashboardLayout'
import UserManagement from '@/components/Admin/UserManagement'
import React from 'react'

const AdminUsersPage = () => {
  return (
    <UserLayout>
      <div className="p-6">
        <UserManagement />
      </div>
    </UserLayout>
  )
}

export default AdminUsersPage;