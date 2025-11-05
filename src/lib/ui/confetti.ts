// src/lib/ui/confetti.ts
export async function fireConfetti() {
    const confetti = (await import("canvas-confetti")).default;
    const end = Date.now() + 600;

    (function frame() {
        confetti({ particleCount: 5, spread: 70, origin: { y: 0.6 } });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}
