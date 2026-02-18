import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingCommissions: 0,
    totalReferrals: 0,
    balance: 0,
    clicks: 0,
    conversions: 0,
    conversionRate: 0
  });

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery(
    'dashboard',
    async () => {
      const response = await axios.get('/api/affiliates/stats');
      return response.data;
    },
    {
      onSuccess: (data) => {
        setStats(data.stats);
      },
      onError: (error) => {
        toast.error('Failed to load dashboard data');
      }
    }
  );

  // Chart data for earnings over time
  const earningsChartData = {
    labels: dashboardData?.earningsHistory?.map(item => format(new Date(item.date), 'MMM dd')) || [],
    datasets: [
      {
        label: 'Earnings',
        data: dashboardData?.earningsHistory?.map(item => item.amount) || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  // Traffic sources data
  const trafficData = {
    labels: ['Direct', 'Social Media', 'Email', 'Search', 'Other'],
    datasets: [
      {
        data: dashboardData?.trafficSources || [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  // Recent conversions
  const recentConversions = dashboardData?.recentConversions || [];

  // Top performing links
  const topLinks = dashboardData?.topLinks || [];

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {typeof value === 'number' ? (title.includes('Rate') ? value + '%' : '$' + value.toFixed(2)) : value}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{title}</p>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Here's what's happening with your affiliate marketing today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Earnings"
          value={stats.totalEarnings}
          icon={CurrencyDollarIcon}
          trend={12}
          color="purple"
        />
        <StatCard
          title="Pending Commissions"
          value={stats.pendingCommissions}
          icon={ArrowPathIcon}
          color="yellow"
        />
        <StatCard
          title="Total Referrals"
          value={stats.totalReferrals}
          icon={UsersIcon}
          trend={8}
          color="blue"
        />
        <StatCard
          title="Available Balance"
          value={stats.balance}
          icon={GiftIcon}
          color="green"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Clicks"
          value={stats.clicks}
          icon={ChartBarIcon}
          trend={15}
          color="indigo"
        />
        <StatCard
          title="Conversions"
          value={stats.conversions}
          icon={ArrowTrendingUpIcon}
          trend={5}
          color="pink"
        />
        <StatCard
          title="Conversion Rate"
          value={stats.conversionRate}
          icon={ChartBarIcon}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Earnings Overview
          </h2>
          <Line data={earningsChartData} options={chartOptions} />
        </div>

        {/* Traffic Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Traffic Sources
          </h2>
          <div className="h-64">
            <Doughnut 
              data={trafficData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Conversions and Top Links */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Conversions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Conversions
            </h2>
            <Link 
              to="/earnings" 
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentConversions.map((conversion, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {conversion.productName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(conversion.date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    ${conversion.commission.toFixed(2)}
                  </p>
                  <p className={`text-sm ${
                    conversion.status === 'approved' ? 'text-green-500' :
                    conversion.status === 'pending' ? 'text-yellow-500' :
                    'text-gray-500'
                  }`}>
                    {conversion.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Top Performing Links
            </h2>
            <Link 
              to="/affiliates" 
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {topLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="flex items-center space-x-3">
                  <img 
                    src={link.imageUrl || 'https://via.placeholder.com/40'} 
                    alt={link.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {link.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {link.clicks} clicks · {link.conversions} conversions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">
                    ${link.earnings.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {link.commissionRate}% commission
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
