import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Sample data for demonstration
  const [taskData] = useState({
    pendingTasks: [
      { name: 'High', value: 12, color: '#ff2d6d' },
      { name: 'Medium', value: 18, color: '#ffce00' },
      { name: 'Low', value: 7, color: '#00ff8c' }
    ],
    performanceData: [
      { month: 'Jan', completion: 78, efficiency: 82 },
      { month: 'Feb', completion: 75, efficiency: 77 },
      { month: 'Mar', completion: 83, efficiency: 81 },
      { month: 'Apr', completion: 87, efficiency: 85 },
      { month: 'May', completion: 92, efficiency: 88 },
      { month: 'Jun', completion: 90, efficiency: 91 }
    ],
    completedWork: [
      { month: 'Jan', Bugs: 15, Features: 10, Documents: 5 },
      { month: 'Feb', Bugs: 12, Features: 18, Documents: 7 },
      { month: 'Mar', Bugs: 8, Features: 22, Documents: 9 },
      { month: 'Apr', Bugs: 10, Features: 15, Documents: 12 },
      { month: 'May', Bugs: 5, Features: 18, Documents: 14 },
      { month: 'Jun', Bugs: 7, Features: 20, Documents: 11 }
    ],
    notifications: [
      { name: 'Mentions', value: 14, color: '#00f7ff' },
      { name: 'Meetings', value: 8, color: '#ff00ff' },
      { name: 'Deadlines', value: 6, color: '#ffce00' },
      { name: 'Updates', value: 10, color: '#00ff8c' }
    ],
    projectSuccess: [
      { project: 'Project A', success: 85, failure: 15 },
      { project: 'Project B', success: 70, failure: 30 },
      { project: 'Project C', success: 92, failure: 8 },
      { project: 'Project D', success: 65, failure: 35 }
    ]
  });

  // For workload heatmap (simplified version)
  const [selectedTeam, setSelectedTeam] = useState('Team A');
  const teams = ['Team A', 'Team B', 'Team C'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: 'rgba(10, 10, 15, 0.8)', 
          padding: '10px', 
          border: '1px solid #00f7ff',
          borderRadius: '4px'
        }}>
          <p className="label">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container-fluid mt-4">
      <h2 className="text-center mb-4" style={{ color: '#00f7ff', textShadow: '0 0 10px rgba(0, 247, 255, 0.7)' }}>
        Performance Dashboard
      </h2>
      
      {/* First row of charts */}
      <div className="row mb-4">
        {/* Pending Tasks */}
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="dashboard-card p-3">
            <h5 className="card-title">Pending Tasks</h5>
            <div className="chart-container d-flex justify-content-center align-items-center">
              <PieChart width={280} height={260}>
                <Pie
                  data={taskData.pendingTasks}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {taskData.pendingTasks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        </div>
        
        {/* Performance Improvement */}
        <div className="col-md-6 col-lg-8 mb-4">
          <div className="dashboard-card p-3">
            <h5 className="card-title">Performance Trends</h5>
            <div className="chart-container">
              <LineChart
                width={600}
                height={260}
                data={taskData.performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#b3b3cc" />
                <YAxis stroke="#b3b3cc" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="completion" stroke="#00f7ff" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="efficiency" stroke="#ff00ff" strokeWidth={2} />
              </LineChart>
            </div>
          </div>
        </div>
      </div>
      
      {/* Second row of charts */}
      <div className="row mb-4">
        {/* Completed Work Overview */}
        <div className="col-md-6 mb-4">
          <div className="dashboard-card p-3">
            <h5 className="card-title">Completed Work</h5>
            <div className="chart-container">
              <BarChart
                width={500}
                height={260}
                data={taskData.completedWork}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#b3b3cc" />
                <YAxis stroke="#b3b3cc" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Bugs" stackId="a" fill="#ff2d6d" />
                <Bar dataKey="Features" stackId="a" fill="#00f7ff" />
                <Bar dataKey="Documents" stackId="a" fill="#00ff8c" />
              </BarChart>
            </div>
          </div>
        </div>
        
        {/* Notifications Overview */}
        <div className="col-md-6 mb-4">
          <div className="dashboard-card p-3">
            <h5 className="card-title">Notifications</h5>
            <div className="chart-container d-flex justify-content-center align-items-center">
              <PieChart width={300} height={260}>
                <Pie
                  data={taskData.notifications}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskData.notifications.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>
      </div>
      
      {/* Third row */}
      <div className="row mb-4">
        {/* Project Success/Failure */}
        <div className="col-md-8 mb-4">
          <div className="dashboard-card p-3">
            <h5 className="card-title">Project Performance</h5>
            <div className="chart-container">
              <BarChart
                width={600}
                height={260}
                data={taskData.projectSuccess}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="project" stroke="#b3b3cc" />
                <YAxis stroke="#b3b3cc" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="success" fill="#00ff8c" />
                <Bar dataKey="failure" fill="#ff2d6d" />
              </BarChart>
            </div>
          </div>
        </div>
        
        {/* Workload Distribution (Simplified) */}
        <div className="col-md-4 mb-4">
          <div className="dashboard-card p-3">
            <h5 className="card-title">Team Workload</h5>
            <div className="form-group mb-3">
              <select 
                className="form-control" 
                value={selectedTeam} 
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
            <div className="workload-heatmap p-2">
              <div className="d-flex justify-content-between mb-2">
                <span>Member 1</span>
                <div className="progress" style={{ height: '20px', width: '70%' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: '85%', backgroundColor: '#ff2d6d' }} aria-valuenow="85" aria-valuemin="0" aria-valuemax="100">85%</div>
                </div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Member 2</span>
                <div className="progress" style={{ height: '20px', width: '70%' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: '65%', backgroundColor: '#ffce00' }} aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">65%</div>
                </div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Member 3</span>
                <div className="progress" style={{ height: '20px', width: '70%' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: '42%', backgroundColor: '#00ff8c' }} aria-valuenow="42" aria-valuemin="0" aria-valuemax="100">42%</div>
                </div>
              </div>
              <div className="d-flex justify-content-between">
                <span>Member 4</span>
                <div className="progress" style={{ height: '20px', width: '70%' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: '78%', backgroundColor: '#ffce00' }} aria-valuenow="78" aria-valuemin="0" aria-valuemax="100">78%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;