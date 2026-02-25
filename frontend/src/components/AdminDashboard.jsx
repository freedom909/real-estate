"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import HostManagement from './HostManagement';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    bookingsToday: 0,
    revenueToday: 0,
    systemAlerts: 0
  });

  // Mock data for charts
  const performanceData = [
    { hour: '00:00', responseTime: 0.9, errorRate: 0.03, users: 45 },
    { hour: '04:00', responseTime: 0.7, errorRate: 0.01, users: 32 },
    { hour: '08:00', responseTime: 0.8, errorRate: 0.02, users: 89 },
    { hour: '12:00', responseTime: 1.2, errorRate: 0.05, users: 156 },
    { hour: '16:00', responseTime: 0.9, errorRate: 0.02, users: 142 },
    { hour: '20:00', responseTime: 0.8, errorRate: 0.01, users: 98 },
  ];

  const conversionData = [
    { stage: 'Visitors', value: 1000 },
    { stage: 'Searches', value: 850 },
    { stage: 'Bookings', value: 103 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 24500, bookings: 120 },
    { month: 'Feb', revenue: 31200, bookings: 145 },
    { month: 'Mar', revenue: 28900, bookings: 132 },
    { month: 'Apr', revenue: 35600, bookings: 168 },
    { month: 'May', revenue: 42100, bookings: 195 },
    { month: 'Jun', revenue: 39800, bookings: 182 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchDashboardData();
    startRealTimeUpdates();
    return () => clearInterval(realTimeInterval);
  }, []);

  let realTimeInterval;

  const startRealTimeUpdates = () => {
    realTimeInterval = setInterval(() => {
      setRealTimeData(prev => ({
        activeUsers: Math.floor(Math.random() * 200) + 50,
        bookingsToday: Math.floor(Math.random() * 20) + 5,
        revenueToday: Math.floor(Math.random() * 5000) + 1000,
        systemAlerts: Math.floor(Math.random() * 3)
      }));
    }, 5000);
  };

  const fetchDashboardData = async () => {
    try {
      // Simulate API call to get dashboard data
      const response = await fetch('http://localhost:9000/ml/analytics/dashboard');
      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data for demo
      setDashboardData({
        performance: {
          metrics: {
            response_time: 0.8,
            error_rate: 0.02,
            concurrent_users: 150,
            booking_rate: 12,
            cpu_usage: 45.2,
            memory_usage: 67.8
          },
          trends: {
            trend: 'stable',
            improvement_since_last_hour: 2.5
          }
        },
        conversion_funnel: {
          conversion_rates: {
            visitors_to_searches: 85.3,
            searches_to_bookings: 12.1,
            overall_conversion: 10.3
          }
        },
        demand_forecast: {
          peak_predictions: {
            next_24_hours: {
              peak_time: '14:00-16:00',
              expected_demand: 'high'
            }
          }
        },
        kpis: {
          uptime: 99.95,
          user_satisfaction: 4.7,
          booking_conversion_rate: 12.3,
          average_booking_value: 245.50
        },
        ai_models: {
          title_optimization: { accuracy: 0.92, status: 'active' },
          description_improvement: { accuracy: 0.88, status: 'active' },
          review_reply: { accuracy: 0.85, status: 'active' },
          pricing_prediction: { accuracy: 0.91, status: 'active' }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    try {
      const response = await fetch('http://localhost:9000/ml/optimization/comprehensive', {
        method: 'POST'
      });
      const result = await response.json();
      alert('Optimization completed! Check console for details.');
      console.log('Optimization result:', result);
    } catch (error) {
      console.error('Error running optimization:', error);
      alert('Optimization feature demo - would run comprehensive business optimization');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4">
        <h1 className="text-2xl font-bold">🧠 Minshuku AI Dashboard</h1>
        <p className="text-blue-200">Real-time analytics and optimization</p>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="flex space-x-4 p-4">
          {['overview', 'analytics', 'optimization', 'alerts', 'hosts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md capitalize ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab === 'hosts' ? '👥 Host Management' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Active Users" 
                value={realTimeData.activeUsers} 
                icon="👥" 
                trend="+12%" 
                trendPositive={true}
              />
              <StatCard 
                title="Bookings Today" 
                value={realTimeData.bookingsToday} 
                icon="📅" 
                trend="+8%" 
                trendPositive={true}
              />
              <StatCard 
                title="Revenue Today" 
                value={`$${realTimeData.revenueToday.toLocaleString()}`} 
                icon="💰" 
                trend="+15%" 
                trendPositive={true}
              />
              <StatCard 
                title="System Alerts" 
                value={realTimeData.systemAlerts} 
                icon="⚠️" 
                trend="-2" 
                trendPositive={false}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">📊 Performance Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="responseTime" stroke="#8884d8" name="Response Time (s)" />
                    <Line type="monotone" dataKey="errorRate" stroke="#82ca9d" name="Error Rate (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">🔄 Conversion Funnel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metrics and Actions Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">⚡ System Metrics</h3>
                <div className="space-y-2">
                  <MetricCard label="Response Time" value={`${dashboardData?.performance?.metrics?.response_time}s`} good={dashboardData?.performance?.metrics?.response_time < 1} />
                  <MetricCard label="Error Rate" value={`${(dashboardData?.performance?.metrics?.error_rate * 100).toFixed(1)}%`} good={dashboardData?.performance?.metrics?.error_rate < 0.05} />
                  <MetricCard label="CPU Usage" value={`${dashboardData?.performance?.metrics?.cpu_usage}%`} good={dashboardData?.performance?.metrics?.cpu_usage < 80} />
                  <MetricCard label="Memory Usage" value={`${dashboardData?.performance?.metrics?.memory_usage}%`} good={dashboardData?.performance?.metrics?.memory_usage < 85} />
                </div>
              </div>

              {/* KPIs */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">⭐ Business KPIs</h3>
                <div className="space-y-2">
                  <MetricCard label="Uptime" value={`${dashboardData?.kpis?.uptime}%`} good={dashboardData?.kpis?.uptime > 99.9} />
                  <MetricCard label="User Satisfaction" value={dashboardData?.kpis?.user_satisfaction} good={dashboardData?.kpis?.user_satisfaction > 4.5} />
                  <MetricCard label="Conversion Rate" value={`${dashboardData?.kpis?.booking_conversion_rate}%`} good={dashboardData?.kpis?.booking_conversion_rate > 10} />
                  <MetricCard label="Avg Booking Value" value={`$${dashboardData?.kpis?.average_booking_value}`} good={dashboardData?.kpis?.average_booking_value > 200} />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">🚀 Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={runOptimization}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">⚡</span> Run AI Optimization
                  </button>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <span className="mr-2">📊</span> Generate Report
                  </button>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center">
                    <span className="mr-2">🔧</span> System Health
                  </button>
                  <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center">
                    <span className="mr-2">🤖</span> Train AI Models
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">💰 Revenue & Bookings Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#82ca9d" name="Bookings" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Model Performance */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">🤖 AI Model Performance</h3>
                <div className="space-y-4">
                  {Object.entries(dashboardData?.ai_models || {}).map(([model, data]) => (
                    <div key={model} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium capitalize">{model.replace('_', ' ')}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          data.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {data.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{(data.accuracy * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Behavior Analysis */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">👥 User Behavior Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <h4 className="font-medium">Session Duration</h4>
                    <p className="text-2xl font-bold text-blue-600">4.2 min</p>
                    <p className="text-sm text-gray-600">Average session time</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <h4 className="font-medium">Bounce Rate</h4>
                    <p className="text-2xl font-bold text-green-600">32%</p>
                    <p className="text-sm text-gray-600">Lower is better</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded">
                    <h4 className="font-medium">Pages per Session</h4>
                    <p className="text-2xl font-bold text-purple-600">5.8</p>
                    <p className="text-sm text-gray-600">Engagement metric</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">🌍 Geographic Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-lg font-bold">Tokyo</div>
                  <div className="text-2xl text-blue-600">42%</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-lg font-bold">Osaka</div>
                  <div className="text-2xl text-green-600">28%</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-lg font-bold">Kyoto</div>
                  <div className="text-2xl text-purple-600">18%</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-lg font-bold">Other</div>
                  <div className="text-2xl text-orange-600">12%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimization' && (
          <div className="space-y-6">
            {/* Optimization Overview */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">🔧 AI-Powered Business Optimization</h3>
              <p className="text-gray-600 mb-6">Machine learning algorithms that continuously optimize your business operations.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <OptimizationCard 
                  title="Pricing Strategy" 
                  description="Dynamic pricing based on demand, seasonality, and competition"
                  status="active"
                  impact="+15% revenue"
                  lastRun="2 hours ago"
                />
                <OptimizationCard 
                  title="Inventory Allocation" 
                  description="Smart resource distribution across all listings"
                  status="active"
                  impact="+22% efficiency"
                  lastRun="1 hour ago"
                />
                <OptimizationCard 
                  title="Marketing Budget" 
                  description="ROI-maximizing allocation of marketing resources"
                  status="active"
                  impact="+18% ROI"
                  lastRun="4 hours ago"
                />
                <OptimizationCard 
                  title="Customer Segmentation" 
                  description="AI-driven customer grouping for targeted marketing"
                  status="active"
                  impact="+25% engagement"
                  lastRun="6 hours ago"
                />
                <OptimizationCard 
                  title="Route Optimization" 
                  description="Efficient delivery and service route planning"
                  status="pending"
                  impact="Expected: +30% efficiency"
                  lastRun="Not run yet"
                />
                <OptimizationCard 
                  title="Staff Scheduling" 
                  description="AI-optimized staff allocation and scheduling"
                  status="active"
                  impact="+20% productivity"
                  lastRun="3 hours ago"
                />
              </div>
            </div>

            {/* Optimization Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">📈 Optimization Impact</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { metric: 'Revenue', before: 100, after: 115 },
                      { metric: 'Efficiency', before: 100, after: 122 },
                      { metric: 'ROI', before: 100, after: 118 },
                      { metric: 'Engagement', before: 100, after: 125 }
                    ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="before" fill="#8884d8" name="Before Optimization" />
                    <Bar dataKey="after" fill="#82ca9d" name="After Optimization" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">⚡ Optimization Schedule</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <h4 className="font-medium">Next Optimization Run</h4>
                    <p className="text-xl font-bold text-blue-600">In 15 minutes</p>
                    <p className="text-sm text-gray-600">Pricing and inventory updates</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <h4 className="font-medium">Last Major Optimization</h4>
                    <p className="text-xl font-bold text-green-600">2 hours ago</p>
                    <p className="text-sm text-gray-600">Revenue impact: +$12,500</p>
                  </div>
                  <button 
                    onClick={runOptimization}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <span className="mr-2">🚀</span> Run Immediate Optimization
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* System Alerts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">⚠️ System Alerts & Notifications</h3>
              <div className="space-y-4">
                <AlertCard 
                  type="warning" 
                  title="High CPU Usage" 
                  message="CPU usage has exceeded 85% for the last 10 minutes" 
                  time="5 minutes ago"
                />
                <AlertCard 
                  type="error" 
                  title="Database Connection" 
                  message="Temporary database connection issues detected" 
                  time="15 minutes ago"
                />
                <AlertCard 
                  type="info" 
                  title="New Optimization Available" 
                  message="AI model update ready for deployment" 
                  time="1 hour ago"
                />
                <AlertCard 
                  type="success" 
                  title="Backup Completed" 
                  message="System backup completed successfully" 
                  time="2 hours ago"
                />
              </div>
            </div>

            {/* Performance Warnings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">📊 Performance Warnings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WarningCard 
                  metric="Response Time" 
                  value="1.2s" 
                  threshold="1.0s" 
                  status="warning"
                />
                <WarningCard 
                  metric="Error Rate" 
                  value="0.08%" 
                  threshold="0.05%" 
                  status="warning"
                />
                <WarningCard 
                  metric="Memory Usage" 
                  value="82%" 
                  threshold="80%" 
                  status="warning"
                />
                <WarningCard 
                  metric="Disk Space" 
                  value="45%" 
                  threshold="90%" 
                  status="normal"
                />
              </div>
            </div>

            {/* Alert Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">⚙️ Alert Configuration</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">Email Notifications</span>
                    <p className="text-sm text-gray-600">Receive alerts via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">SMS Alerts</span>
                    <p className="text-sm text-gray-600">Critical alerts via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hosts' && (
          <div className="space-y-6">
            <HostManagement />
            
            {/* Additional host management statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-medium mb-2">📈 Host Growth</h4>
                <p className="text-2xl font-bold text-blue-600">+15%</p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-medium mb-2">⭐ Average Rating</h4>
                <p className="text-2xl font-bold text-green-600">4.7/5</p>
                <p className="text-sm text-gray-600">Host performance</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-medium mb-2">💰 Revenue</h4>
                <p className="text-2xl font-bold text-purple-600">$45,200</p>
                <p className="text-sm text-gray-600">From hosts this month</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, good }) => (
  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`font-medium ${good !== undefined ? (good ? 'text-green-600' : 'text-red-600') : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

const OptimizationCard = ({ title, description, status, impact, lastRun }) => (
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-medium text-lg">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {status}
      </span>
    </div>
    <div className="flex justify-between items-center text-sm">
      <span className="text-blue-600 font-medium">{impact}</span>
      <span className="text-gray-500">Last: {lastRun}</span>
    </div>
    <button className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
      Run Optimization
    </button>
  </div>
);

const StatCard = ({ title, value, icon, trend, trendPositive }) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className={`mt-3 text-sm font-medium ${
      trendPositive ? 'text-green-600' : 'text-red-600'
    }`}>
      {trend} from last hour
    </div>
  </div>
);

const AlertCard = ({ type, title, message, time }) => {
  const typeConfig = {
    warning: { color: 'bg-yellow-100 border-yellow-400 text-yellow-800', icon: '⚠️' },
    error: { color: 'bg-red-100 border-red-400 text-red-800', icon: '❌' },
    info: { color: 'bg-blue-100 border-blue-400 text-blue-800', icon: 'ℹ️' },
    success: { color: 'bg-green-100 border-green-400 text-green-800', icon: '✅' }
  };
  
  const config = typeConfig[type] || typeConfig.info;
  
  return (
    <div className={`p-4 border-l-4 rounded ${config.color} ${config.border}`}>
      <div className="flex items-start">
        <span className="text-lg mr-3">{config.icon}</span>
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm mt-1">{message}</p>
          <p className="text-xs mt-2 opacity-75">{time}</p>
        </div>
        <button className="text-gray-500 hover:text-gray-700 ml-2">
          ×
        </button>
      </div>
    </div>
  );
};

const WarningCard = ({ metric, value, threshold, status }) => (
  <div className={`p-4 border rounded-lg ${
    status === 'warning' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
  }`}>
    <div className="flex justify-between items-center">
      <span className="font-medium">{metric}</span>
      <span className={`px-2 py-1 rounded text-xs ${
        status === 'warning' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}>
        {status}
      </span>
    </div>
    <div className="mt-2">
      <div className="flex justify-between text-sm">
        <span>Current: {value}</span>
        <span>Threshold: {threshold}</span>
      </div>
      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            status === 'warning' ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: status === 'warning' ? '100%' : '50%' }}
        ></div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;