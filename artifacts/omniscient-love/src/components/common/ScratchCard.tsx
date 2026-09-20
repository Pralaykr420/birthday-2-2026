import { useEffect, useRef, useState } from 'react';

import { playEffect } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';

type ScratchCardProps = {
  /** The message hidden underneath. */
  secret: { english: string; bengali: string };
  /** Called once she has scratched away enough of the covering. */
  onRevealed?: () => void;
};

/** She has to clear this much of the card before we reveal the rest for her. */
const REVEAL_AT_PERCENT = 42;

/**
 * A scratch card, like a lottery ticket.
 *
 * The secret message sits in normal HTML underneath. On top of it we put a
 * canvas painted gold. As her finger moves, we erase circles out of the
 * canvas, so the message shows through the holes.
 *
 * `globalCompositeOperation = 'destination-out'` is the whole trick: it means
 * "instead of drawing paint, remove paint".
 *
 * Once she has cleared roughly 40% we fade the rest away, because making
 * someone scratch every last corner is tedious.
 */
export function ScratchCard({ secret, onRevealed }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const isDrawing = useRef(false);
  const lastCheck = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    context.scale(scale, scale);

    // Paint the gold covering.
    const gradient = context.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#c99a4f');
    gradient.addColorStop(0.45, '#f7c873');
    gradient.addColorStop(1, '#b8873f');
    context.fillStyle = gradient;
    context.fillRect(0, 0, rect.width, rect.height);

    context.fillStyle = 'rgba(35, 22, 14, 0.5)';
    context.font = '500 14px Nunito, sans-serif';
    context.textAlign = 'center';
    context.fillText('Scratch here', rect.width / 2, rect.height / 2 + 5);
  }, []);

  /** Work out where her finger is, relative to the canvas. */
  function positionFrom(event: React.PointerEvent): { x: number; y: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  /** Count how much of the covering is gone, as a percentage. */
  function measureCleared(): number {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !context) return 0;

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    // Checking every pixel would be slow, so we sample one in every 64.
    // The estimate is more than accurate enough for this.
    let transparent = 0;
    let sampled = 0;
    for (let i = 3; i < pixels.length; i += 4 * 64) {
      if (pixels[i] === 0) transparent += 1;
      sampled += 1;
    }

    return (transparent / sampled) * 100;
  }

  function scratchAt(event: React.PointerEvent) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { willReadFrequently: true });
    const point = positionFrom(event);
    if (!canvas || !context || !point) return;

    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(point.x, point.y, 26, 0, Math.PI * 2);
    context.fill();

    // Only check progress a few times a second - reading pixels is the
    // expensive part and doing it on every finger movement drops frames.
    const now = Date.now();
    if (now - lastCheck.current > 220) {
      lastCheck.current = now;
      if (measureCleared() > REVEAL_AT_PERCENT && !revealed) {
        setRevealed(true);
        vibrate('celebrate');
        playEffect('chime');
        onRevealed?.();
      }
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--velvet)]">
      <div className="flex min-h-[210px] items-center justify-center px-7 py-9">
        <p className="t-hand text-center text-[var(--candle)]">
          <span className="block">{secret.english}</span>
          <span lang="bn-IN" className="mt-2 block font-body text-[0.9em] leading-relaxed text-[var(--bengali)]">
            {secret.bengali}
          </span>
        </p>
      </div>

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-700 ${
          revealed ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        onPointerDown={(event) => {
          isDrawing.current = true;
          // Keeps receiving finger movements even if it slides off the canvas.
          event.currentTarget.setPointerCapture(event.pointerId);
          vibrate('tap');
          scratchAt(event);
        }}
        onPointerMove={(event) => {
          if (isDrawing.current) scratchAt(event);
        }}
        onPointerUp={() => {
          isDrawing.current = false;
        }}
        onPointerCancel={() => {
          isDrawing.current = false;
        }}
      />
    </div>
  );
}
