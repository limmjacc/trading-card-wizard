import React from 'react';
import './Card.css';
import SliderRating from '../SliderRating/SliderRating';
import Symbol from '../Symbol/Symbol';

interface CardProps {
    image: string;
    title: string;
    description: string;
    ratings: { [key: string]: number };
    symbol: string;
}

const Card: React.FC<CardProps> = ({ image, title, description, ratings, symbol }) => {
    return (
        <div className="card">
            <img src={image} alt={title} className="card-image" />
            <h2 className="card-title">{title}</h2>
            <p className="card-description">{description}</p>
            <div className="card-ratings">
                {Object.keys(ratings).map((category) => (
                    <SliderRating key={category} category={category} rating={ratings[category]} />
                ))}
            </div>
            <Symbol symbol={symbol} />
        </div>
    );
};

export default Card;