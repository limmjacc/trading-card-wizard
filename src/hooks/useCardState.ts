import { useState } from 'react';

interface Card {
  id: string;
  image: string;
  text: string;
  ratings: Record<string, number>;
  symbol: string;
}

const useCardState = () => {
  const [cards, setCards] = useState<Card[]>([]);

  const addCard = (newCard: Card) => {
    setCards((prevCards) => [...prevCards, newCard]);
  };

  const editCard = (updatedCard: Card) => {
    setCards((prevCards) =>
      prevCards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
  };

  const deleteCard = (cardId: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  return {
    cards,
    addCard,
    editCard,
    deleteCard,
  };
};

export default useCardState;