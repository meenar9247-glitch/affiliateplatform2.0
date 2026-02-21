import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';

const TopAffiliates = () => {
  const [timeFrame, setTimeFrame] = useState('month'); // week, month, all
  const [category, setCategory] = useState('all');
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  // Sample data - API se fetch karega
  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame, category]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // API call - replace with actual API
      // const response = await axios.get(`/api/leaderboard?timeFrame=${timeFrame}&category=${category}`);
      // setAffiliates(response.data.affiliates);
      // setUserRank(response.data.userRank);

      // Sample data for demo
      setTimeout(() => {
        const sampleData = [
          {
            id: 1,
            name: 'Rajesh Kumar',
            username: '@rajesh_affiliate',
            avatar: null,
            earnings: 15420,
            referrals: 234,
            conversionRate: 8.5,
            country: 'India',
            badge: 'diamond',
            trend: '+12%'
          },
          {
            id: 2,
            name: 'Priya Singh',
            username: '@priya_marketer',
            avatar: null,
            earnings: 12350,
            referrals: 198,
            conversionRate: 7.8,
            country: 'India',
            badge: 'gold',
            trend: '+8%'
          },
          {
            id: 3,
            name: 'Amit Patel',
            username: '@amit_affiliate',
            avatar: null,
            earnings: 10890,
            referrals: 167,
            conversionRate: 9.2,
            country: 'USA',
            badge: 'gold',
            trend: '+15%'
          },
          {
            id: 4,
            name: 'Neha Gupta',
            username: '@neha_promoter',
            avatar: null,
            earnings: 9870,
            referrals: 145,
            conversionRate: 7.1,
            country: 'India',
            badge: 'silver',
            trend: '+5%'
          },
          {
            id: 5,
            name: 'Vikram Mehta',
            username: '@vikram_earns',
            avatar: null,
            earnings: 8760,
            referrals: 134,
            conversionRate: 6.8,
            country: 'UK',
            badge: 'silver',
            trend: '+10%'
          },
          {
            id: 6,
            name: 'Anjali Sharma',
            username: '@anjali_aff',
            avatar: null,
            earnings: 7650,
            referrals: 123,
            conversionRate: 8.1,
            country: 'India',
            badge: 'bronze',
            trend: '+7%'
          },
          {
            id: 7,
            name: 'Suresh Reddy',
            username: '@suresh_marketing',
            avatar: null,
            earnings: 6540,
            referrals: 112,
            conversionRate: 6.4,
            country: 'India',
            badge: 'bronze',
            trend: '+4%'
          },
          {
            id: 8,
            name: 'Deepika Joshi',
            username: '@deepika_earns',
            avatar: null,
            earnings: 5430,
            referrals: 98,
            conversionRate: 7.3,
            country: 'India',
            badge: 'bronze',
            trend: '+6%'
          },
          {
            id: 9,
            name: 'Rahul Verma',
            username: '@rahul_aff',
            avatar: null,
            earnings: 4320,
            referrals: 87,
            conversionRate: 5.9,
            country: 'India',
            badge: 'new',
            trend: '+20%'
          },
          {
            id: 10,
            name: 'Kavita Malhotra',
            username: '@kavita_promoter',
            avatar: null,
            earnings: 3210,
            referrals: 76,
            conversionRate: 6.2,
            country: 'India',
            badge: 'new',
            trend: '+18%'
          }
        ];
        setAffiliates(sampleData);
        setUserRank({
          rank: 42,
          earnings: 1250,
          referrals: 28
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getBadgeColor = (badge) => {
    switch(badge) {
      case 'diamond': return 'bg-blue-500 text-white';
      case 'gold': return 'bg-yellow-500 text-white';
      case 'silver': return 'bg-gray-400 text-white';
      case 'bronze': return 'bg-orange-600 text-white';
      default: return 'bg-purple-500 text-white';
    }
  };

  const getBadgeIcon = (badge) => {
    switch(badge) {
      case 'diamond': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '🌟';
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500 mr-2" />
            Top Affiliates Leaderboard
          </h1>
          <p className="text-gray-600 mt-2">
            See who's earning the most this {timeFrame}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2">
              {['week', 'month', 'all'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFrame(tf)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeFrame === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'All Time'}
                </button>
              ))}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="tech">Technology</option>
              <option value="fashion">Fashion</option>
              <option value="health">Health & Wellness</option>
              <option value="finance">Finance</option>
            </select>
          </div>
        </div>

        {/* User's Current Rank */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-6 mb-6"
          >
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <p className="text-blue-200 mb-1">Your Current Rank</p>
                <p className="text-3xl font-bold">#{userRank.rank}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-blue-200 text-sm">Earnings</p>
                  <p className="text-xl font-semibold">${userRank.earnings}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Referrals</p>
                  <p className="text-xl font-semibold">{userRank.referrals}</p>
                </div>
              </div>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Improve Rank
              </button>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-500 mt-2">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affiliate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conv. Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {affiliates.map((affiliate, index) => (
                    <motion.tr
                      key={affiliate.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50 transition-colors ${
                        index < 3 ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-lg font-bold ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            index === 2 ? 'text-orange-600' :
                            'text-gray-500'
                          }`}>
                            {getRankIcon(index)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {affiliate.avatar ? (
                              <img src={affiliate.avatar} alt={affiliate.name} className="h-10 w-10 rounded-full" />
                            ) : (
                              affiliate.name.charAt(0)
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {affiliate.name}
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getBadgeColor(affiliate.badge)}`}>
                                {getBadgeIcon(affiliate.badge)} {affiliate.badge}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">{affiliate.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-1" />
                          {affiliate.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                          ${affiliate.earnings.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.referrals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {affiliate.conversionRate}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-sm ${
                          affiliate.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                          {affiliate.trend}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Total Earnings (Top 10)</p>
            <p className="text-2xl font-bold text-gray-900">$84,740</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Total Referrals</p>
            <p className="text-2xl font-bold text-gray-900">1,474</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Avg. Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900">7.5%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Active Countries</p>
            <p className="text-2xl font-bold text-gray-900">4</p>
          </div>
        </div>

        {/* Badge Legend */}
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Badge Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
              <span className="text-sm text-gray-600">Diamond ($10K+)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></span>
              <span className="text-sm text-gray-600">Gold ($5K - $10K)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-gray-400 mr-2"></span>
              <span className="text-sm text-gray-600">Silver ($2K - $5K)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-orange-600 mr-2"></span>
              <span className="text-sm text-gray-600">Bronze ($1K - $2K)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
              <span className="text-sm text-gray-600">New (&lt;$1K)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopAffiliates;
