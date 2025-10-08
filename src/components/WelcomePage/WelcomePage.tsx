import React from 'react';
import './WelcomePage.css';

const WelcomePage: React.FC = () => {
    return (
        <div className="welcome-page">
            <div className="logo-container">
                <img src="/path/to/logo.png" alt="Logo" className="logo" />
            </div>
            <h1>Welcome to Your Personal Website Generator</h1>
            <button className="create-button">Stwórz swoją stronę</button>
            <div className="login-link">
                <a href="/studio">Zaloguj się</a>
            </div>
        </div>
    );
};

export default WelcomePage;