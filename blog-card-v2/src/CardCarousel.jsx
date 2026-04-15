import React, { useState } from 'react';
import './CardCarousel.css';
import cards from './data';

const ReactIcon = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="6" fill={color} opacity="0.3"/>
    <ellipse cx="24" cy="24" rx="20" ry="8" stroke={color} strokeWidth="2" fill="none"/>
    <ellipse cx="24" cy="24" rx="20" ry="8" stroke={color} strokeWidth="2" fill="none" transform="rotate(60 24 24)"/>
    <ellipse cx="24" cy="24" rx="20" ry="8" stroke={color} strokeWidth="2" fill="none" transform="rotate(120 24 24)"/>
  </svg>
);

const PythonIcon = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="10" y="10" width="28" height="28" rx="6" stroke={color} strokeWidth="2"/>
    <path d="M18 24h12M24 18v12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TypeScriptIcon = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="8" width="32" height="32" rx="4" stroke={color} strokeWidth="2"/>
    <path d="M16 24h16M24 24v8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CSSIcon = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M10 12l3 24 11 4 11-4 3-24H10z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M18 22h12M19 28h10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function getIcon(tag, color) {
  if (tag === 'React') return <ReactIcon color={color} />;
  if (tag === 'Python') return <PythonIcon color={color} />;
  if (tag === 'TypeScript') return <TypeScriptIcon color={color} />;
  if (tag === 'CSS') return <CSSIcon color={color} />;
  return null;
}

function CardCarousel() {
  const [current, setCurrent] = useState(0);
  const cardWidth = 236;
  const translateX = current * cardWidth;

  return (
    <section className="carousel-section">
      <div className="carousel-header">
        <h2>Featured topics</h2>
        <p>Hover a card to preview, click dots to browse</p>
      </div>

      <div className="carousel-track-wrapper">
        <div
          className="carousel-track"
          style={{ transform: 'translateX(-' + translateX + 'px)' }}
        >
          {cards.map((card) => (
            <div className="card-wrap" key={card.id}>
              <div className="card-inner">
                <div className="card-front">
                  <div
                    className="card-image-area"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    {getIcon(card.tag, card.iconColor)}
                  </div>
                  <div className="card-meta">
                    <h3>{card.title}</h3>
                    <span>{card.date}</span>
                  </div>
                </div>

                <div className="card-back">
                  <span
                    className="card-tag"
                    style={{
                      backgroundColor: card.tagColor,
                      color: card.tagText,
                    }}
                  >
                    {card.tag}
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-dots">
        {cards.map((_, index) => (
          <button
            key={index}
            className={index === current ? 'active' : ''}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default CardCarousel;