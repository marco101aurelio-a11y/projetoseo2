import { useState, useEffect } from 'react';

const words = ["tráfego pago", "negócio", "produto", "Blog", "Drop"];

export function RotatingText() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setIndex((current) => (current + 1) % words.length);
        setFade(true);
      }, 500);

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`
        text-white font-display font-black
        transition-all duration-700 
        inline-block min-w-[280px] text-left
        ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {words[index]}
    </span>
  );
}
