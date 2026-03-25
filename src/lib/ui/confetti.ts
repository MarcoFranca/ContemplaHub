"use client";

async function getConfetti() {
    return (await import("canvas-confetti")).default;
}

export async function fireConfetti() {
    const confetti = await getConfetti();
    const end = Date.now() + 600;

    (function frame() {
        confetti({
            particleCount: 5,
            spread: 70,
            origin: { y: 0.6 },
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}

export async function fireSuccessConfetti() {
    const confetti = await getConfetti();
    const duration = 1400;
    const animationEnd = Date.now() + duration;

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            window.clearInterval(interval);
            return;
        }

        const particleCount = Math.max(8, Math.round(36 * (timeLeft / duration)));

        confetti({
            particleCount,
            spread: 90,
            startVelocity: 28,
            ticks: 70,
            scalar: 0.95,
            origin: {
                x: randomInRange(0.15, 0.35),
                y: randomInRange(0.2, 0.4),
            },
        });

        confetti({
            particleCount,
            spread: 90,
            startVelocity: 28,
            ticks: 70,
            scalar: 0.95,
            origin: {
                x: randomInRange(0.65, 0.85),
                y: randomInRange(0.2, 0.4),
            },
        });
    }, 220);
}

export async function fireContemplacaoConfetti() {
    const confetti = await getConfetti();

    await confetti({
        particleCount: 160,
        spread: 120,
        startVelocity: 34,
        ticks: 120,
        scalar: 1.05,
        origin: { y: 0.58 },
    });

    const end = Date.now() + 900;

    (function frame() {
        confetti({
            particleCount: 6,
            spread: 75,
            startVelocity: 22,
            ticks: 60,
            origin: {
                x: Math.random(),
                y: Math.random() * 0.25 + 0.35,
            },
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}