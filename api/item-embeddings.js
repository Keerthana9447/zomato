import { itemEmbeddings } from './store.js';

export default function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    return res.status(200).json(itemEmbeddings);
  }
  if (method === 'POST') {
    const { item_id, vector } = req.body;
    const idx = itemEmbeddings.findIndex(e => e.item_id === item_id);
    const entry = { item_id, vector };
    if (idx === -1) {
      itemEmbeddings.push(entry);
    } else {
      itemEmbeddings[idx] = entry;
    }
    return res.status(201).json(entry);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
}