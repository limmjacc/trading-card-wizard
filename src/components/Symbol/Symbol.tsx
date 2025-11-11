import React from 'react';
import './Symbol.css';

interface SymbolProps {
    symbol: string;
    size?: number;
}

const Symbol: React.FC<SymbolProps> = ({ symbol, size = 50 }) => {
    return (
        <div className="symbol" style={{ width: size, height: size }}>
            <img src={symbol} alt="Card Symbol" style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default Symbol;