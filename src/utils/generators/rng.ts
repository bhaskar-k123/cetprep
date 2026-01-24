// Deterministic Pseudo-Random Number Generator
// We need stability so users see the same "generated" questions across reloads.

export class SeededRNG {
  private state: number;

  constructor(seed: string) {
    this.state = this.hashString(seed);
  }

  private hashString(str: string): number {
    let h = 0xdeadbeef;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
    }
    return ((h ^ h >>> 16) >>> 0);
  }

  // Returns float between 0 and 1
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  // Returns integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick random item from array
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  // Shuffle array
  shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = this.nextInt(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
