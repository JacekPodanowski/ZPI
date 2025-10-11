import React from 'react';
import { Link } from 'react-router-dom';
import useGlitchLite from '../hooks/useGlitchLite';
import './WelcomePage.css';

const WelcomePage = () => {
    useGlitchLite({ freq: 10, power: 5 });

  return (
    <>
      <div className="welcome-container">
        <div className="content-wrapper">
          <h1 className="title">Welcome to the Personal Site Generator</h1>
          <p className="subtitle">Create your professional online presence in minutes.</p>
          <div className="button-group">
            <Link to="/studio/login" className="button primary">
              Log In to Studio
            </Link>
            <Link to="/studio/create" className="button secondary">
              Create Your Site
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePage;