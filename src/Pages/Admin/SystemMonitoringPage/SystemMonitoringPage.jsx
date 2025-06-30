
import React, { useState, useEffect } from 'react';
import './SystemMonitoringPage.css';

const Card = ({ children, className = '', title, icon, status, actions }) => (
  <div className={`system-monitoring-card ${className}`}>
    {(title || icon || status || actions) && (
      <div className="system-monitoring-card-header">
        <h2 className="system-monitoring-card-title">
          {icon && <i className={`system-monitoring-card-icon ${icon}`}></i>}
          {title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {status}
          {actions}
        </div>
      </div>
    )}
    <div>{children}</div>
  </div>
);

const StatusIndicator = ({ status, text, className = '' }) => (
  <div className={`system-monitoring-status-indicator system-monitoring-status-${status} ${className}`}>
    <i className="fas fa-circle"></i>
    {text}
  </div>
);

const Button = ({ children, variant = 'primary', onClick, disabled = false, className = '' }) => (
  <button 
    className={`system-monitoring-btn system-monitoring-btn-${variant} ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const ProgressBar = ({ percentage, type = 'healthy' }) => (
  <div className="system-monitoring-progress-bar">
    <div 
      className={`system-monitoring-progress-fill system-monitoring-progress-${type}`} 
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
);

const DashboardHeader = ({ onRefresh, isRefreshing }) => (
  <div className="system-monitoring-dashboard-header">
    <div className="system-monitoring-header-content">
      <div className="system-monitoring-header-text">
        <h1 className="system-monitoring-dashboard-title">
          <i className="fas fa-chart-line system-monitoring-must-blue"></i>
          System Monitoring
        </h1>
        <p className="system-monitoring-dashboard-subtitle">
          Real-time system performance and health monitoring
        </p>
      </div>
      <div className="system-monitoring-header-actions">
        <StatusIndicator 
          status="healthy" 
          text="System Healthy" 
          className="system-monitoring-real-time-indicator" 
        />
        <Button
          variant="primary"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <i className={`fas ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
        <Button variant="secondary">
          <i className="fas fa-cog"></i>
          Configure Alerts
        </Button>
      </div>
    </div>
  </div>
);

const MetricsGrid = ({ metrics }) => {
  const metricConfigs = [
    {
      label: 'System Uptime',
      value: `${metrics.uptime}%`,
      color: 'system-monitoring-must-green-text',
      change: '+0.2% from last month',
      changeType: 'up'
    },
    {
      label: 'Response Time',
      value: `${metrics.responseTime}ms`,
      color: 'system-monitoring-must-blue',
      change: '-15ms improvement',
      changeType: 'down'
    },
    {
      label: 'Active Users',
      value: metrics.activeUsers.toLocaleString(),
      color: 'system-monitoring-must-gold',
      change: '+23 since last hour',
      changeType: 'up'
    },
    {
      label: 'Error Rate',
      value: `${metrics.errorRate}%`,
      color: '#ef4444',
      change: '-0.01% reduction',
      changeType: 'down'
    }
  ];

  return (
    <div className="system-monitoring-metrics-grid">
      {metricConfigs.map((config, index) => (
        <Card key={index} className="system-monitoring-metric-card">
          <div className="system-monitoring-metric-label">{config.label}</div>
          <div 
            className={`system-monitoring-metric-value ${config.color.startsWith('#') ? '' : config.color}`}
            style={config.color.startsWith('#') ? { color: config.color } : {}}
          >
            {config.value}
          </div>
          <div className={`system-monitoring-metric-change system-monitoring-metric-${config.changeType}`}>
            <i className={`fas fa-arrow-${config.changeType === 'up' ? 'up' : 'down'}`}></i>
            {config.change}
          </div>
        </Card>
      ))}
    </div>
  );
};


const PerformanceChart = () => (
  <Card
    title="Performance Trends"
    icon="fas fa-chart-area system-monitoring-must-blue"
    status={<StatusIndicator status="healthy" text="Live Data" />}
  >
    <div className="system-monitoring-chart-container">
      <div>
        <i className="fas fa-chart-line" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
        <div>Real-time Performance Chart</div>
        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          CPU, Memory, Network I/O
        </div>
      </div>
    </div>
  </Card>
);


const AlertsPanel = ({ alerts }) => {
  const getIconColor = (type) => {
    switch (type) {
      case 'warning': return '#f0b41c';
      case 'info': return '#1a3a6e';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <Card
      title="Recent Alerts"
      icon="fas fa-exclamation-triangle"
      actions={
        <Button variant="primary" className="text-xs px-2 py-1">
          View All
        </Button>
      }
    >
      {alerts.map(alert => (
        <div key={alert.id} className={`system-monitoring-alert-item system-monitoring-alert-${alert.type}`}>
          <i 
            className={`system-monitoring-alert-icon ${alert.icon}`} 
            style={{ color: getIconColor(alert.type) }}
          ></i>
          <div className="system-monitoring-alert-content">
            <div className="system-monitoring-alert-title">{alert.title}</div>
            <div className="system-monitoring-alert-message">{alert.message}</div>
            <div className="system-monitoring-alert-time">{alert.time}</div>
          </div>
        </div>
      ))}
    </Card>
  );
};


const SystemResources = ({ metrics }) => {
  const resources = [
    {
      name: 'CPU Usage',
      details: '8 cores, 3.2 GHz',
      percentage: metrics.cpuUsage,
      type: 'healthy'
    },
    {
      name: 'Memory Usage',
      details: '32 GB RAM',
      percentage: metrics.memoryUsage,
      type: 'warning'
    },
    {
      name: 'Disk Usage',
      details: '1 TB SSD',
      percentage: metrics.diskUsage,
      type: 'healthy'
    },
    {
      name: 'Network I/O',
      details: '1 Gbps connection',
      percentage: metrics.networkIO,
      type: 'healthy'
    }
  ];

  const getPercentageColor = (type) => {
    switch (type) {
      case 'healthy': return 'system-monitoring-must-green-text';
      case 'warning': return 'system-monitoring-must-gold';
      case 'critical': return '#ef4444';
      default: return 'system-monitoring-must-green-text';
    }
  };

  return (
    <Card
      title="System Resources"
      icon="fas fa-server system-monitoring-must-green-text"
      status={<StatusIndicator status="healthy" text="Optimal" />}
    >
      {resources.map((resource, index) => (
        <div key={index} className="system-monitoring-resource-item">
          <div className="system-monitoring-resource-info">
            <div className="system-monitoring-resource-name">{resource.name}</div>
            <div className="system-monitoring-resource-details">{resource.details}</div>
            <ProgressBar percentage={resource.percentage} type={resource.type} />
          </div>
          <div className="system-monitoring-resource-usage">
            <div 
              className={`system-monitoring-resource-percentage ${getPercentageColor(resource.type).startsWith('#') ? '' : getPercentageColor(resource.type)}`}
              style={getPercentageColor(resource.type).startsWith('#') ? { color: getPercentageColor(resource.type) } : {}}
            >
              {resource.percentage}%
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
};


const ServiceStatus = ({ services }) => {
  const onlineCount = services.filter(service => service.status === 'online').length;
  const totalCount = services.length;

  const getIconColor = (status) => {
    switch (status) {
      case 'online': return 'system-monitoring-must-green-text';
      case 'maintenance': return 'system-monitoring-must-gold';
      case 'offline': return '#ef4444';
      default: return 'system-monitoring-must-green-text';
    }
  };

  return (
    <Card
      title="Service Status"
      icon="fas fa-cogs system-monitoring-must-blue"
      status={<StatusIndicator status="healthy" text={`${onlineCount}/${totalCount} Online`} />}
    >
      <div className="system-monitoring-service-grid">
        {services.map((service, index) => (
          <div key={index} className="system-monitoring-service-item">
            <div className="system-monitoring-service-info">
              <div className={`system-monitoring-service-status system-monitoring-status-${service.status}`}></div>
              <div className="system-monitoring-service-name">{service.name}</div>
            </div>
            <i 
              className={`${service.icon} ${getIconColor(service.status).startsWith('#') ? '' : getIconColor(service.status)}`}
              style={getIconColor(service.status).startsWith('#') ? { color: getIconColor(service.status) } : {}}
            ></i>
          </div>
        ))}
      </div>
    </Card>
  );
};


const DatabasePerformance = () => {
  const dbMetrics = [
    {
      name: 'Query Response',
      details: 'Average response time',
      value: '28ms',
      color: 'system-monitoring-must-green-text'
    },
    {
      name: 'Active Connections',
      details: 'Current database connections',
      value: '147',
      color: 'system-monitoring-must-blue'
    },
    {
      name: 'Buffer Hit Ratio',
      details: 'Cache efficiency',
      value: '98.7%',
      color: 'system-monitoring-must-green-text'
    }
  ];

  return (
    <Card
      title="Database Performance"
      icon="fas fa-database system-monitoring-must-blue"
      status={<StatusIndicator status="healthy" text="Healthy" />}
    >
      {dbMetrics.map((metric, index) => (
        <div key={index} className="system-monitoring-resource-item">
          <div className="system-monitoring-resource-info">
            <div className="system-monitoring-resource-name">{metric.name}</div>
            <div className="system-monitoring-resource-details">{metric.details}</div>
          </div>
          <div className="system-monitoring-resource-usage">
            <div className={`system-monitoring-resource-percentage ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
};


const SecurityMonitor = () => {
  const securityMetrics = [
    {
      name: 'Failed Login Attempts',
      details: 'Last 24 hours',
      value: '23',
      color: 'system-monitoring-must-gold'
    },
    {
      name: 'Blocked IPs',
      details: 'Currently blacklisted',
      value: '7',
      color: '#ef4444'
    },
    {
      name: 'SSL Certificate',
      details: 'Days until expiration',
      value: '89',
      color: 'system-monitoring-must-green-text'
    }
  ];

  return (
    <Card
      title="Security Monitor"
      icon="fas fa-shield-alt system-monitoring-must-green-text"
      status={<StatusIndicator status="healthy" text="Secure" />}
    >
      {securityMetrics.map((metric, index) => (
        <div key={index} className="system-monitoring-resource-item">
          <div className="system-monitoring-resource-info">
            <div className="system-monitoring-resource-name">{metric.name}</div>
            <div className="system-monitoring-resource-details">{metric.details}</div>
          </div>
          <div className="system-monitoring-resource-usage">
            <div 
              className={`system-monitoring-resource-percentage ${metric.color.startsWith('#') ? '' : metric.color}`}
              style={metric.color.startsWith('#') ? { color: metric.color } : {}}
            >
              {metric.value}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
};


const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState({
    uptime: 99.8,
    responseTime: 142,
    activeUsers: 1247,
    errorRate: 0.03,
    cpuUsage: 45,
    memoryUsage: 72,
    diskUsage: 38,
    networkIO: 23
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.max(100, Math.min(200, prev.responseTime + Math.floor((Math.random() - 0.5) * 20))),
        activeUsers: Math.max(1000, Math.min(1500, prev.activeUsers + Math.floor((Math.random() - 0.5) * 50))),
        cpuUsage: Math.max(30, Math.min(80, prev.cpuUsage + Math.floor((Math.random() - 0.5) * 10)))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.max(100, Math.min(200, prev.responseTime + Math.floor((Math.random() - 0.5) * 20))),
        activeUsers: Math.max(1000, Math.min(1500, prev.activeUsers + Math.floor((Math.random() - 0.5) * 50))),
        cpuUsage: Math.max(30, Math.min(80, prev.cpuUsage + Math.floor((Math.random() - 0.5) * 10)))
      }));
    }, 2000);
  };

  return { metrics, isRefreshing, handleRefresh };
};
// Mock Data
const mockAlerts = [
    {
      id: 1,
      type: 'warning',
      icon: 'fas fa-exclamation-triangle',
      title: 'High Memory Usage',
      message: 'Server memory usage is at 87%',
      time: '2 minutes ago'
    },
    {
      id: 2,
      type: 'info',
      icon: 'fas fa-info-circle',
      title: 'Scheduled Maintenance',
      message: 'Database backup completed successfully',
      time: '15 minutes ago'
    },
    {
      id: 3,
      type: 'critical',
      icon: 'fas fa-times-circle',
      title: 'Service Restart',
      message: 'Authentication service restarted due to timeout',
      time: '1 hour ago'
    }
  ];
  
  const mockServices = [
    { name: 'Web Server', status: 'online', icon: 'fas fa-check-circle' },
    { name: 'Database', status: 'online', icon: 'fas fa-check-circle' },
    { name: 'API Gateway', status: 'online', icon: 'fas fa-check-circle' },
    { name: 'Cache Server', status: 'maintenance', icon: 'fas fa-tools' },
    { name: 'File Storage', status: 'online', icon: 'fas fa-check-circle' },
    { name: 'Load Balancer', status: 'online', icon: 'fas fa-check-circle' }
  ];
  
  // Main Dashboard Component
  const SystemMonitoringPage = () => {
    const { metrics, isRefreshing, handleRefresh } = useSystemMetrics();
  
    return (
      <div className="dashboard-main-content">
        <div className="dashboard-overview">
          <DashboardHeader 
            onRefresh={handleRefresh} 
            isRefreshing={isRefreshing} 
          />
  
          <MetricsGrid metrics={metrics} />
  
          <div className="monitoring-grid">
            <PerformanceChart />
            <AlertsPanel alerts={mockAlerts} />
          </div>
  
          <div className="system-grid">
            <SystemResources metrics={metrics} />
            <ServiceStatus services={mockServices} />
          </div>
  
          <div className="system-grid">
            <DatabasePerformance />
            <SecurityMonitor />
          </div>
        </div>
      </div>
    );
  };
  
  export default SystemMonitoringPage;