const express = require('express');
const router = express.Router();

router.get('/check-water-safety', (req, res) => {
  res.json({ message: 'Citizen portal endpoint - to be implemented' });
});

module.exports = router;
