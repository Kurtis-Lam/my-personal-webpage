const Stripe = require('stripe');

const SITE = 'https://kurtis-lam.web.app';
const ORIGINS = [SITE, 'https://kurtis-lam.firebaseapp.com', 'http://localhost:5000'];
const GOAL_HKD = 20000;
const MIN_HKD = 10;
const MAX_HKD = 20000;
const FUND_TAG = 'macbook';

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key);
}

function cors(req, res) {
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');
  if (origin && ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}

function maskName(raw) {
  const words = String(raw || '').trim().split(/\s+/).filter(Boolean).slice(0, 4);
  if (!words.length) return 'Anonymous';
  return words.map((w) => Array.from(w)[0] + '****').join(' ');
}

module.exports = { stripe, cors, maskName, SITE, GOAL_HKD, MIN_HKD, MAX_HKD, FUND_TAG };
