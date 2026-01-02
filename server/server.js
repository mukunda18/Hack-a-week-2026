import dotenv from 'dotenv';
import express from 'express';
import next from 'next';

dotenv.config();

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
  });

  server.use((req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`> Server running on http://localhost:${port}`);
  });
});
