import { useState, useEffect } from 'react';

const phrases = [
  "o Topo do Google.",
  "o Mercado de Buscas.",
  "a Primeira Página.",
  "o Ranking Orgânico.",
  "a intenção de compra."
];

export function AuthRotatingText() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setIndex((current) => (current + 1) % phrases.length);
        setFade(true);
      }, 500);

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`
        text-black font-display font-black
        transition-all duration-700 
        inline-block min-w-[320px] text-left
        ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {phrases[index]}
    </span>
  );
}
