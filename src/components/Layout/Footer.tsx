import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Trading Card Game. All rights reserved.</p>
            <p>Created by Your Name</p>
        </footer>
    );
};

export default Footer;