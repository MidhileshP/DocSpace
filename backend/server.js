import app from './app.js';
import dotenv from 'dotenv';
import { createServer } from 'http';

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
