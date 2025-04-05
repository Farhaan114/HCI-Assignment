import React, { useState } from 'react';
import { loginUser } from '../Services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password);
      console.log('Login successful:', response);
      // Handle successful login (e.g., store token, redirect)
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', email);
      localStorage.setItem('userId', response.userId);
      navigate('/chats');

    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="container card mt-5">
      <div className="row  justify-content-center">
        <div className="">
          <div className="">
            <div className="card-body">
              <h2 className="text-center text-primary mb-4">Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input type="email" className="form-control mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <input type="password" className="form-control mb-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary btn-block">Login</button>
              </form>
              <div className="text-center mt-3">
                <p>New user? <a href="/register" className="text-primary">Register here</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 