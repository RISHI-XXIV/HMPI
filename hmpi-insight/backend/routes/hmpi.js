const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const ContaminationData = require('../models/ContaminationData');
const hmpiCalculator = require('../utils/hmpiCalculator');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv|xlsx|xls|json/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV, Excel, and JSON files are allowed'));
    }
  }
});

// Calculate HMPI for single sample
router.post('/calculate', [
  auth,
  body('metalConcentrations').isObject(),
  body('location').optional().isObject(),
  body('sampleDate').optional().isISO8601(),
  body('source').optional().isIn(['borewell', 'well', 'handpump', 'river', 'lake', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { metalConcentrations, location, sampleDate, source, additionalInfo } = req.body;

    // Calculate HMPI
    const result = hmpiCalculator.calculate(metalConcentrations);
    
    if (!result.success) {
      return res.status(400).json({ errors: result.errors });
    }

    // Save to database if user wants to store the data
    if (req.body.saveToDatabase) {
      const contaminationData = new ContaminationData({
        sampleId: `HMPI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        location: location || { type: 'Point', coordinates: [0, 0] },
        sampleDate: sampleDate || new Date(),
        source: source || 'other',
        metalConcentrations,
        hmpiResults: {
          hmpi: result.hmpi.hmpi,
          category: result.hmpi.category,
          riskLevel: result.hmpi.riskLevel,
          exceededLimits: result.hmpi.exceededLimits
        },
        wqi: result.wqi,
        uploadedBy: req.user.id,
        ...additionalInfo
      });

      await contaminationData.save();

      // Check if alert needs to be triggered
      if (result.hmpi.category === 'High' || result.hmpi.category === 'Critical') {
        const io = req.app.get('io');
        io.emit('alert', {
          type: 'contamination',
          severity: result.hmpi.category === 'Critical' ? 'critical' : 'warning',
          location,
          hmpiValue: result.hmpi.hmpi,
          message: `High contamination detected: HMPI ${result.hmpi.hmpi}`
        });
      }

      return res.json({
        ...result,
        saved: true,
        dataId: contaminationData._id
      });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during HMPI calculation' });
  }
});

// Bulk upload and calculate HMPI
router.post('/bulk-upload', [auth], upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const errors = [];

    // Parse CSV file
    if (req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv')) {
      const stream = fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            // Extract metal concentrations from row
            const metalConcentrations = {
              lead: parseFloat(row.lead) || 0,
              arsenic: parseFloat(row.arsenic) || 0,
              mercury: parseFloat(row.mercury) || 0,
              cadmium: parseFloat(row.cadmium) || 0,
              chromium: parseFloat(row.chromium) || 0,
              nickel: parseFloat(row.nickel) || 0,
              copper: parseFloat(row.copper) || 0,
              zinc: parseFloat(row.zinc) || 0,
              iron: parseFloat(row.iron) || 0,
              manganese: parseFloat(row.manganese) || 0
            };

            // Calculate HMPI
            const result = hmpiCalculator.calculate(metalConcentrations);
            
            if (result.success) {
              results.push({
                sampleId: row.sampleId || `HMPI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                location: {
                  pincode: row.pincode,
                  district: row.district,
                  state: row.state
                },
                ...result
              });

              // Save to database
              if (req.body.saveToDatabase === 'true') {
                const contaminationData = new ContaminationData({
                  sampleId: row.sampleId || `HMPI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  location: {
                    type: 'Point',
                    coordinates: [parseFloat(row.longitude) || 0, parseFloat(row.latitude) || 0],
                    address: {
                      pincode: row.pincode,
                      district: row.district,
                      state: row.state
                    }
                  },
                  sampleDate: row.sampleDate ? new Date(row.sampleDate) : new Date(),
                  source: row.source || 'other',
                  metalConcentrations,
                  hmpiResults: {
                    hmpi: result.hmpi.hmpi,
                    category: result.hmpi.category,
                    riskLevel: result.hmpi.riskLevel,
                    exceededLimits: result.hmpi.exceededLimits
                  },
                  wqi: result.wqi,
                  uploadedBy: req.user.id
                });

                await contaminationData.save();
              }
            } else {
              errors.push({
                row: row.sampleId || 'Unknown',
                errors: result.errors
              });
            }
          } catch (error) {
            errors.push({
              row: row.sampleId || 'Unknown',
              error: error.message
            });
          }
        })
        .on('end', () => {
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
          
          res.json({
            success: true,
            totalProcessed: results.length + errors.length,
            successful: results.length,
            failed: errors.length,
            results: results.slice(0, 100), // Return first 100 results
            errors: errors.slice(0, 50), // Return first 50 errors
            summary: {
              safe: results.filter(r => r.hmpi.category === 'Safe').length,
              moderate: results.filter(r => r.hmpi.category === 'Moderate').length,
              high: results.filter(r => r.hmpi.category === 'High').length,
              critical: results.filter(r => r.hmpi.category === 'Critical').length
            }
          });
        })
        .on('error', (error) => {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ message: 'Error processing file', error: error.message });
        });
    } else {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ message: 'Unsupported file format' });
    }
  } catch (error) {
    console.error(error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error during bulk upload' });
  }
});

// Get historical HMPI data
router.get('/history', auth, async (req, res) => {
  try {
    const { 
      district, 
      state, 
      startDate, 
      endDate, 
      category,
      limit = 50,
      skip = 0
    } = req.query;

    const query = {};

    if (district) query['location.address.district'] = district;
    if (state) query['location.address.state'] = state;
    if (category) query['hmpiResults.category'] = category;
    
    if (startDate || endDate) {
      query.sampleDate = {};
      if (startDate) query.sampleDate.$gte = new Date(startDate);
      if (endDate) query.sampleDate.$lte = new Date(endDate);
    }

    const data = await ContaminationData.find(query)
      .sort({ sampleDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('uploadedBy', 'name email');

    const total = await ContaminationData.countDocuments(query);

    res.json({
      success: true,
      data,
      total,
      hasMore: total > parseInt(skip) + parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// Get HMPI statistics
router.get('/statistics', async (req, res) => {
  try {
    const { district, state, period = '30d' } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      case '1y':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
    }

    const matchQuery = {
      sampleDate: { $gte: dateFilter }
    };

    if (district) matchQuery['location.address.district'] = district;
    if (state) matchQuery['location.address.state'] = state;

    const statistics = await ContaminationData.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$hmpiResults.category',
          count: { $sum: 1 },
          avgHMPI: { $avg: '$hmpiResults.hmpi' },
          maxHMPI: { $max: '$hmpiResults.hmpi' },
          minHMPI: { $min: '$hmpiResults.hmpi' }
        }
      }
    ]);

    const metalStats = await ContaminationData.aggregate([
      { $match: matchQuery },
      {
        $project: {
          exceededMetals: '$hmpiResults.exceededLimits.metal'
        }
      },
      { $unwind: '$exceededMetals' },
      {
        $group: {
          _id: '$exceededMetals',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      period,
      statistics,
      metalStats,
      totalSamples: statistics.reduce((acc, curr) => acc + curr.count, 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

module.exports = router;
