import React from 'react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <h2>Navigation</h2>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#cards">Cards</a></li>
                <li><a href="#editor">Card Editor</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </div>
    );
};

export default Sidebar;