import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Sample data for demonstration with expanded dataset
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
      { month: 'Apr', completion: 87, efficiency: 85 }
    ],
    completedWork: [
      { month: 'Jan', Bugs: 15, Features: 10, Documents: 5 },
      { month: 'Feb', Bugs: 12, Features: 18, Documents: 7 },
      { month: 'Mar', Bugs: 8, Features: 22, Documents: 9 },
      { month: 'Apr', Bugs: 10, Features: 15, Documents: 12 }
    ]
  });

  // Team data for different teams
  const teamData = {
    'Team A': [
      { name: 'Member 1', workload: 85, color: '#ff2d6d' },
      { name: 'Member 2', workload: 65, color: '#ffce00' },
      { name: 'Member 3', workload: 42, color: '#00ff8c' },
      { name: 'Member 4', workload: 78, color: '#ffce00' }
    ],
    'Team B': [
      { name: 'Member 1', workload: 72, color: '#ff2d6d' },
      { name: 'Member 2', workload: 58, color: '#ffce00' },
      { name: 'Member 3', workload: 94, color: '#ff2d6d' },
      { name: 'Member 4', workload: 35, color: '#00ff8c' },
      { name: 'Member 5', workload: 62, color: '#ffce00' }
    ],
    'Team C': [
      { name: 'Member 1', workload: 45, color: '#00ff8c' },
      { name: 'Member 2', workload: 89, color: '#ff2d6d' },
      { name: 'Member 3', workload: 76, color: '#ffce00' },
      { name: 'Member 4', workload: 63, color: '#ffce00' }
    ]
  };

  // For workload data
  const [selectedTeam, setSelectedTeam] = useState('Team A');
  const teams = Object.keys(teamData);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: 'rgba(10, 10, 15, 0.8)', 
          padding: '10px', 
          border: '1px solid #00f7ff',
          borderRadius: '4px',
          color: 'white'
        }}>
          <p className="label">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Function to get appropriate color based on workload
  const getWorkloadColor = (workload) => {
    if (workload >= 80) return '#ff2d6d'; // High - red
    if (workload >= 60) return '#ffce00'; // Medium - yellow
    return '#00ff8c'; // Low - green
  };

  return (
    <div className="container-fluid p-0" style={{ color: 'white', backgroundColor: '#121212' }}>
      {/* Only one header - this matches the chat app header in the screenshot */}
      {/* <div className="d-flex justify-content-between align-items-center py-2 px-4" style={{ backgroundColor: '#1e1e2d', borderBottom: '1px solid #2d2d3d' }}>
        <h3 style={{ color: '#00f7ff', margin: 0 }}>Chat App</h3>
        <div className="d-flex align-items-center">
          <span className="me-3">saran@gmail.com</span>
          <button className="btn" style={{ backgroundColor: '#ff2d6d', color: 'white', borderRadius: '4px', padding: '6px 16px' }}>LOGOUT</button>
        </div>
      </div> */}
      
      <div className="container mt-4">
        <h2 className="text-center my-4" style={{ color: '#00f7ff', textShadow: '0 0 10px rgba(0, 247, 255, 0.7)' }}>
          Performance Dashboard
        </h2>
        
        {/* First row of charts - MODIFIED: Made pending tasks grid bigger by changing col-md-4 to col-md-6 */}
        <div className="row mb-4">
          {/* Pending Tasks - ENLARGED */}
          <div className="col-md-5 mb-4">
            <div className="dashboard-card p-3" style={{ backgroundColor: '#1e1e2d', borderRadius: '8px', height: '100%' }}>
              <h5 className="card-title mb-3" style={{ color: 'white' }}>Pending Tasks</h5>
              <div className="chart-container d-flex justify-content-center align-items-center">
                {/* Increased size of PieChart from 280x260 to 400x320 */}
                <PieChart width={400} height={320}>
                  <Pie
                    data={taskData.pendingTasks}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // Increased outerRadius from 80 to 120
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => {
                      const percentage = (percent * 100).toFixed(0);
                      return name === 'High' ? `High: ${percentage}%` : 
                             name === 'Medium' ? `Med: ${percentage}%` : 
                             `Low: ${percentage}%`;
                    }}
                  >
                    {taskData.pendingTasks.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
          </div>
          
          {/* Performance Improvement - MODIFIED: col-md-8 to col-md-6 to accommodate the enlarged pie chart */}
          <div className="col-md-7 mb-5">
            <div className="dashboard-card p-3" style={{ backgroundColor: '#1e1e2d', borderRadius: '8px', height: '100%' }}>
              <h5 className="card-title mb-3" style={{ color: 'white' }}>Performance Trends</h5>
              <div className="chart-container">
                {/* Adjusted width from 600 to 500 */}
                <LineChart
                  width={500}
                  height={320}
                  data={taskData.performanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#b3b3cc" />
                  <YAxis stroke="#b3b3cc" domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                    formatter={(value) => <span style={{ color: value === 'completion' ? '#00f7ff' : '#ff00ff' }}>{value}</span>}
                  />
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
            <div className="dashboard-card p-3" style={{ backgroundColor: '#1e1e2d', borderRadius: '8px', height: '100%' }}>
              <h5 className="card-title mb-3" style={{ color: 'white' }}>Completed Work</h5>
              <div className="chart-container">
                <BarChart
                  width={450}
                  height={260}
                  data={taskData.completedWork}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#b3b3cc" />
                  <YAxis stroke="#b3b3cc" domain={[0, 40]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                    formatter={(value) => {
                      const colors = {
                        Bugs: '#ff2d6d',
                        Features: '#00f7ff', 
                        Documents: '#00ff8c'
                      };
                      return <span style={{ color: colors[value] }}>{value}</span>;
                    }}
                  />
                  <Bar dataKey="Bugs" stackId="a" fill="#ff2d6d" />
                  <Bar dataKey="Features" stackId="a" fill="#00f7ff" />
                  <Bar dataKey="Documents" stackId="a" fill="#00ff8c" />
                </BarChart>
              </div>
            </div>
          </div>
          
          {/* Workload Distribution */}
          <div className="col-md-6 mb-4">
            <div className="dashboard-card p-3" style={{ backgroundColor: '#1e1e2d', borderRadius: '8px', height: '100%' }}>
              <h5 className="card-title mb-3" style={{ color: 'white' }}>Team Workload</h5>
              <div className="form-group mb-3">
                <select 
                  className="form-control" 
                  value={selectedTeam} 
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  style={{ 
                    backgroundColor: '#2a2a3a', 
                    color: 'white', 
                    border: '1px solid #00f7ff',
                    borderRadius: '4px',
                    padding: '8px 12px'
                  }}
                >
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
              <div className="workload-heatmap p-2">
                {teamData[selectedTeam].map((member, index) => (
                  <div className="d-flex justify-content-between mb-2" key={index}>
                    <span style={{ color: 'white', width: '80px' }}>{member.name}</span>
                    <div className="progress" style={{ 
                      height: '24px', 
                      width: '70%', 
                      backgroundColor: 'rgba(40, 40, 50, 0.6)',
                      borderRadius: '4px'
                    }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                          width: `${member.workload}%`, 
                          backgroundColor: getWorkloadColor(member.workload),
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }} 
                        aria-valuenow={member.workload} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      >
                        {member.workload}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;