const express = require('express');
const router = express.Router();

router.get('/forecast', (req, res) => {
  res.json({ message: 'Predictions endpoint - to be implemented' });
});

module.exports = router;
