// frontend/src/pages/user/Settings.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Mail,
  Smartphone,
  Save,
  Check,
  X
} from 'lucide-react';

function Settings() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    promotionalEmails: false,
    securityAlerts: true
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    showBookingHistory: false,
    allowDataCollection: false,
    shareWithPartners: false
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30'
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Theme and Display
  const [display, setDisplay] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD'
  });

  useEffect(() => {
    // Load user settings from backend
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update state with loaded settings
        if (data.notifications) setNotifications(data.notifications);
        if (data.privacy) setPrivacy(data.privacy);
        if (data.security) setSecurity(data.security);
        if (data.display) setDisplay(data.display);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (settingsType, settingsData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/user/settings/${settingsType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settingsData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.msg || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.msg || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'display', label: 'Display', icon: SettingsIcon }
  ];

  const SettingToggle = ({ label, description, checked, onChange, disabled = false }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/10 last:border-b-0">
      <div className="flex-1">
        <h4 className="text-white font-medium">{label}</h4>
        {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          } mt-1`}></div>
        </div>
      </label>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-2">
                <SettingToggle
                  label="Email Notifications"
                  description="Receive booking confirmations and updates via email"
                  checked={notifications.emailNotifications}
                  onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                />
                <SettingToggle
                  label="SMS Notifications"
                  description="Get text messages for important updates"
                  checked={notifications.smsNotifications}
                  onChange={(e) => setNotifications(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                />
                <SettingToggle
                  label="Push Notifications"
                  description="Browser notifications for real-time updates"
                  checked={notifications.pushNotifications}
                  onChange={(e) => setNotifications(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                />
                <SettingToggle
                  label="Booking Reminders"
                  description="Reminders about your upcoming movie bookings"
                  checked={notifications.bookingReminders}
                  onChange={(e) => setNotifications(prev => ({ ...prev, bookingReminders: e.target.checked }))}
                />
                <SettingToggle
                  label="Promotional Emails"
                  description="Special offers, discounts, and new movie announcements"
                  checked={notifications.promotionalEmails}
                  onChange={(e) => setNotifications(prev => ({ ...prev, promotionalEmails: e.target.checked }))}
                />
                <SettingToggle
                  label="Security Alerts"
                  description="Important account security notifications"
                  checked={notifications.securityAlerts}
                  onChange={(e) => setNotifications(prev => ({ ...prev, securityAlerts: e.target.checked }))}
                />
              </div>
            </div>
            <button
              onClick={() => saveSettings('notifications', notifications)}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Notification Settings'}</span>
            </button>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Profile Visibility</label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none transition-colors"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
                
                <SettingToggle
                  label="Show Booking History"
                  description="Allow others to see your movie booking history"
                  checked={privacy.showBookingHistory}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, showBookingHistory: e.target.checked }))}
                />
                <SettingToggle
                  label="Allow Data Collection"
                  description="Help us improve by sharing anonymous usage data"
                  checked={privacy.allowDataCollection}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, allowDataCollection: e.target.checked }))}
                />
                <SettingToggle
                  label="Share with Partners"
                  description="Allow trusted partners to provide personalized recommendations"
                  checked={privacy.shareWithPartners}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, shareWithPartners: e.target.checked }))}
                />
              </div>
            </div>
            <button
              onClick={() => saveSettings('privacy', privacy)}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Privacy Settings'}</span>
            </button>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Password Change */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none transition-colors"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none transition-colors"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none transition-colors"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
              <div className="space-y-2">
                <SettingToggle
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                  checked={security.twoFactorAuth}
                  onChange={(e) => setSecurity(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                />
                <SettingToggle
                  label="Login Alerts"
                  description="Get notified when someone logs into your account"
                  checked={security.loginAlerts}
                  onChange={(e) => setSecurity(prev => ({ ...prev, loginAlerts: e.target.checked }))}
                />
                <div className="py-4 border-b border-white/10">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout</label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none transition-colors"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="0">Never</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => saveSettings('security', security)}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 mt-4"
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Security Settings'}</span>
              </button>
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Display & Language</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <select
                    value={display.theme}
                    onChange={(e) => setDisplay(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none transition-colors"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <select
                    value={display.language}
                    onChange={(e) => setDisplay(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <select
                    value={display.timezone}
                    onChange={(e) => setDisplay(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none transition-colors"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                  <select
                    value={display.currency}
                    onChange={(e) => setDisplay(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:outline-none transition-colors"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="LKR">LKR (Rs)</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={() => saveSettings('display', display)}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Display Settings'}</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and security</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center">
            <X size={16} className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-center">
            <Check size={16} className="mr-2" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;