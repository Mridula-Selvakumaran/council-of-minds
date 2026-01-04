import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runPipeline } from './orchestrator/pipeline.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// Main query endpoint
app.post('/query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid query. Please provide a non-empty string.' 
      });
    }

    console.log(`[${new Date().toISOString()}] Received query: "${query}"`);

    // Run the multi-agent pipeline
    const result = await runPipeline(query);

    res.json(result);
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Council of Minds backend running on http://localhost:${PORT}`);
  console.log(`📡 Send queries to POST http://localhost:${PORT}/query`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
});