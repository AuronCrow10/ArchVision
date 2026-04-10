import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[server] ArchVision API running on port ${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV}`);
});
