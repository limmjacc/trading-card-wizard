import React, { useState } from 'react';
import CardGrid from './components/CardGrid/CardGrid';
import CardEditor from './components/CardEditor/CardEditor';
import './styles/globals.css';
import { CardProps } from './components/Card/Card.types';

const App: React.FC = () => {
  const [cards, setCards] = useState<Partial<CardProps>[]>([]);

  function handleSave(card: Partial<CardProps>) {
    setCards((prev: Partial<CardProps>[]) => [card, ...prev]);
  }

  return (
    <div className="App">
      <h1>Trading Card Application</h1>
      <CardEditor onSave={handleSave} />
      <CardGrid cards={cards} />
    </div>
  );
};

export default App;