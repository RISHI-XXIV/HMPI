import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Calculate,
  Map as MapIcon,
  Warning,
  TrendingUp,
  Science,
  Policy,
  People,
  CheckCircle,
  Error,
  ArrowForward,
  WaterDrop,
  Shield,
  Analytics,
  CloudUpload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Mock data for demonstration
const mockHeatmapData = [
  { region: 'Delhi NCR', level: 'High', value: 3.2 },
  { region: 'Mumbai', level: 'Moderate', value: 1.8 },
  { region: 'Chennai', level: 'Safe', value: 0.7 },
  { region: 'Kolkata', level: 'Critical', value: 5.1 },
  { region: 'Bangalore', level: 'Safe', value: 0.5 },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pincode, setPincode] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePincodeSearch = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockResult = {
        pincode,
        status: ['Safe', 'Moderate', 'High', 'Critical'][Math.floor(Math.random() * 4)],
        hmpi: (Math.random() * 5).toFixed(2),
        lastUpdated: new Date().toISOString(),
      };
      setSearchResult(mockResult);
      setLoading(false);
    }, 1500);
  };

  const handleGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.success('Location detected successfully!');
          // Redirect to map view with current location
          navigate(`/map?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
        },
        (error) => {
          toast.error('Unable to get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Safe': return 'success';
      case 'Moderate': return 'warning';
      case 'High': return 'error';
      case 'Critical': return 'error';
      default: return 'default';
    }
  };

  const features = [
    {
      icon: <Calculate fontSize="large" />,
      title: 'Automated HMPI Calculator',
      description: 'Upload datasets and get instant HMPI calculations with categorization',
      action: () => navigate('/calculator'),
      color: '#0288d1',
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: 'AI Predictions',
      description: 'Machine learning powered contamination trend predictions',
      action: () => navigate('/dashboard'),
      color: '#00897b',
    },
    {
      icon: <MapIcon fontSize="large" />,
      title: 'Interactive GIS Maps',
      description: 'Visualize contamination levels with heatmaps and regional data',
      action: () => navigate('/map'),
      color: '#5e35b1',
    },
    {
      icon: <Warning fontSize="large" />,
      title: 'Early Warning System',
      description: 'Real-time alerts when contamination exceeds safe limits',
      action: () => navigate('/alerts'),
      color: '#e53935',
    },
  ];

  const benefits = [
    { icon: <CheckCircle />, text: 'Reduced manual errors through automation' },
    { icon: <Analytics />, text: 'Real-time monitoring and analysis' },
    { icon: <Science />, text: 'AI-driven predictive insights' },
    { icon: <Shield />, text: 'Public health protection' },
    { icon: <Policy />, text: 'Policy-ready reports and insights' },
    { icon: <People />, text: 'Citizen-friendly interface' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0288d1 0%, #00897b 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography variant="h2" fontWeight="bold" gutterBottom>
                    {t('welcome')}
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                    AI-Powered Groundwater Heavy Metal Pollution Monitoring
                  </Typography>
                  
                  {/* Quick Search */}
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                      {t('checkWaterSafety')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <TextField
                        placeholder={t('enterPincode')}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                          flex: 1,
                          minWidth: 200,
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handlePincodeSearch} disabled={loading}>
                                <Search />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<LocationOn />}
                        onClick={handleGPSLocation}
                        sx={{ bgcolor: 'white', color: 'primary.main' }}
                      >
                        {t('useGPS')}
                      </Button>
                    </Box>
                    
                    {searchResult && (
                      <Fade in>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Water Safety Status for {searchResult.pincode}:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Chip
                              label={searchResult.status}
                              color={getStatusColor(searchResult.status)}
                              size="small"
                            />
                            <Typography variant="body2">
                              HMPI: {searchResult.hmpi}
                            </Typography>
                          </Box>
                        </Box>
                      </Fade>
                    )}
                  </Paper>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1500}>
                <Box sx={{ position: 'relative', height: 400 }}>
                  {/* Animated Heatmap Preview */}
                  <Paper
                    elevation={10}
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h6" color="primary" gutterBottom>
                      Live Contamination Hotspots
                    </Typography>
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                      {mockHeatmapData.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            mb: 1,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            borderLeft: `4px solid`,
                            borderLeftColor: 
                              item.level === 'Safe' ? 'success.main' :
                              item.level === 'Moderate' ? 'warning.main' :
                              item.level === 'High' ? 'error.light' : 'error.main',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WaterDrop 
                              sx={{ 
                                color: 
                                  item.level === 'Safe' ? 'success.main' :
                                  item.level === 'Moderate' ? 'warning.main' :
                                  item.level === 'High' ? 'error.light' : 'error.main'
                              }} 
                            />
                            <Typography variant="body1" fontWeight="medium">
                              {item.region}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip 
                              label={item.level} 
                              size="small"
                              color={getStatusColor(item.level)}
                            />
                            <Typography variant="caption" display="block" color="text.secondary">
                              HMPI: {item.value}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/map')}
                      sx={{ mt: 2 }}
                    >
                      View Full Map
                    </Button>
                  </Paper>
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Key Features */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
          Key Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Comprehensive tools for groundwater quality monitoring and analysis
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: feature.color,
                        width: 60,
                        height: 60,
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="text"
                      endIcon={<ArrowForward />}
                      onClick={feature.action}
                    >
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
            Impact & Benefits
          </Typography>
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={1000 + index * 100}>
                  <Paper
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        transform: 'scale(1.05)',
                        '& .MuiSvgIcon-root': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    {React.cloneElement(benefit.icon, { 
                      sx: { color: 'primary.main', fontSize: 32 } 
                    })}
                    <Typography variant="body1">
                      {benefit.text}
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #5e35b1 0%, #1e88e5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Start Monitoring Today
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of scientists, policymakers, and citizens in ensuring safe groundwater
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUpload />}
              onClick={() => navigate('/calculator')}
              sx={{ bgcolor: 'white', color: 'primary.main' }}
            >
              Upload Data
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ borderColor: 'white', color: 'white' }}
            >
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
