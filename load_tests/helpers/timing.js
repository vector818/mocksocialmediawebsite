import { sleep } from 'k6';

// Sleep for a random duration between minMs and maxMs
export function thinkTime(minMs, maxMs) {
  const ms = minMs + Math.random() * (maxMs - minMs);
  sleep(ms / 1000);
}

// Returns true with the given probability (0.0 - 1.0)
export function shouldDo(probability) {
  return Math.random() < probability;
}

// Pick a random element from an array
export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
