import React from 'react';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <h1 className="header-title">Trading Card Game</h1>
            <nav className="header-nav">
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/cards">Cards</a></li>
                    <li><a href="/editor">Editor</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;