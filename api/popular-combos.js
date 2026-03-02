import { popularCombos, uuidv4 } from './store.js';

export default function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    return res.status(200).json(popularCombos);
  }
  if (method === 'POST') {
    const { id, item_ids } = req.body;
    const comboId = id || `combo_${uuidv4()}`;
    const idx = popularCombos.findIndex(c => c.id === comboId);
    const entry = { id: comboId, item_ids };
    if (idx === -1) popularCombos.push(entry);
    else popularCombos[idx] = entry;
    return res.status(201).json(entry);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
}