import UserLayout from '@/components/layouts/DashboardLayout'
import DashboardAnalytics from '@/components/UserDashboard/DashboardAnalytics'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, Shield, BarChart3 } from 'lucide-react'
import React from 'react'

const AdminDashboard = () => {
  const quickActions = [
    {
      title: "User Management",
      description: "Manage user accounts, activate/deactivate users",
      icon: Users,
      href: "/users",
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Leads Management", 
      description: "Monitor and manage user leads",
      icon: FileText,
      href: "/leads",
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Permissions",
      description: "Configure user roles and permissions",
      icon: Shield,
      href: "/permissions",
      color: "text-purple-600 bg-purple-100"
    },
    {
      title: "Reports & Analytics",
      description: "View system analytics and reports",
      icon: BarChart3,
      href: "/analytics",
      color: "text-orange-600 bg-orange-100"
    }
  ];

  return (
    <UserLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to the administration panel</p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="h-full p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{action.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <DashboardAnalytics />
        </div>
      </div>
    </UserLayout>
  )
}

export default AdminDashboard;