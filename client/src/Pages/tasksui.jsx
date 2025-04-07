import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Tasks.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';

const Tasks = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'work'
  });

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Complete Project Proposal',
      description: 'Finish the project proposal document and submit for review',
      priority: 'high',
      dueDate: '2024-03-15',
      category: 'work',
      status: 'pending',
      createdAt: '2024-03-10'
    },
    {
      id: 2,
      title: 'Team Meeting',
      description: 'Weekly team sync meeting',
      priority: 'medium',
      dueDate: '2024-03-12',
      category: 'meeting',
      status: 'pending',
      createdAt: '2024-03-10'
    },
    {
      id: 3,
      title: 'Code Review',
      description: 'Review pull requests for the new feature',
      priority: 'high',
      dueDate: '2024-03-11',
      category: 'work',
      status: 'completed',
      createdAt: '2024-03-09'
    },
    {
      id: 4,
      title: 'Gym Session',
      description: 'Evening workout session',
      priority: 'low',
      dueDate: '2024-03-11',
      category: 'personal',
      status: 'pending',
      createdAt: '2024-03-10'
    }
  ]);

  const handleAddTask = (e) => {
    e.preventDefault();
    const task = {
      id: tasks.length + 1,
      ...newTask,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, task]);
    setShowAddTask(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'work'
    });
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return 'bi-briefcase';
      case 'meeting': return 'bi-people';
      case 'personal': return 'bi-person';
      default: return 'bi-list';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'pending') return task.status === 'pending';
    if (activeTab === 'completed') return task.status === 'completed';
    if (activeTab === 'high-priority') return task.priority === 'high' && task.status === 'pending';
    return true;
  });

  return (
    <section id="hero" className="scale">
      <div className="container">
        {/* Header with Title */}
        <div className="d-flex align-items-center justify-content-center pt-3">
          <h4 className="title">Task Manager</h4>
        </div>

        <div className="row">
          {/* Left Column - Chat History (col-3) */}
          <div className="col-md-3">
            <div className="chat-container sidebar-container">
              <div className="sidebar">
                <div className="sidebar-content">
                  <div className="top-icons">
                    <h4>Tasks Overview</h4>
                    <button 
                      className="btn btn-neon mt-3"
                      onClick={() => navigate('/ai')}
                    >
                      <span>Chat Assistant</span>
                    </button>
                  </div>

                  {/* Task Stats */}
                  <div className="stats-container">
                    <div className="stat-item">
                      <span className="stat-label">Pending Tasks</span>
                      <span className="stat-value neon-cyan">
                        {tasks.filter(t => t.status === 'pending').length}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">High Priority</span>
                      <span className="stat-value neon-red">
                        {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Completed Today</span>
                      <span className="stat-value neon-green">
                        {tasks.filter(t => t.status === 'completed').length}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="nav-tabs-container">
                    <button
                      className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
                      onClick={() => setActiveTab('pending')}
                    >
                      <i className="bi bi-list-check me-2"></i>
                      Pending Tasks
                    </button>
                    <button
                      className={`nav-tab ${activeTab === 'high-priority' ? 'active' : ''}`}
                      onClick={() => setActiveTab('high-priority')}
                    >
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      High Priority
                    </button>
                    <button
                      className={`nav-tab ${activeTab === 'completed' ? 'active' : ''}`}
                      onClick={() => setActiveTab('completed')}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Completed
                    </button>
                  </div>
                </div>

                {/* Add Task Button - Fixed at bottom */}
                <button
                  className="new-task-btn"
                  onClick={() => setShowAddTask(true)}
                >
                  <span>Add New Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            <div className="chat-container main-content-container">
              <div className="main-content">
                {/* Task List */}
                <div className="task-list">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="task-card">
                      <div className="task-content">
                        <div className="task-header">
                          <h5 className="task-title">
                            <i className={`bi ${getCategoryIcon(task.category)} me-2`}></i>
                            {task.title}
                          </h5>
                          <div className="task-actions">
                            {task.status === 'pending' ? (
                              <button
                                className="action-btn complete-btn"
                                onClick={() => handleStatusChange(task.id, 'completed')}
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                            ) : (
                              <button
                                className="action-btn undo-btn"
                                onClick={() => handleStatusChange(task.id, 'pending')}
                              >
                                <i className="bi bi-arrow-counterclockwise"></i>
                              </button>
                            )}
                            <button className="action-btn edit-btn">
                              <i className="bi bi-pencil"></i>
                            </button>
                          </div>
                        </div>
                        <p className="task-description">{task.description}</p>
                        <div className="task-meta">
                          <span className={`priority-badge ${task.priority}`}>
                            {task.priority} priority
                          </span>
                          <span className="due-date">
                            <i className="bi bi-calendar me-1"></i>
                            Due: {task.dueDate}
                          </span>
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

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content neon-modal">
              <div className="modal-header">
                <h5 className="modal-title">Add New Task</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddTask(false)}
                ></button>
              </div>
              <form onSubmit={handleAddTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control neon-input"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control neon-input"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select neon-input"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        className="form-control neon-input"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select neon-input"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    >
                      <option value="work">Work</option>
                      <option value="meeting">Meeting</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAddTask(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-neon">
                    <span>Add Task</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Tasks; 