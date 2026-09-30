import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', name), 'utf8'));
}

export const sources = () => {
  const s = load('sources.json');
  delete s._note;
  return s;
};
export const matrix = () => load('matrix.json');
export const referrers = () => load('referrers.json').referrers;
export const bots = () => load('bots.json').bots;
export const ads = () => load('ads.json');

export const STATUSES = ['yes', 'partial', 'none-found', 'unverified'];
