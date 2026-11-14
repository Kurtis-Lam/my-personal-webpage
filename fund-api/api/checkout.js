const { stripe, cors, SITE, MIN_HKD, MAX_HKD, FUND_TAG } = require('../lib/common');

module.exports = async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount < MIN_HKD || amount > MAX_HKD) {
    res.status(400).json({ error: `Amount must be between HK$${MIN_HKD} and HK$${MAX_HKD}` });
    return;
  }
  const name = String(body.name || '').trim().slice(0, 60);
  try {
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      submit_type: 'donate',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'hkd',
            unit_amount: amount * 100,
            product_data: { name: "Fund Kurtis Lam's MacBook Pro" }
          }
        }
      ],
      payment_intent_data: { metadata: { fund: FUND_TAG, display_name: name } },
      success_url: `${SITE}/fund-me?status=success`,
      cancel_url: `${SITE}/fund-me?status=cancel`
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('checkout failed', err);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
};
