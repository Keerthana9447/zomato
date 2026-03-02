import { cooccurrenceGraph } from './store.js';

export default function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    return res.status(200).json(cooccurrenceGraph);
  }
  if (method === 'POST') {
    const { source_id, target_id, weight } = req.body;
    const idx = cooccurrenceGraph.findIndex(e => e.source_id===source_id && e.target_id===target_id);
    const entry = { source_id, target_id, weight };
    if (idx === -1) cooccurrenceGraph.push(entry);
    else cooccurrenceGraph[idx] = entry;
    return res.status(201).json(entry);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
}