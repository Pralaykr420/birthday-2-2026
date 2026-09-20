import { useEffect, useRef } from 'react';

type ConfettiProps = {
  /** Flip this to true to fire it. */
  active: boolean;
  /** How many pieces. 90 is a celebration; 220 is the finale. */
  pieces?: number;
};

const COLOURS = ['#f7c873', '#f2899f', '#fbede4', '#7fb59b', '#ffe3ac'];

/**
 * Confetti, drawn on a canvas.
 *
 * Why a canvas and not 200 little HTML elements: a phone can draw thousands
 * of shapes on one canvas without breaking a sweat, but asking the browser to
 * lay out and animate 200 separate divs will drop frames on a mid-range
 * Android. This is the difference between "magical" and "janky".
 *
 * The physics are deliberately simple: gravity pulls each piece down, air
 * resistance slows it sideways, and each piece spins at its own rate.
 */
export function Confetti({ active, pieces = 130 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Match the canvas to the real pixel density of the screen, otherwise it
    // looks blurry on every phone made in the last decade.
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.scale(scale, scale);

    const confetti = Array.from({ length: pieces }, () => ({
      x: Math.random() * width,
      y: -20 - Math.random() * height * 0.5,
      width: 5 + Math.random() * 7,
      height: 8 + Math.random() * 12,
      speedY: 1.6 + Math.random() * 3.2,
      speedX: (Math.random() - 0.5) * 2.4,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.22,
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    }));

    let frameId = 0;
    let finished = false;

    function draw() {
      if (finished) return;

      context!.clearRect(0, 0, width, height);
      let stillFalling = 0;

      for (const piece of confetti) {
        piece.y += piece.speedY;
        piece.x += piece.speedX;
        piece.speedX *= 0.992; // air resistance
        piece.rotation += piece.spin;

        if (piece.y < height + 40) stillFalling += 1;

        context!.save();
        context!.translate(piece.x, piece.y);
        context!.rotate(piece.rotation);
        context!.fillStyle = piece.colour;
        context!.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
        context!.restore();
      }

      // Everything has landed - stop drawing and give the CPU back.
      if (stillFalling === 0) {
        context!.clearRect(0, 0, width, height);
        return;
      }

      frameId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      finished = true;
      cancelAnimationFrame(frameId);
    };
  }, [active, pieces]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95] h-full w-full"
    />
  );
}
