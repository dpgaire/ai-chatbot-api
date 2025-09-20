require('dotenv').config();
const express = require('express');
const cors = require('cors');

const chatRoutes = require('./routes/chat.routes');
const trainRoutes = require('./routes/train.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api/train', trainRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});