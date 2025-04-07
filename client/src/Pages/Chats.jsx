import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../Services/userService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Button, Modal, Form, Badge } from 'react-bootstrap';

const Chats = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setMeetingTitle('');
    setMeetingTime('');
    setSelectedParticipants([]);
  };

  const handleSchedule = () => {
    const newMeeting = {
      id: Date.now(),
      title: meetingTitle,
      time: meetingTime,
      participants: selectedParticipants.map(id => users.find(u => u.id === +id)),
      status: new Date(meetingTime) <= new Date() ? 'Running' : 'Pending'
    };
    setMeetings([...meetings, newMeeting]);
    closeModal();
  };

  return (
    <div className="container py-5 px-4" style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', color: '#00ffe7', width: '1000px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-neon me-5">Chats</h2>
        <div className='d-flex  align-items-center'>
        <Button variant="outline-info" onClick={openModal} className='text-white mx-5'>Schedule Meeting</Button>
        </div>
        
      </div>

      <div className="row gx-5">
        <div className="col-md-5">
          <h4 className="mb-3">All Users</h4>
          <ul className="list-group neon-border">
            {users.map((user) => (
              <li
                key={user.id}
                className="list-group-item list-group-item-dark text-info neon-item"
                onClick={() => handleUserClick(user.id)}
                style={{ cursor: 'pointer', backgroundColor: '#1a1a1a', border: '1px solid #00ffe7' }}
              >
                {user.username}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-7">
          <h4 className="mb-3">Scheduled Meetings</h4>
          <div className="d-flex flex-wrap gap-3">
            {meetings.length === 0 && <p className="text-muted">No meetings scheduled.</p>}
            {meetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="p-3"
                style={{
                  backgroundColor: meeting.status === 'Running' ? '#142f1e' : '#1e1e1e',
                  borderLeft: `4px solid ${meeting.status === 'Running' ? '#00ff88' : '#ffaa00'}`,
                  color: '#fff',
                  width: '100%',
                  maxWidth: '400px'
                }}
              >
                <Card.Title>{meeting.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Time: {new Date(meeting.time).toLocaleString()}
                </Card.Subtitle>
                <Card.Text>
                  Participants: {meeting.participants.map(p => p.username).join(', ')}
                </Card.Text>
                <Badge bg={meeting.status === 'Running' ? 'success' : 'warning'}>
                  {meeting.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for scheduling meeting */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Schedule a Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Meeting Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Meeting Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Select Participants</Form.Label>
              <Form.Select multiple onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                setSelectedParticipants(selected);
              }}>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button variant="primary" onClick={handleSchedule} disabled={!meetingTitle || !meetingTime}>
              Schedule
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Chats;
