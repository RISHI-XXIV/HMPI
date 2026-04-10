const express = require('express');
const router = express.Router();

router.get('/heatmap-data', (req, res) => {
  res.json({ message: 'GIS endpoint - to be implemented' });
});

module.exports = router;
