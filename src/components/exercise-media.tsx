"use client";

import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

/**
 * Miniatura de exercício (usada em listas: biblioteca, busca de exercícios,
 * exercícios adicionados ao treino). Mostra a primeira imagem se existir;
 * caso contrário cai no antigo avatar com a inicial do nome.
 */
export function ExerciseThumb({
  images,
  name,
  className = "w-14 h-14 rounded-lg",
}: {
  images?: string[] | null;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = images && images.length > 0 ? images[0] : null;

  if (!src || failed) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden`}
      >
        <span>{name.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div className={`${className} overflow-hidden shrink-0 bg-muted`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/**
 * Banner grande usado na tela de detalhes do exercício. Quando existem as
 * duas imagens (posição inicial e final, como no free-exercise-db), alterna
 * entre elas automaticamente para simular uma demonstração em "gif".
 */
export function ExerciseMedia({
  images,
  name,
  className = "aspect-video rounded-xl",
}: {
  images?: string[] | null;
  name: string;
  className?: string;
}) {
  const [frame, setFrame] = useState(0);
  const [failed, setFailed] = useState(false);
  const valid = !failed && images && images.length > 0;

  useEffect(() => {
    if (!valid || !images || images.length < 2) return;
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % images.length);
    }, 900);
    return () => clearInterval(id);
  }, [valid, images]);

  if (!valid) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center border border-border`}
      >
        <Dumbbell className="w-16 h-16 text-primary/60" />
      </div>
    );
  }

  return (
    <div className={`${className} overflow-hidden border border-border bg-muted relative`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images![frame]}
        alt={name}
        className="w-full h-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
