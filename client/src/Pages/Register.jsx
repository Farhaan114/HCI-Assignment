import React, { useState } from 'react';
import { registerUser } from '../Services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();   
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(username, email, password);
      console.log('Registration successful:', response);
        // Handle successful registration (e.g., redirect to login)
        navigate('/login');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="container  mt-5">
      <div className="row justify-content-center">
        <div className="">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center text-primary mb-4">Register</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input type="text" className="form-control mb-3" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                  <input type="email" className="form-control mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <input type="password" className="form-control mb-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary btn-block">Register</button>
              </form>
              <div className="text-center mt-3">
                <p>Already an existing user? <a href="/login" className="text-primary">Login here</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;