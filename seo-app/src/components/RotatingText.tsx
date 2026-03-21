import { useState, useEffect } from 'react';

const words = ["tráfego pago", "negócio", "produto", "Blog"];

export function RotatingText() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Hook que configura o relógio para alternar as palavras a cada 2000ms (2s)
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // 1. Inicia o desaparecimento da palavra atual
      
      setTimeout(() => {
        // 2. Após 300ms (tempo que demora pra desaparecer), troca a palavra e faz aparecer
        setIndex((current) => (current + 1) % words.length);
        setFade(true); 
      }, 300);
      
    }, 2000);

    // Limpa o intervalo para não gerar vazamentos de memória (memory leaks) se desmontar o app
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
      {words[index]}
    </span>
  );
}
