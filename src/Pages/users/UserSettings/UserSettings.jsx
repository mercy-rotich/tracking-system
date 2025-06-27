
import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import './UserSettings.css';

const UserSettings = () => {
  const { theme, toggleTheme, focusMode, toggleFocusMode } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    twoFactorAuth: false,
    sessionTimeout: true,
    newCurriculumAlerts: true,
    approvalStatusUpdates: true,
    weeklyReports: false,
    autoBackup: true
  });

  const handleSettingToggle = (settingKey) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
  };

  const handleExportData = () => {
    alert('Exporting curriculum data...\nDownload will begin shortly.');
  };

  const settingSections = [
    {
      id: 'user-preferences',
      title: 'User Preferences',
      icon: 'fas fa-user-cog',
      settings: [
        {
          key: 'darkMode',
          title: 'Dark Mode',
          description: 'Switch between light and dark themes',
          value: theme === 'dark',
          onChange: toggleTheme
        },
        {
          key: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Receive updates about curriculum changes',
          value: settings.emailNotifications,
          onChange: () => handleSettingToggle('emailNotifications')
        },
        {
          key: 'focusMode',
          title: 'Focus Mode',
          description: 'Highlight content on hover for better focus',
          value: focusMode,
          onChange: toggleFocusMode
        }
      ]
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: 'fas fa-shield-alt',
      settings: [
        {
          key: 'twoFactorAuth',
          title: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          value: settings.twoFactorAuth,
          onChange: () => handleSettingToggle('twoFactorAuth')
        },
        {
          key: 'sessionTimeout',
          title: 'Session Timeout',
          description: 'Automatically log out after 30 minutes of inactivity',
          value: settings.sessionTimeout,
          onChange: () => handleSettingToggle('sessionTimeout')
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: 'fas fa-bell',
      settings: [
        {
          key: 'newCurriculumAlerts',
          title: 'New Curriculum Alerts',
          description: 'Get notified when new curricula are submitted',
          value: settings.newCurriculumAlerts,
          onChange: () => handleSettingToggle('newCurriculumAlerts')
        },
        {
          key: 'approvalStatusUpdates',
          title: 'Approval Status Updates',
          description: 'Receive notifications about approval status changes',
          value: settings.approvalStatusUpdates,
          onChange: () => handleSettingToggle('approvalStatusUpdates')
        },
        {
          key: 'weeklyReports',
          title: 'Weekly Reports',
          description: 'Get weekly summary of curriculum activities',
          value: settings.weeklyReports,
          onChange: () => handleSettingToggle('weeklyReports')
        }
      ]
    },
    {
      id: 'data-management',
      title: 'Data Management',
      icon: 'fas fa-database',
      settings: [
        {
          key: 'exportData',
          title: 'Export Data',
          description: 'Download your curriculum data as CSV or PDF',
          type: 'action',
          action: handleExportData
        },
        {
          key: 'autoBackup',
          title: 'Backup Settings',
          description: 'Automatically backup your preferences and data',
          value: settings.autoBackup,
          onChange: () => handleSettingToggle('autoBackup')
        }
      ]
    }
  ];

  return (
    <div className="user-settings-page">
      <div className="user-settings-header">
        <h1>System Settings</h1>
        <p>Manage your preferences and account settings</p>
      </div>

      <div className="user-settings-grid">
        {settingSections.map((section) => (
          <div key={section.id} className="user-settings-section">
            <h3 className="user-settings-title">
              <i className={section.icon} />
              {section.title}
            </h3>
            
            <div className="user-settings-list">
              {section.settings.map((setting) => (
                <div key={setting.key} className="user-settings-option">
                  <div className="user-option-info">
                    <h4>{setting.title}</h4>
                    <p>{setting.description}</p>
                  </div>
                  
                  <div className="user-option-control">
                    {setting.type === 'action' ? (
                      <button 
                        className="user-action-btn"
                        onClick={setting.action}
                      >
                        <i className="fas fa-download" />
                        Export
                      </button>
                    ) : (
                      <div 
                        className={`user-toggle-switch ${setting.value ? 'user-toggle-switch--active' : ''}`}
                        onClick={setting.onChange}
                        role="switch"
                        aria-checked={setting.value}
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setting.onChange();
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="user-settings-footer">
        <div className="user-settings-info">
          <h4>Need Help?</h4>
          <p>
            If you need assistance with any settings or have questions about your account,
            please contact our support team at <strong>support@must.ac.ke</strong>
          </p>
        </div>
        
        <div className="user-settings-version">
          <small>CurricFlow v2.1.0 • Last updated: January 2024</small>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;