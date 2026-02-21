import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  StarIcon, 
  FireIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BoltIcon,
  CheckBadgeIcon,
  LockClosedIcon,
  ChartBarIcon,
  GiftIcon,
  ShieldCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnlocked, setShowUnlocked] = useState('all'); // all, unlocked, locked

  // Sample data - API se fetch karega
  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      // API call - replace with actual API
      // const response = await axios.get('/api/achievements');
      // setAchievements(response.data.achievements);
      // setUserStats(response.data.userStats);

      // Sample data for demo
      setTimeout(() => {
        const sampleAchievements = [
          // Earnings Achievements
          {
            id: 1,
            title: 'First Earnings',
            description: 'Earn your first $100 in commissions',
            icon: '💰',
            category: 'earnings',
            requirement: 100,
            progress: 100,
            unlocked: true,
            unlockedAt: '2024-01-15',
            reward: '100 Bonus Points',
            rarity: 'common'
          },
          {
            id: 2,
            title: 'Money Maker',
            description: 'Earn total $1,000 in commissions',
            icon: '💵',
            category: 'earnings',
            requirement: 1000,
            progress: 850,
            unlocked: false,
            reward: '500 Bonus Points',
            rarity: 'rare'
          },
          {
            id: 3,
            title: 'Six Figure Affiliate',
            description: 'Earn $10,000 in total commissions',
            icon: '🤑',
            category: 'earnings',
            requirement: 10000,
            progress: 3850,
            unlocked: false,
            reward: 'Gold Badge + 2000 Points',
            rarity: 'legendary'
          },

          // Referral Achievements
          {
            id: 4,
            title: 'First Referral',
            description: 'Get your first referral signup',
            icon: '👥',
            category: 'referrals',
            requirement: 1,
            progress: 1,
            unlocked: true,
            unlockedAt: '2024-01-10',
            reward: '50 Bonus Points',
            rarity: 'common'
          },
          {
            id: 5,
            title: 'Team Builder',
            description: 'Get 10 active referrals',
            icon: '🤝',
            category: 'referrals',
            requirement: 10,
            progress: 7,
            unlocked: false,
            reward: 'Team Builder Badge',
            rarity: 'rare'
          },
          {
            id: 6,
            title: 'Network King',
            description: 'Get 50 active referrals',
            icon: '👑',
            category: 'referrals',
            requirement: 50,
            progress: 12,
            unlocked: false,
            reward: 'King Badge + 5000 Points',
            rarity: 'legendary'
          },

          // Conversion Achievements
          {
            id: 7,
            title: 'First Conversion',
            description: 'Get your first sale conversion',
            icon: '🎯',
            category: 'conversions',
            requirement: 1,
            progress: 1,
            unlocked: true,
            unlockedAt: '2024-01-12',
            reward: '100 Points',
            rarity: 'common'
          },
          {
            id: 8,
            title: 'Conversion Master',
            description: 'Achieve 10% conversion rate',
            icon: '📈',
            category: 'conversions',
            requirement: 10,
            progress: 8.5,
            progressType: 'percentage',
            unlocked: false,
            reward: 'Master Badge',
            rarity: 'epic'
          },
          {
            id: 9,
            title: 'Sales Machine',
            description: 'Get 100 total conversions',
            icon: '⚡',
            category: 'conversions',
            requirement: 100,
            progress: 23,
            unlocked: false,
            reward: '5000 Points',
            rarity: 'legendary'
          },

          // Click Achievements
          {
            id: 10,
            title: 'Click Starter',
            description: 'Get 100 total clicks',
            icon: '👆',
            category: 'clicks',
            requirement: 100,
            progress: 100,
            unlocked: true,
            unlockedAt: '2024-01-08',
            reward: '50 Points',
            rarity: 'common'
          },
          {
            id: 11,
            title: 'Click Pro',
            description: 'Get 1,000 total clicks',
            icon: '🖱️',
            category: 'clicks',
            requirement: 1000,
            progress: 850,
            unlocked: false,
            reward: '500 Points',
            rarity: 'rare'
          },
          {
            id: 12,
            title: 'Viral Sensation',
            description: 'Get 10,000 total clicks',
            icon: '📱',
            category: 'clicks',
            requirement: 10000,
            progress: 2350,
            unlocked: false,
            reward: 'Viral Badge',
            rarity: 'legendary'
          },

          // Streak Achievements
          {
            id: 13,
            title: '7 Day Streak',
            description: 'Get at least 1 conversion for 7 days in a row',
            icon: '🔥',
            category: 'streak',
            requirement: 7,
            progress: 7,
            unlocked: true,
            unlockedAt: '2024-01-20',
            reward: 'Streak Badge',
            rarity: 'rare'
          },
          {
            id: 14,
            title: '30 Day Streak',
            description: 'Get at least 1 conversion for 30 days in a row',
            icon: '⚡',
            category: 'streak',
            requirement: 30,
            progress: 12,
            unlocked: false,
            reward: 'Legendary Streak Badge',
            rarity: 'epic'
          },
          {
            id: 15,
            title: 'Year Long Streak',
            description: 'Get at least 1 conversion for 365 days in a row',
            icon: '🌠',
            category: 'streak',
            requirement: 365,
            progress: 45,
            unlocked: false,
            reward: 'Immortal Badge',
            rarity: 'legendary'
          },

          // Special Achievements
          {
            id: 16,
            title: 'Early Bird',
            description: 'Join the platform in the first month',
            icon: '🐦',
            category: 'special',
            requirement: 1,
            progress: 1,
            unlocked: true,
            unlockedAt: '2024-01-05',
            reward: 'Early Adopter Badge',
            rarity: 'rare'
          },
          {
            id: 17,
            title: 'Social Butterfly',
            description: 'Share your referral links on all social platforms',
            icon: '🦋',
            category: 'special',
            requirement: 5,
            progress: 3,
            progressType: 'count',
            unlocked: false,
            reward: 'Social Badge',
            rarity: 'rare'
          },
          {
            id: 18,
            title: 'Top 10',
            description: 'Reach top 10 on leaderboard',
            icon: '🏆',
            category: 'special',
            requirement: 10,
            progress: 42,
            progressType: 'rank',
            unlocked: false,
            reward: 'Champion Badge',
            rarity: 'legendary'
          }
        ];

        const sampleUserStats = {
          totalEarnings: 3850,
          totalReferrals: 12,
          totalClicks: 2350,
          totalConversions: 23,
          conversionRate: 8.5,
          currentStreak: 12,
          longestStreak: 15,
          rank: 42,
          points: 1250,
          badges: ['early-bird', 'first-earnings', 'streak-7']
        };

        setAchievements(sampleAchievements);
        setUserStats(sampleUserStats);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Achievements', icon: '🏆' },
    { id: 'earnings', name: 'Earnings', icon: '💰' },
    { id: 'referrals', name: 'Referrals', icon: '👥' },
    { id: 'conversions', name: 'Conversions', icon: '🎯' },
    { id: 'clicks', name: 'Clicks', icon: '👆' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'special', name: 'Special', icon: '✨' }
  ];

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBg = (rarity) => {
    switch(rarity) {
      case 'common': return 'bg-gray-100 border-gray-300';
      case 'rare': return 'bg-blue-50 border-blue-200';
      case 'epic': return 'bg-purple-50 border-purple-200';
      case 'legendary': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getProgressDisplay = (achievement) => {
    if (achievement.unlocked) return '100%';
    if (achievement.progressType === 'percentage') {
      return `${achievement.progress}% / ${achievement.requirement}%`;
    }
    if (achievement.progressType === 'rank') {
      return `#${achievement.progress} / Top ${achievement.requirement}`;
    }
    return `${achievement.progress} / ${achievement.requirement}`;
  };

  const getProgressPercentage = (achievement) => {
    if (achievement.unlocked) return 100;
    if (achievement.progressType === 'percentage') {
      return (achievement.progress / achievement.requirement) * 100;
    }
    if (achievement.progressType === 'rank') {
      return achievement.progress <= achievement.requirement ? 100 : 
        Math.max(0, 100 - ((achievement.progress - achievement.requirement) * 2));
    }
    return (achievement.progress / achievement.requirement) * 100;
  };

  const filteredAchievements = achievements.filter(ach => {
    if (selectedCategory !== 'all' && ach.category !== selectedCategory) return false;
    if (showUnlocked === 'unlocked' && !ach.unlocked) return false;
    if (showUnlocked === 'locked' && ach.unlocked) return false;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500 mr-2" />
            Achievements & Rewards
          </h1>
          <p className="text-gray-600 mt-2">
            Unlock achievements, earn badges, and climb the ranks
          </p>
        </div>

        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.points}</p>
                </div>
                <StarIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">{unlockedCount}/{totalCount}</p>
                </div>
                <CheckBadgeIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.currentStreak} days</p>
                </div>
                <FireIcon className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Global Rank</p>
                  <p className="text-2xl font-bold text-gray-900">#{userStats.rank}</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Overall Progress</h3>
            <span className="text-sm text-gray-600">{Math.round(completionPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            You've unlocked {unlockedCount} out of {totalCount} achievements
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={showUnlocked}
                onChange={(e) => setShowUnlocked(e.target.value)}
                className="border rounded-lg px-4 py-2 bg-white"
              >
                <option value="all">All</option>
                <option value="unlocked">Unlocked</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 mt-2">Loading achievements...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative rounded-lg shadow-lg overflow-hidden border-2 ${
                  achievement.unlocked 
                    ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white`
                    : getRarityBg(achievement.rarity)
                }`}
              >
                {!achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    {achievement.unlocked && (
                      <span className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium">
                        Unlocked
                      </span>
                    )}
                  </div>

                  <h3 className={`text-lg font-bold mb-2 ${
                    achievement.unlocked ? 'text-white' : 'text-gray-900'
                  }`}>
                    {achievement.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${
                    achievement.unlocked ? 'text-white text-opacity-90' : 'text-gray-600'
                  }`}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={achievement.unlocked ? 'text-white' : 'text-gray-600'}>
                        Progress
                      </span>
                      <span className={achievement.unlocked ? 'text-white font-bold' : 'text-gray-900 font-medium'}>
                        {getProgressDisplay(achievement)}
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${
                      achievement.unlocked ? 'bg-white bg-opacity-30' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          achievement.unlocked 
                            ? 'bg-white' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}
                        style={{ width: `${getProgressPercentage(achievement)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Reward */}
                  <div className={`flex items-center text-sm ${
                    achievement.unlocked ? 'text-white text-opacity-90' : 'text-gray-500'
                  }`}>
                    <GiftIcon className="h-4 w-4 mr-1" />
                    Reward: {achievement.reward}
                  </div>

                  {/* Unlock Date */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className={`mt-2 text-xs ${
                      achievement.unlocked ? 'text-white text-opacity-75' : 'text-gray-400'
  
   }`}>
                      Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Rarity Badge */}
                <div className={`absolute bottom-0 left-0 right-0 px-6 py-2 text-xs font-medium text-center ${
                  achievement.unlocked 
                    ? 'bg-black bg-opacity-20 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)} Achievement
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-600">
              Try changing your filters or start earning to unlock achievements!
            </p>
          </div>
        )}

        {/* Next Rewards Preview */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <RocketLaunchIcon className="h-5 w-5 text-purple-500 mr-2" />
            Next Achievements to Unlock
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements
              .filter(a => !a.unlocked)
              .sort((a, b) => {
                const progressA = (a.progress / a.requirement) * 100;
                const progressB = (b.progress / b.requirement) * 100;
                return progressB - progressA;
              })
              .slice(0, 3)
              .map(achievement => (
                <div key={achievement.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                    <p className="text-xs text-gray-500">{getProgressDisplay(achievement)}</p>
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    {Math.round(getProgressPercentage(achievement))}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
