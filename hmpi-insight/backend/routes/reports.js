const express = require('express');
const router = express.Router();

router.get('/generate', (req, res) => {
  res.json({ message: 'Reports endpoint - to be implemented' });
});

module.exports = router;
