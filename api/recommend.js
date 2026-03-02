import { menuItems, logs, uuidv4 } from './store.js';

// simple recommendation scoring reused from earlier, now extended for AI depth and cold start
import { popularCombos, itemEmbeddings, cooccurrenceGraph } from './store.js';

function generateRecommendations(cartItems, context) {
  const cartIds = new Set(cartItems.map(i => i.id));
  const available = menuItems.filter(i => !cartIds.has(i.id));

  // transformer-style cart encoder stub: weight items by recency
  const encodedCart = cartItems.map((i, idx) => ({ id: i.id, weight: 1 / (idx + 1) }));

  const scores = available.map(item => {
    let score = 0;
    const cartCats = new Set(cartItems.map(ci => ci.category));
    if (item.category === 'beverage' && cartCats.has('main')) score += 0.8;
    else if (item.category === 'side' && cartCats.has('main')) score += 0.7;
    else if (item.category === 'dessert') score += 0.6;
    else if (item.category === 'condiment' && (cartCats.has('main') || cartCats.has('side'))) score += 0.7;
    else if (item.category === 'appetizer' && cartItems.length < 2) score += 0.5;
    else score += 0.3;

    if (item.cuisine === context.cuisine) score += 0.2;
    else if (['condiment','beverage','side'].includes(item.category)) score += 0.1;

    if (context.user_segment === 'budget' && item.price <= 200) score += 0.2;
    else if (context.user_segment === 'premium' && item.price > 250) score += 0.2;
    else if (context.user_segment === 'frequent') score += 0.1;

    score += (item.popularity_score / 100) * 0.15;

    // embedding similarity placeholder
    const emb = itemEmbeddings.find(e=>e.item_id===item.id);
    if (emb) score += 0.05; // stub

    if (context.meal_time === 'breakfast' && ['side','beverage','condiment'].includes(item.category)) score += 0.1;
    if (context.meal_time === 'lunch' && ['main','side','beverage'].includes(item.category)) score += 0.1;
    if (context.meal_time === 'dinner' && ['main','side','dessert'].includes(item.category)) score += 0.1;
    if (context.meal_time === 'late_night' && item.price <= 300) score += 0.1;

    // graph-based boost
    const edge = cooccurrenceGraph.find(e => e.source_id === context.cuisine && e.target_id === item.id);
    if (edge) score += edge.weight * 0.05;

    return { ...item, score: Math.min(score,1) };
  });
  scores.sort((a,b)=>b.score-a.score);

  // cold-start: if cart empty, return popular combos first
  if (cartItems.length === 0 && popularCombos.length > 0) {
    const comboIds = popularCombos[0].item_ids;
    return available.filter(i=>comboIds.includes(i.name)).slice(0,6);
  }

  return scores.slice(0,6);
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { cart_items, meal_time, cuisine, user_segment, city } = req.body;
  const recs = generateRecommendations(cart_items || [], { meal_time, cuisine, user_segment, city });
  const latency = 0; // not measured in serverless
  const logId = `log_${uuidv4()}`;
  const now = new Date().toISOString();
  logs.push({ id: logId, session_id: uuidv4(), meal_time, user_segment, city,
    cart_items, recommended_items: recs, accepted_items: [], aov_before:0, aov_after:0, latency_ms: latency, created_date: now });
  res.status(200).json({ recommendations: recs, latency_ms: latency });
}