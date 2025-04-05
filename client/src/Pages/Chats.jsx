import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../Services/userService';
import 'bootstrap/dist/css/bootstrap.min.css';

const Chats = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

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

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Chats</h2>
      <ul className="list-group">
        {users.map((user) => (
          <li key={user.id} className="list-group-item" onClick={() => handleUserClick(user.id)}>
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chats; 