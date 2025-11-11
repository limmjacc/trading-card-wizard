export const calculateAverageRating = (ratings: number[]): number => {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((acc, rating) => acc + rating, 0);
    return total / ratings.length;
};

export const normalizeRating = (rating: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, rating));
};

export const formatRating = (rating: number): string => {
    return rating.toFixed(1);
};