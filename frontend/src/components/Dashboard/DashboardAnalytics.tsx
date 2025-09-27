"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AnalyticsCard from './AnalyticsCard';
import DashboardSkeleton from './DashboardSkeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  ThumbsUp, 
  Bookmark, 
  Users, 
  Activity,
  Target,
  CheckCircle 
} from 'lucide-react';
import Api from '@/lib/api';
import { cleanText } from '@/utility/text';

interface AnalyticsData {
  leadAnalytics: {
    total: number;
    active: number;
    verified: number;
    mostViewed: { title: string; views: number } | null;
    mostUpvoted: { title: string; upvotes: number } | null;
    mostSaved: { title: string; saveCount: number } | null;
    timeline: Array<{ _id: string; count: number }>;
  };
  profileAnalytics: {
    views: number;
    interactions: number;
    slug: string | null;
  };
  interactionAnalytics: {
    total: number;
    byType: Array<{ _id: string; count: number }>;
    savedLeads: number;
    timeline: Array<{ _id: { date: string; type: string }; count: number }>;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];


const DashboardAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await Api.getUserDashboardAnalytics();
      
      if (!response.status || response.status !== 200) {
        throw new Error('Failed to fetch analytics');
      }
      
      setAnalytics(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  console.log('Fetched Analytics:', analytics);

  const formatInteractionTimeline = (timeline: AnalyticsData['interactionAnalytics']['timeline']) => {
    const groupedByDate = timeline.reduce((acc, item) => {
      const date = item._id.date;
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date][item._id.type] = item.count;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedByDate);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading analytics: {error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Analytics</h1>
        <Badge variant="outline" className="text-sm">
          Last 30 days
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Leads"
          value={analytics.leadAnalytics.total}
          icon={Target}
          color="text-blue-600"
        />
        
        <AnalyticsCard
          title="Active Leads"
          value={analytics.leadAnalytics.active}
          icon={CheckCircle}
          color="text-green-600"
        />
        
        <AnalyticsCard
          title="Total Interactions"
          value={analytics.interactionAnalytics.total}
          icon={Activity}
          color="text-purple-600"
        />
        
        <AnalyticsCard
          title="Saved Leads"
          value={analytics.interactionAnalytics.savedLeads}
          icon={Bookmark}
          color="text-orange-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lead Creation Timeline */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Creation Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.leadAnalytics.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="_id" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [value, 'Leads Created']}
              />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Interaction Types Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Interaction Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.interactionAnalytics.byType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, percent }) => `${cleanText(_id as string)} ${((percent as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.interactionAnalytics.byType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Interaction Timeline */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Interaction Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatInteractionTimeline(analytics.interactionAnalytics.timeline)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <Line type="monotone" dataKey="view_details" stroke="#3B82F6" name="Views" />
              <Line type="monotone" dataKey="upvote" stroke="#10B981" name="Upvotes" />
              <Line type="monotone" dataKey="save" stroke="#F59E0B" name="Saves" />
              <Line type="monotone" dataKey="view_profile" stroke="#EF4444" name="Profile Views" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Performing Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-600" />
            Most Viewed Lead
          </h3>
          {analytics.leadAnalytics.mostViewed ? (
            <div>
              <p className="font-medium text-gray-900 truncate">{analytics.leadAnalytics.mostViewed.title}</p>
              <p className="text-2xl font-bold text-green-600">{analytics.leadAnalytics.mostViewed.views} views</p>
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-orange-600" />
            Most Upvoted Lead
          </h3>
          {analytics.leadAnalytics.mostUpvoted ? (
            <div>
              <p className="font-medium text-gray-900 truncate">{analytics.leadAnalytics.mostUpvoted.title}</p>
              <p className="text-2xl font-bold text-orange-600">{analytics.leadAnalytics.mostUpvoted.upvotes} upvotes</p>
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-blue-600" />
            Most Saved Lead
          </h3>
          {analytics.leadAnalytics.mostSaved ? (
            <div>
              <p className="font-medium text-gray-900 truncate">{analytics.leadAnalytics.mostSaved.title}</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.leadAnalytics.mostSaved.saveCount} saves</p>
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </Card>
      </div>

      {/* Profile Stats */}
      {analytics.profileAnalytics.slug && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Profile Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Profile Views</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.profileAnalytics.views}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Profile Interactions</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.profileAnalytics.interactions}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Profile Slug</p>
              <p className="text-sm font-mono text-gray-900">/{analytics.profileAnalytics.slug}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardAnalytics;