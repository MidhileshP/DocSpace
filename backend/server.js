import app from './app.js';
import { createServer } from 'http';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
