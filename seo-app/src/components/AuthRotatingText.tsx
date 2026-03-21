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
      }, 300);
      
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span 
      className={`
        text-transparent bg-clip-text bg-gradient-to-r 
        from-slate-700 to-slate-400 
        dark:from-slate-200 dark:to-slate-500
        transition-opacity duration-300 
        inline-block min-w-[200px] text-left
        ${fade ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {phrases[index]}
    </span>
  );
}
