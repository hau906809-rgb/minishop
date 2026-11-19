const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');
const { seed } = require('./config/seed');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('MiniShop API is running. Xem /api/products'));
app.use('/api', routes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/minishop';

mongoose.connect(URI)
  .then(async () => {
    console.log('Đã kết nối MongoDB');
    await seed();
    app.listen(PORT, () => console.log(`API sẵn sàng tại http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });
