export interface CardProps {
    id: string;
    image: string;
    title: string;
    description: string;
    ratings: Record<string, number>;
    symbol: string;
}

export interface Category {
    name: string;
    maxRating: number;
}