import React, { useEffect, useRef, useState } from 'react';
import './CardEditor.css';
import { CardProps } from '../Card/Card.types';

interface Props {
    onSave?: (card: Partial<CardProps>) => void;
}

const CARD_WIDTH = 600;
const CARD_HEIGHT = 840;

const defaultCategories = ['Charm', 'Mischief', 'Loyalty'];

const CardEditor: React.FC<Props> = ({ onSave }) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [title, setTitle] = useState('Friend');
    const [description, setDescription] = useState('A very good friend.');
    const [ratings, setRatings] = useState<Record<string, number>>(() =>
        defaultCategories.reduce((acc, c) => ({ ...acc, [c]: 5 }), {})
    );
    const [symbolText, setSymbolText] = useState('★');

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        drawPreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageSrc, title, description, ratings, symbolText]);

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        setImageSrc(url);
    }

    function handleImageUrl(e: React.ChangeEvent<HTMLInputElement>) {
        setImageSrc(e.target.value);
    }

    function handleRatingChange(category: string, value: number) {
        setRatings((prev: Record<string, number>) => ({ ...prev, [category]: value }));
    }

    function drawPreview() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // support high DPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = CARD_WIDTH * dpr;
        canvas.height = CARD_HEIGHT * dpr;
        canvas.style.width = CARD_WIDTH + 'px';
        canvas.style.height = CARD_HEIGHT + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // background
    ctx.fillStyle = '#f8f4ee';
        ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

        // border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, CARD_WIDTH - 20, CARD_HEIGHT - 20);

        // image area
        const imgX = 40;
        const imgY = 60;
        const imgW = CARD_WIDTH - 80;
        const imgH = 360;
        ctx.fillStyle = '#ddd';
        ctx.fillRect(imgX, imgY, imgW, imgH);

        if (imageSrc) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                // draw cropped to fit
                const ratio = Math.max(imgW / img.width, imgH / img.height);
                const sw = imgW / ratio;
                const sh = imgH / ratio;
                const sx = (img.width - sw) / 2;
                const sy = (img.height - sh) / 2;
                ctx.drawImage(img, sx, sy, sw, sh, imgX, imgY, imgW, imgH);

                // symbol overlay
                drawSymbol(ctx);
            };
            img.onerror = () => {
                // failed to load, keep placeholder
                drawSymbol(ctx);
            };
            img.src = imageSrc;
            imageRef.current = img;
        } else {
            drawSymbol(ctx);
        }

        // title
        ctx.fillStyle = '#111';
        ctx.font = '28px Inter, Arial';
        ctx.fillText(title, 40, imgY + imgH + 50);

        // description (wrap)
        ctx.font = '18px Inter, Arial';
        wrapText(ctx, description, 40, imgY + imgH + 80, CARD_WIDTH - 80, 22);

        // ratings
        const startY = CARD_HEIGHT - 160;
        let i = 0;
        for (const cat of defaultCategories) {
            const y = startY + i * 36;
            drawRatingRow(ctx, cat, ratings[cat] ?? 0, 10, y, CARD_WIDTH - 20, 28);
            i++;
        }
    }

    function drawSymbol(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(430, 20, 140, 40);
        ctx.fillStyle = '#222';
        ctx.font = '24px serif';
        ctx.fillText(symbolText, 460, 52);
    }

    function drawRatingRow(
        ctx: CanvasRenderingContext2D,
        name: string,
        value: number,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        ctx.fillStyle = '#222';
        ctx.font = '16px Inter, Arial';
        ctx.fillText(name, x + 8, y + 18);

        const barW = 220;
        const barX = x + width - barW - 20;
        const barY = y + 4;
        ctx.strokeStyle = '#888';
        ctx.strokeRect(barX, barY, barW, height - 8);
        const pct = Math.max(0, Math.min(1, value / 10));
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(barX + 2, barY + 2, (barW - 4) * pct, height - 12);

        ctx.fillStyle = '#111';
        ctx.font = '14px Inter, Arial';
        ctx.fillText(String(value), barX + barW + 8, y + 18);
    }

    function wrapText(
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeight: number
    ) {
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    function exportPNG() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob: Blob | null) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title || 'card'}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });
    }

    function handleSaveCard() {
        const card: Partial<CardProps> = {
            id: String(Date.now()),
            image: imageSrc,
            title,
            description,
            ratings,
            symbol: symbolText,
        };
        if (onSave) onSave(card);
    }

    return (
        <div className="card-editor">
            <div className="editor-controls">
                <h2>Card Editor</h2>
                <label>Upload image</label>
                <input type="file" accept="image/*" onChange={handleFile} />
                <label>Or image URL</label>
                <input type="text" placeholder="https://..." value={imageSrc} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageUrl(e)} />

                <label>Title</label>
                <input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />

                <label>Description</label>
                <textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />

                <label>Symbol</label>
                <input value={symbolText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSymbolText(e.target.value)} />

                <div className="ratings">
                    {defaultCategories.map(cat => (
                        <div key={cat} className="rating-row">
                            <label>{cat}</label>
                            <input
                                type="range"
                                min={0}
                                max={10}
                                value={ratings[cat]}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRatingChange(cat, Number(e.target.value))}
                            />
                            <span className="rating-value">{ratings[cat]}</span>
                        </div>
                    ))}
                </div>

                <div className="editor-actions">
                    <button onClick={exportPNG}>Export PNG</button>
                    <button onClick={handleSaveCard}>Save to Grid</button>
                </div>
            </div>

            <div className="editor-preview">
                <h3>Preview</h3>
                <canvas ref={canvasRef} className="card-canvas" />
            </div>
        </div>
    );
};

export default CardEditor;