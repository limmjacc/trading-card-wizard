import React from 'react';
import './SliderRating.css';

interface SliderRatingProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}

const SliderRating: React.FC<SliderRatingProps> = ({ label, value, onChange }) => {
    return (
        <div className="slider-rating">
            <label>{label}</label>
            <input
                type="range"
                min="0"
                max="10"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="slider"
            />
            <span>{value}</span>
        </div>
    );
};

export default SliderRating;