import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { login } from './controllers/authController';
import { pull, push } from './controllers/syncController';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// API Auth routes
app.post('/api/auth/login', login);

// API Sync routes
app.post('/api/sync/pull', authMiddleware as any, pull as any);
app.post('/api/sync/push', authMiddleware as any, push as any);

// Serve compiled static assets from webapp in production
const frontendPath = path.join(__dirname, '../../webapp/dist');
app.use(express.static(frontendPath));

// Wildcard routing to redirect all page refreshes to React SPA index
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==========================================`);
  console.log(`  VocaHani Server running on port: ${PORT}`);
  console.log(`==========================================`);
});
