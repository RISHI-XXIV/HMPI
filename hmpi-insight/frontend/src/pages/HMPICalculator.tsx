import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Calculate,
  CloudUpload,
  Info,
  ExpandMore,
  Download,
  Refresh,
  Science,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

interface MetalConcentrations {
  lead: number;
  arsenic: number;
  mercury: number;
  cadmium: number;
  chromium: number;
  nickel: number;
  copper: number;
  zinc: number;
  iron: number;
  manganese: number;
}

interface HMPIResult {
  hmpi: {
    hmpi: number;
    category: string;
    riskLevel: string;
    recommendation: string;
    exceededLimits: Array<{
      metal: string;
      concentration: number;
      limit: number;
      exceedanceRatio: number;
    }>;
  };
  wqi: {
    wqi: number;
    quality: string;
  };
}

const METAL_LIMITS = {
  lead: 0.01,
  arsenic: 0.01,
  mercury: 0.001,
  cadmium: 0.003,
  chromium: 0.05,
  nickel: 0.02,
  copper: 2.0,
  zinc: 3.0,
  iron: 0.3,
  manganese: 0.1,
};

const HMPICalculator: React.FC = () => {
  const [concentrations, setConcentrations] = useState<MetalConcentrations>({
    lead: 0,
    arsenic: 0,
    mercury: 0,
    cadmium: 0,
    chromium: 0,
    nickel: 0,
    copper: 0,
    zinc: 0,
    iron: 0,
    manganese: 0,
  });

  const [result, setResult] = useState<HMPIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({
    pincode: '',
    district: '',
    state: '',
  });

  const handleConcentrationChange = (metal: keyof MetalConcentrations, value: string) => {
    const numValue = parseFloat(value) || 0;
    setConcentrations(prev => ({
      ...prev,
      [metal]: numValue,
    }));
  };

  const calculateHMPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/hmpi/calculate',
        {
          metalConcentrations: concentrations,
          location: {
            type: 'Point',
            coordinates: [0, 0],
            address: location,
          },
          sampleDate: new Date().toISOString(),
          source: 'manual',
          saveToDatabase: false,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setResult(response.data);
      toast.success('HMPI calculated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Calculation failed');
      // For demo, calculate locally if API fails
      calculateLocally();
    } finally {
      setLoading(false);
    }
  };

  const calculateLocally = () => {
    // Local calculation for demo
    let totalWeightedSum = 0;
    let totalWeight = 0;
    const exceededLimits: any[] = [];

    Object.entries(concentrations).forEach(([metal, concentration]) => {
      const limit = METAL_LIMITS[metal as keyof typeof METAL_LIMITS];
      const weight = getWeight(metal);
      const index = concentration / limit;
      
      if (index > 1) {
        exceededLimits.push({
          metal,
          concentration,
          limit,
          exceedanceRatio: index,
        });
      }
      
      totalWeightedSum += weight * index;
      totalWeight += weight;
    });

    const hmpiValue = totalWeight > 0 ? totalWeightedSum / totalWeight : 0;
    const category = getCategory(hmpiValue);

    setResult({
      hmpi: {
        hmpi: parseFloat(hmpiValue.toFixed(3)),
        category,
        riskLevel: category.toLowerCase(),
        recommendation: getRecommendation(category),
        exceededLimits,
      },
      wqi: {
        wqi: parseFloat((hmpiValue * 50).toFixed(2)),
        quality: getWQIQuality(hmpiValue * 50),
      },
    });
  };

  const getWeight = (metal: string): number => {
    const weights: Record<string, number> = {
      lead: 10,
      arsenic: 10,
      mercury: 10,
      cadmium: 9,
      chromium: 8,
      nickel: 7,
      copper: 5,
      zinc: 3,
      iron: 2,
      manganese: 3,
    };
    return weights[metal] || 1;
  };

  const getCategory = (hmpi: number): string => {
    if (hmpi <= 1) return 'Safe';
    if (hmpi <= 2) return 'Moderate';
    if (hmpi <= 5) return 'High';
    return 'Critical';
  };

  const getRecommendation = (category: string): string => {
    switch (category) {
      case 'Safe':
        return 'Water is safe for drinking and domestic use.';
      case 'Moderate':
        return 'Water quality needs monitoring. Treatment recommended for drinking purposes.';
      case 'High':
        return 'Water is contaminated. Treatment required before any use.';
      case 'Critical':
        return 'Water is severely contaminated. Immediate action required. Not suitable for any use without extensive treatment.';
      default:
        return 'Unable to determine recommendation.';
    }
  };

  const getWQIQuality = (wqi: number): string => {
    if (wqi < 50) return 'Excellent';
    if (wqi < 100) return 'Good';
    if (wqi < 200) return 'Poor';
    if (wqi < 300) return 'Very Poor';
    return 'Unsuitable';
  };

  const getCategoryColor = (category: string): any => {
    switch (category) {
      case 'Safe':
        return 'success';
      case 'Moderate':
        return 'warning';
      case 'High':
        return 'error';
      case 'Critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const loadSampleData = () => {
    setConcentrations({
      lead: 0.015,
      arsenic: 0.008,
      mercury: 0.0005,
      cadmium: 0.004,
      chromium: 0.03,
      nickel: 0.015,
      copper: 1.5,
      zinc: 2.0,
      iron: 0.4,
      manganese: 0.08,
    });
    toast.success('Sample data loaded');
  };

  const resetForm = () => {
    setConcentrations({
      lead: 0,
      arsenic: 0,
      mercury: 0,
      cadmium: 0,
      chromium: 0,
      nickel: 0,
      copper: 0,
      zinc: 0,
      iron: 0,
      manganese: 0,
    });
    setResult(null);
    setLocation({ pincode: '', district: '', state: '' });
  };

  const downloadReport = () => {
    if (!result) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      location,
      concentrations,
      result,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HMPI_Report_${Date.now()}.json`;
    a.click();
    toast.success('Report downloaded');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Science sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              HMPI Calculator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calculate Heavy Metal Pollution Index based on WHO/BIS standards
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Enter metal concentrations in mg/L (milligrams per liter) for accurate HMPI calculation
        </Alert>

        <Grid container spacing={3}>
          {/* Input Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Metal Concentrations (mg/L)
                  </Typography>
                  <Box>
                    <Tooltip title="Load sample data">
                      <IconButton onClick={loadSampleData} size="small" color="primary">
                        <CloudUpload />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset form">
                      <IconButton onClick={resetForm} size="small" color="secondary">
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  {Object.entries(concentrations).map(([metal, value]) => (
                    <Grid item xs={12} sm={6} key={metal}>
                      <TextField
                        fullWidth
                        label={metal.charAt(0).toUpperCase() + metal.slice(1)}
                        type="number"
                        size="small"
                        value={value}
                        onChange={(e) => handleConcentrationChange(metal as keyof MetalConcentrations, e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={`WHO Limit: ${METAL_LIMITS[metal as keyof typeof METAL_LIMITS]} mg/L`}>
                                <Info fontSize="small" />
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          min: 0,
                          step: 0.001,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Location Information (Optional)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="PIN Code"
                      size="small"
                      value={location.pincode}
                      onChange={(e) => setLocation({ ...location, pincode: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="District"
                      size="small"
                      value={location.district}
                      onChange={(e) => setLocation({ ...location, district: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State"
                      size="small"
                      value={location.state}
                      onChange={(e) => setLocation({ ...location, state: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Calculate />}
                  onClick={calculateHMPI}
                  disabled={loading}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #0288d1 0%, #00897b 100%)',
                  }}
                >
                  {loading ? 'Calculating...' : 'Calculate HMPI'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={6}>
            {result ? (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Results</Typography>
                    <IconButton onClick={downloadReport} size="small" color="primary">
                      <Download />
                    </IconButton>
                  </Box>

                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h2" fontWeight="bold" color="primary">
                      {result.hmpi.hmpi}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      HMPI Value
                    </Typography>
                    <Chip
                      label={result.hmpi.category}
                      color={getCategoryColor(result.hmpi.category)}
                      size="large"
                      icon={
                        result.hmpi.category === 'Safe' ? <CheckCircle /> :
                        result.hmpi.category === 'Critical' ? <ErrorIcon /> :
                        <Warning />
                      }
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Alert severity={getCategoryColor(result.hmpi.category)} sx={{ mb: 2 }}>
                    {result.hmpi.recommendation}
                  </Alert>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Water Quality Index
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(result.wqi.wqi, 100)}
                        sx={{ flex: 1, height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2">
                        {result.wqi.wqi} ({result.wqi.quality})
                      </Typography>
                    </Box>
                  </Box>

                  {result.hmpi.exceededLimits.length > 0 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2">
                          Metals Exceeding Limits ({result.hmpi.exceededLimits.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Metal</TableCell>
                                <TableCell>Concentration</TableCell>
                                <TableCell>Limit</TableCell>
                                <TableCell>Exceedance</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {result.hmpi.exceededLimits.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.metal}</TableCell>
                                  <TableCell>{item.concentration} mg/L</TableCell>
                                  <TableCell>{item.limit} mg/L</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`${item.exceedanceRatio.toFixed(2)}x`}
                                      size="small"
                                      color="error"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Science sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Enter metal concentrations and click Calculate
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Results will appear here
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* WHO Standards Reference */}
        <Accordion sx={{ mt: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">WHO/BIS Permissible Limits Reference</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Heavy Metal</TableCell>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Permissible Limit (mg/L)</TableCell>
                    <TableCell>Health Impact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { metal: 'Lead', symbol: 'Pb', limit: 0.01, impact: 'Neurological damage, kidney disease' },
                    { metal: 'Arsenic', symbol: 'As', limit: 0.01, impact: 'Cancer, skin lesions' },
                    { metal: 'Mercury', symbol: 'Hg', limit: 0.001, impact: 'Neurological disorders' },
                    { metal: 'Cadmium', symbol: 'Cd', limit: 0.003, impact: 'Kidney damage, bone disease' },
                    { metal: 'Chromium', symbol: 'Cr', limit: 0.05, impact: 'Liver, kidney damage' },
                    { metal: 'Nickel', symbol: 'Ni', limit: 0.02, impact: 'Allergic reactions, lung cancer' },
                  ].map((row) => (
                    <TableRow key={row.metal}>
                      <TableCell>{row.metal}</TableCell>
                      <TableCell>{row.symbol}</TableCell>
                      <TableCell>{row.limit}</TableCell>
                      <TableCell>{row.impact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Container>
  );
};

export default HMPICalculator;
