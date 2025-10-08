import React from 'react';

const HomePage: React.FC = () => {
    return (
        <div className="home-page">
            <h1>Welcome to Your Personal Website</h1>
            <p>Create and manage your personal website effortlessly.</p>
            <button onClick={() => alert('Start creating your website!')}>Create Your Website</button>
        </div>
    );
};

export default HomePage;