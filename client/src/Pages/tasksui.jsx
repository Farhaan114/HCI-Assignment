import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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
    <div className="vh-100 vw-100 bg-dark d-flex">
      {/* Left Sidebar */}
      <div className="col-3 border-end border-neon p-3">
        <div className="d-flex flex-column h-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="text-light mb-0">Tasks</h4>
            <button 
              className="btn btn-sm btn-neon"
              onClick={() => navigate('/chat')}
            >
              <i className="bi bi-chat me-1"></i>
              Chat
            </button>
          </div>

          {/* Task Stats */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-light">Pending Tasks</span>
              <span className="text-neon">{tasks.filter(t => t.status === 'pending').length}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-light">High Priority</span>
              <span className="text-danger">{tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-light">Completed Today</span>
              <span className="text-success">{tasks.filter(t => t.status === 'completed').length}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="nav flex-column nav-pills">
            <button
              className={`nav-link text-start mb-2 ${activeTab === 'pending' ? 'active bg-neon text-dark' : 'text-light'}`}
              onClick={() => setActiveTab('pending')}
            >
              <i className="bi bi-list-check me-2"></i>
              Pending Tasks
            </button>
            <button
              className={`nav-link text-start mb-2 ${activeTab === 'high-priority' ? 'active bg-neon text-dark' : 'text-light'}`}
              onClick={() => setActiveTab('high-priority')}
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              High Priority
            </button>
            <button
              className={`nav-link text-start mb-2 ${activeTab === 'completed' ? 'active bg-neon text-dark' : 'text-light'}`}
              onClick={() => setActiveTab('completed')}
            >
              <i className="bi bi-check-circle me-2"></i>
              Completed
            </button>
          </div>

          {/* Add Task Button */}
          <button
            className="btn btn-neon mt-auto"
            onClick={() => setShowAddTask(true)}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add New Task
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-9 p-3">
        <div className="d-flex flex-column h-100">
          {/* Task List */}
          <div className="flex-grow-1 overflow-auto">
            {filteredTasks.map(task => (
              <div key={task.id} className="card bg-dark text-light mb-3 border-neon">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title mb-1">
                        <i className={`bi ${getCategoryIcon(task.category)} me-2`}></i>
                        {task.title}
                      </h5>
                      <p className="card-text text-muted mb-2">{task.description}</p>
                      <div className="d-flex align-items-center">
                        <span className={`badge bg-${getPriorityColor(task.priority)} me-2`}>
                          {task.priority} priority
                        </span>
                        <small className="text-muted me-2">
                          <i className="bi bi-calendar me-1"></i>
                          Due: {task.dueDate}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      {task.status === 'pending' ? (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleStatusChange(task.id, 'pending')}
                        >
                          <i className="bi bi-arrow-counterclockwise"></i>
                        </button>
                      )}
                      <button className="btn btn-sm btn-outline-neon">
                        <i className="bi bi-pencil"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-light border-neon">
              <div className="modal-header border-neon">
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
                      className="form-control bg-dark text-light border-neon"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control bg-dark text-light border-neon"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select bg-dark text-light border-neon"
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
                        className="form-control bg-dark text-light border-neon"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select bg-dark text-light border-neon"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    >
                      <option value="work">Work</option>
                      <option value="meeting">Meeting</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-neon">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddTask(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-neon">
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks; 