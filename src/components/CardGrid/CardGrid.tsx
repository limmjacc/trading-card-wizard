import React from 'react';
import Card from '../Card/Card';
import './CardGrid.css';
import { CardProps } from '../Card/Card.types';

interface Props {
    cards?: Partial<CardProps>[];
}

const CardGrid: React.FC<Props> = ({ cards = [] }) => {
    return (
        <div className="card-grid">
            {cards.map((card, index) => (
                <Card key={((card as Partial<CardProps>).id as string) ?? index} {...(card as any)} />
            ))}
        </div>
    );
};

export default CardGrid;