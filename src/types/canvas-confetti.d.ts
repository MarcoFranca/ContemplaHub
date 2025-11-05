declare module "canvas-confetti" {
    export interface Options {
        particleCount?: number;
        angle?: number;
        spread?: number;
        startVelocity?: number;
        decay?: number;
        gravity?: number;
        ticks?: number;
        origin?: { x?: number; y?: number };
        colors?: string[];
        shapes?: ("square" | "circle")[];
        scalar?: number;
    }

    export type ConfettiFunction = (options?: Options) => void;

    const confetti: ConfettiFunction;
    export default confetti;
}
