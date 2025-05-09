const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;
const gridData = require('./data');

app.use(express.json());
app.use(cors());

app.get('/api/prices', (req, res) => {
  res.json(gridData);
});

app.post('/api/prices', (req, res) => {
  const { row, col, newValue } = req.body;
  if (
    row >= 0 &&
    row < gridData.prices.length &&
    col >= 0 &&
    col < gridData.prices[0].length &&
    !isNaN(newValue)
  ) {
    gridData.prices[row][col] = Number(newValue);
    return res.json({ success: true });
  }
  res.status(400).json({ success: false, message: 'Invalid input' });
});

app.post('/api/add-column', (req, res) => {
  const { newWidth } = req.body;
  if (typeof newWidth !== 'number') return res.status(400).json({ message: 'Invalid width' });

  gridData.widths.push(newWidth);
  gridData.prices.forEach(row => row.push(0));
  res.json(gridData);
});
  

app.post('/api/add-row', (req, res) => {
  const { newHeight, prices } = req.body;
  if (
    typeof newHeight !== 'number' ||
    !Array.isArray(prices) ||
    prices.length !== gridData.widths.length
  ) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  gridData.heights.push(newHeight);
  gridData.prices.push(prices.map(Number));
  res.json(gridData);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
