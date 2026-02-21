import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiSave,
  FiRefreshCw,
  FiCalendar,
  FiGlobe,
  FiFlag,
  FiEdit2,
  FiCheck,
  FiX,
  FiUpload,
  FiTrash2
} from 'react-icons/fi';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: null,
    coverPhoto: null,
    dateOfBirth: '',
    gender: '',
    profession: '',
    company: '',
    website: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: ''
    }
  });

  // Address State
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    landmark: ''
  });

  // Stats State
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalReferrals: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    rank: 0,
    badges: [],
    joinDate: '',
    lastActive: ''
  });

  // Countries list
  const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'AE', name: 'UAE' }
  ];

  // Genders
  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not', label: 'Prefer not to say' }
  ];

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setProfile(response.data.profile);
        setAddress(response.data.address || {});
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested social links
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setProfile({
        ...profile,
        socialLinks: {
          ...profile.socialLinks,
          [socialField]: value
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image.*/)) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size should be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setProfile({ ...profile, avatar: response.data.avatarUrl });
        toast.success('Avatar updated successfully');
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image.*/)) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB for cover)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('cover', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/cover`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setProfile({ ...profile, coverPhoto: response.data.coverUrl });
        toast.success('Cover photo updated successfully');
      }
    } catch (error) {
      toast.error('Failed to upload cover photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your avatar?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/user/avatar`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setProfile({ ...profile, avatar: null });
        toast.success('Avatar removed successfully');
      }
    } catch (error) {
      toast.error('Failed to remove avatar');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/profile`,
        { ...profile, address },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setEditMode(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchProfile(); // Reset to original data
    setEditMode(false);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Cover Photo */}
      <div className="cover-photo-container">
        {profile.coverPhoto ? (
          <img 
            src={profile.coverPhoto} 
            alt="Cover" 
            className="cover-photo"
          />
        ) : (
          <div className="cover-photo-placeholder">
            <span>📸</span>
          </div>
        )}
        
        {editMode && (
          <div className="cover-upload-btn">
            <label htmlFor="cover-upload" className="upload-label">
              <FiCamera />
              <span>Change Cover</span>
            </label>
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              onChange={handleCoverUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar-container">
          {profile.avatar ? (
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="avatar"
            />
          ) : (
            <div className="avatar-placeholder">
              {getInitials(profile.name)}
            </div>
          )}
          
          {editMode && (
            <div className="avatar-edit-btn">
              <label htmlFor="avatar-upload" className="edit-label">
                <FiCamera />
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              {profile.avatar && (
                <button 
                  className="remove-avatar-btn"
                  onClick={handleRemoveAvatar}
                  title="Remove avatar"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="profile-info">
          <h2>{profile.name || 'Your Name'}</h2>
          <p className="username">@{profile.email?.split('@')[0] || 'username'}</p>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.totalReferrals}</span>
              <span className="stat-label">Referrals</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">${stats.totalEarnings}</span>
              <span className="stat-label">Earnings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalClicks}</span>
              <span className="stat-label">Clicks</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.conversionRate}%</span>
              <span className="stat-label">Conv. Rate</span>
            </div>
          </div>

          <div className="profile-meta">
            <span className="meta-item">
              <FiCalendar />
              Joined {formatDate(stats.joinDate)}
            </span>
            <span className="meta-item">
              <FiGlobe />
              Rank #{stats.rank}
            </span>
          </div>
        </div>

        {!editMode ? (
          <button 
            className="edit-profile-btn"
            onClick={() => setEditMode(true)}
          >
            <FiEdit2 />
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button 
              className="save-btn"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? <FiRefreshCw className="spin" /> : <FiCheck />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button 
              className="cancel-btn"
              onClick={handleCancel}
            >
              <FiX />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Badges */}
      {stats.badges && stats.badges.length > 0 && (
        <div className="badges-section">
          <h3>Achievement Badges</h3>
          <div className="badges-list">
            {stats.badges.map((badge, index) => (
              <div key={index} className={`badge-item ${badge.type}`}>
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="profile-content">
        {/* Personal Information */}
        <div className="profile-section">
          <h3>Personal Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="field-value">{profile.name || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                />
              ) : (
                <p className="field-value">{profile.email || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              {editMode ? (
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="field-value">{profile.phone || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              {editMode ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleProfileChange}
                />
              ) : (
                <p className="field-value">{formatDate(profile.dateOfBirth)}</p>
              )}
            </div>

            <div className="form-group">
              <label>Gender</label>
              {editMode ? (
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleProfileChange}
                >
                  <option value="">Select gender</option>
                  {genders.map(g => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="field-value">
                  {profile.gender ? 
                    genders.find(g => g.value === profile.gender)?.label : 
                    'Not provided'
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="profile-section">
          <h3>Professional Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Profession</label>
              {editMode ? (
                <input
                  type="text"
                  name="profession"
                  value={profile.profession}
                  onChange={handleProfileChange}
                  placeholder="e.g., Affiliate Marketer"
                />
              ) : (
                <p className="field-value">{profile.profession || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Company</label>
              {editMode ? (
                <input
                  type="text"
                  name="company"
                  value={profile.company}
                  onChange={handleProfileChange}
                  placeholder="Enter company name"
                />
              ) : (
                <p className="field-value">{profile.company || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group full-width">
              <label>Bio</label>
              {editMode ? (
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleProfileChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              ) : (
                <p className="field-value bio-text">{profile.bio || 'No bio provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Website</label>
              {editMode ? (
                <input
                  type="url"
                  name="website"
                  value={profile.website}
                  onChange={handleProfileChange}
                  placeholder="https://example.com"
                />
              ) : (
                <p className="field-value">
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                      {profile.website}
                    </a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="profile-section">
          <h3>Address Information</h3>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Street Address</label>
              {editMode ? (
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  placeholder="Enter street address"
                />
              ) : (
                <p className="field-value">{address.street || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>City</label>
              {editMode ? (
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="Enter city"
                />
              ) : (
                <p className="field-value">{address.city || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>State</label>
              {editMode ? (
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="Enter state"
                />
              ) : (
                <p className="field-value">{address.state || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Country</label>
              {editMode ? (
                <select
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                >
                  <option value="">Select country</option>
                  {countries.map(c => (
                    <option key={c.code}value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="field-value">
                  {address.country ? 
                    countries.find(c => c.code === address.country)?.name : 
                    'Not provided'
                  }
                </p>
              )}
            </div>

            <div className="form-group">
              <label>ZIP / Postal Code</label>
              {editMode ? (
                <input
                  type="text"
                  name="zipCode"
                  value={address.zipCode}
                  onChange={handleAddressChange}
                  placeholder="Enter ZIP code"
                />
              ) : (
                <p className="field-value">{address.zipCode || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Landmark</label>
              {editMode ? (
                <input
                  type="text"
                  name="landmark"
                  value={address.landmark}
                  onChange={handleAddressChange}
                  placeholder="Nearby landmark"
                />
              ) : (
                <p className="field-value">{address.landmark || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="profile-section">
          <h3>Social Links</h3>
          
          <div className="social-links-grid">
            <div className="form-group">
              <label>Facebook</label>
              {editMode ? (
                <input
                  type="url"
                  name="social.facebook"
                  value={profile.socialLinks.facebook}
                  onChange={handleProfileChange}
                  placeholder="Facebook URL"
                />
              ) : (
                <p className="field-value">
                  {profile.socialLinks.facebook ? (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                      Facebook Profile
                    </a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Twitter</label>
              {editMode ? (
                <input
                  type="url"
                  name="social.twitter"
                  value={profile.socialLinks.twitter}
                  onChange={handleProfileChange}
                  placeholder="Twitter URL"
                />
              ) : (
                <p className="field-value">
                  {profile.socialLinks.twitter ? (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      Twitter Profile
                    </a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>LinkedIn</label>
              {editMode ? (
                <input
                  type="url"
                  name="social.linkedin"
                  value={profile.socialLinks.linkedin}
                  onChange={handleProfileChange}
                  placeholder="LinkedIn URL"
                />
              ) : (
                <p className="field-value">
                  {profile.socialLinks.linkedin ? (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn Profile
                    </a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Instagram</label>
              {editMode ? (
                <input
                  type="url"
                  name="social.instagram"
                  value={profile.socialLinks.instagram}
                  onChange={handleProfileChange}
                  placeholder="Instagram URL"
                />
              ) : (
                <p className="field-value">
                  {profile.socialLinks.instagram ? (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      Instagram Profile
                    </a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>YouTube</label>
              {editMode ? (
                <input
                  type="url"
                  name="social.youtube"
                  value={profile.socialLinks.youtube}
                  onChange={handleProfileChange}
                  placeholder="YouTube URL"
                />
              ) : (
                <p className="field-value">
                  {profile.socialLinks.youtube ? (
                    <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                      YouTube Channel
                    </a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="profile-section">
          <h3>Recent Activity</h3>
          
          <div className="activity-timeline">
            <div className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-content">
                <p className="activity-title">Earned $25 from Amazon referral</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">👥</div>
              <div className="activity-content">
                <p className="activity-title">New referral joined: Rajesh Kumar</p>
                <p className="activity-time">Yesterday</p>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">🏆</div>
              <div className="activity-content">
                <p className="activity-title">Achievement unlocked: First 100 clicks</p>
                <p className="activity-time">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Cover Photo */
        .cover-photo-container {
          height: 300px;
          position: relative;
          border-radius: 15px 15px 0 0;
          overflow: hidden;
        }

        .cover-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-photo-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .cover-upload-btn {
          position: absolute;
          bottom: 20px;
          right: 20px;
        }

        .upload-label {
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 16px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          transition: all 0.3s ease;
        }

        .upload-label:hover {
          background: white;
        }

        /* Profile Header */
        .profile-header {
          position: relative;
          padding: 0 30px 30px;
          margin-top: -80px;
          display: flex;
          align-items: flex-end;
          gap: 30px;
          flex-wrap: wrap;
        }

        .avatar-container {
          position: relative;
        }

        .avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: 5px solid white;
          object-fit: cover;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .avatar-placeholder {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: 5px solid white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .avatar-edit-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          display: flex;
          gap: 5px;
        }

        .edit-label {
          width: 40px;
          height: 40px;
          background: #667eea;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-label:hover {
          background: #5a67d8;
        }

        .remove-avatar-btn {
          width: 40px;
          height: 40px;
          background: #dc3545;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-avatar-btn:hover {
          background: #c82333;
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h2 {
          margin: 0 0 5px;
          font-size: 28px;
          color: #333;
        }

        .username {
          margin: 0 0 15px;
          color: #666;
        }

        .profile-stats {
          display: flex;
          gap: 30px;
          margin-bottom: 10px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
        }

        .profile-meta {
          display: flex;
          gap: 20px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #666;
          font-size: 14px;
        }

        .edit-profile-btn {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-profile-btn:hover {
          background: #5a67d8;
        }

        .edit-actions {
          display: flex;
          gap: 10px;
        }

        .save-btn {
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-btn:hover:not(:disabled) {
          background: #218838;
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: #c82333;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Badges */
        .badges-section {
          padding: 0 30px 30px;
        }

        .badges-section h3 {
          margin: 0 0 15px;
          font-size: 18px;
          color: #333;
        }

        .badges-list {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .badge-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f8f9fa;
          border-radius: 30px;
          font-size: 14px;
        }

        .badge-item.gold {
          background: #fff3cd;
          color: #856404;
        }

        .badge-item.silver {
          background: #e9ecef;
          color: #495057;
        }

        .badge-item.bronze {
          background: #ffe5d0;
          color: #b45f06;
        }

        /* Profile Content */
        .profile-content {
          padding: 30px;
        }

        .profile-section {
          background: white;
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .profile-section h3 {
          margin: 0 0 20px;
          font-size: 18px;
          color: #333;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-size: 13px;
          font-weight: 500;
          color: #666;
          text-transform: uppercase;
        }

        .field-value {
          margin: 0;
          padding: 8px 0;
          color: #333;
          font-size: 15px;
        }

        .bio-text {
          white-space: pre-wrap;
          line-height: 1.6;
        }

        .field-value a {
          color: #667eea;
          text-decoration: none;
        }

        .field-value a:hover {
          text-decoration: underline;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* Social Links */
        .social-links-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        /* Activity Timeline */
        .activity-timeline {
          margin-top: 10px;
        }

        .activity-item {
          display: flex;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          margin: 0 0 5px;
          font-weight: 500;
          color: #333;
        }

        .activity-time {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .profile-section {
            background: #2d3748;
          }

          .profile-section h3,
          .profile-info h2,
          .stat-value {
            color: #f7fafc;
          }

          .username,
          .stat-label,
          .meta-item,
          .field-value,
          .activity-title {
            color: #e2e8f0;
          }

          .form-group label {
            color: #cbd5e0;
          }

          .form-group input,
          .form-group select,
          .form-group textarea {
            background: #1a202c;
            border-color: #4a5568;
            color: #f7fafc;
          }

          .activity-item {
            border-bottom-color: #4a5568;
          }

          .badge-item {
            background: #1a202c;
            color: #e2e8f0;
          }

          .badge-item.gold {
            background: #7b5e1a;
            color: #ffd700;
          }

          .badge-item.silver {
            background: #4a5568;
            color: #c0c0c0;
          }

          .badge-item.bronze {
            background: #8b4513;
            color: #cd7f32;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-stats {
            justify-content: center;
          }

          .profile-meta {
            justify-content: center;
          }

          .form-grid,
          .social-links-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
