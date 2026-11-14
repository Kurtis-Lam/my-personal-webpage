const { stripe, cors, maskName, GOAL_HKD, FUND_TAG } = require('../lib/common');

module.exports = async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const intents = await stripe()
      .paymentIntents.list({ limit: 100, expand: ['data.latest_charge'] })
      .autoPagingToArray({ limit: 500 });

    const paid = [];
    for (const pi of intents) {
      if (pi.status !== 'succeeded' || !pi.metadata || pi.metadata.fund !== FUND_TAG) continue;
      const charge = pi.latest_charge && typeof pi.latest_charge === 'object' ? pi.latest_charge : null;
      const refunded = charge ? charge.amount_refunded || 0 : 0;
      const net = ((pi.amount_received || 0) - refunded) / 100;
      if (net <= 0) continue;
      paid.push({
        name: maskName(pi.metadata.display_name),
        amount: net,
        at: pi.created * 1000
      });
    }
    paid.sort((a, b) => b.at - a.at);

    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60');
    res.status(200).json({
      goal: GOAL_HKD,
      currency: 'HKD',
      raised: paid.reduce((sum, p) => sum + p.amount, 0),
      count: paid.length,
      recent: paid.slice(0, 50)
    });
  } catch (err) {
    console.error('fund read failed', err);
    res.status(500).json({ error: 'Could not load fund status' });
  }
};
