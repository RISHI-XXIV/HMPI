import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  IconButton,
  Drawer,
  Fab,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Map as MapIcon,
  Search,
  MyLocation,
  Layers,
  FilterList,
  LocationOn,
  WaterDrop,
  Info,
  Close,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ContaminationPoint {
  id: string;
  position: [number, number];
  location: string;
  hmpi: number;
  category: 'Safe' | 'Moderate' | 'High' | 'Critical';
  lastUpdated: string;
  metals?: any;
}

// Mock data for demonstration
const mockContaminationData: ContaminationPoint[] = [
  {
    id: '1',
    position: [28.6139, 77.2090],
    location: 'New Delhi',
    hmpi: 3.2,
    category: 'High',
    lastUpdated: '2024-01-15',
    metals: { lead: 0.02, arsenic: 0.015 },
  },
  {
    id: '2',
    position: [19.0760, 72.8777],
    location: 'Mumbai',
    hmpi: 1.8,
    category: 'Moderate',
    lastUpdated: '2024-01-14',
    metals: { cadmium: 0.004, iron: 0.35 },
  },
  {
    id: '3',
    position: [13.0827, 80.2707],
    location: 'Chennai',
    hmpi: 0.7,
    category: 'Safe',
    lastUpdated: '2024-01-13',
    metals: { copper: 1.2, zinc: 1.8 },
  },
  {
    id: '4',
    position: [22.5726, 88.3639],
    location: 'Kolkata',
    hmpi: 5.1,
    category: 'Critical',
    lastUpdated: '2024-01-12',
    metals: { mercury: 0.002, lead: 0.025 },
  },
  {
    id: '5',
    position: [12.9716, 77.5946],
    location: 'Bangalore',
    hmpi: 0.5,
    category: 'Safe',
    lastUpdated: '2024-01-11',
    metals: { nickel: 0.015, manganese: 0.08 },
  },
];

const MapControls: React.FC<{ map: L.Map | null }> = ({ map }) => {
  const handleZoomIn = () => {
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut();
  };

  const handleLocate = () => {
    if (map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView([position.coords.latitude, position.coords.longitude], 13);
          toast.success('Location found!');
        },
        () => {
          toast.error('Unable to get your location');
        }
      );
    }
  };

  return (
    <Box sx={{ position: 'absolute', top: 80, right: 10, zIndex: 1000 }}>
      <ButtonGroup orientation="vertical" variant="contained" size="small">
        <Button onClick={handleZoomIn} startIcon={<ZoomIn />}>
          Zoom In
        </Button>
        <Button onClick={handleZoomOut} startIcon={<ZoomOut />}>
          Zoom Out
        </Button>
        <Button onClick={handleLocate} startIcon={<MyLocation />}>
          My Location
        </Button>
      </ButtonGroup>
    </Box>
  );
};

const MapView: React.FC = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ContaminationPoint | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mapLayer, setMapLayer] = useState('street');

  const filteredPoints = mockContaminationData.filter(point => {
    if (filterCategory !== 'all' && point.category !== filterCategory) {
      return false;
    }
    if (searchQuery && !point.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Safe':
        return '#4caf50';
      case 'Moderate':
        return '#ff9800';
      case 'High':
        return '#ff5722';
      case 'Critical':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const handleSearch = () => {
    const point = mockContaminationData.find(
      p => p.location.toLowerCase() === searchQuery.toLowerCase()
    );
    if (point && map) {
      map.setView(point.position, 12);
      setSelectedPoint(point);
      toast.success(`Found ${point.location}`);
    } else {
      toast.error('Location not found');
    }
  };

  const MapLayerControl = () => {
    const layers = [
      { id: 'street', name: 'Street Map', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
      { id: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
      { id: 'terrain', name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
    ];

    return (
      <Box sx={{ position: 'absolute', bottom: 20, left: 10, zIndex: 1000 }}>
        <Card>
          <CardContent sx={{ p: 1 }}>
            <Typography variant="caption" gutterBottom>
              Map Layers
            </Typography>
            <ButtonGroup size="small">
              {layers.map(layer => (
                <Button
                  key={layer.id}
                  variant={mapLayer === layer.id ? 'contained' : 'outlined'}
                  onClick={() => setMapLayer(layer.id)}
                  size="small"
                >
                  {layer.name}
                </Button>
              ))}
            </ButtonGroup>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Container maxWidth={false} sx={{ p: 0, height: 'calc(100vh - 64px)', position: 'relative' }}>
      {/* Search Bar */}
      <Paper
        sx={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          p: 1,
          width: { xs: '90%', sm: 400 },
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} size="small">
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Filter Controls */}
      <Paper
        sx={{
          position: 'absolute',
          top: 70,
          left: 10,
          zIndex: 1000,
          p: 2,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Filter by Category
        </Typography>
        <ButtonGroup orientation="vertical" size="small">
          <Button
            variant={filterCategory === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilterCategory('all')}
          >
            All ({mockContaminationData.length})
          </Button>
          {['Safe', 'Moderate', 'High', 'Critical'].map(category => (
            <Button
              key={category}
              variant={filterCategory === category ? 'contained' : 'outlined'}
              onClick={() => setFilterCategory(category)}
              startIcon={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: getCategoryColor(category),
                  }}
                />
              }
            >
              {category} ({mockContaminationData.filter(p => p.category === category).length})
            </Button>
          ))}
        </ButtonGroup>
      </Paper>

      {/* Map Container */}
      <MapContainer
        center={[20.5937, 78.9629]} // Center of India
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <TileLayer
          url={
            mapLayer === 'satellite'
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              : mapLayer === 'terrain'
              ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {filteredPoints.map(point => (
          <CircleMarker
            key={point.id}
            center={point.position}
            radius={15}
            fillColor={getCategoryColor(point.category)}
            color={getCategoryColor(point.category)}
            weight={2}
            opacity={0.8}
            fillOpacity={0.6}
            eventHandlers={{
              click: () => {
                setSelectedPoint(point);
                setDrawerOpen(true);
              },
            }}
          >
            <Popup>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {point.location}
                </Typography>
                <Chip
                  label={point.category}
                  size="small"
                  sx={{
                    bgcolor: getCategoryColor(point.category),
                    color: 'white',
                    my: 1,
                  }}
                />
                <Typography variant="body2">
                  HMPI: {point.hmpi}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {point.lastUpdated}
                </Typography>
              </Box>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map Controls */}
      <MapControls map={map} />
      <MapLayerControl />

      {/* Legend */}
      <Card
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 10,
          zIndex: 1000,
          minWidth: 150,
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" gutterBottom>
            Legend
          </Typography>
          {['Safe', 'Moderate', 'High', 'Critical'].map(category => (
            <Box key={category} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: getCategoryColor(category),
                  mr: 1,
                }}
              />
              <Typography variant="caption">{category}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 350 } }}
      >
        {selectedPoint && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">{selectedPoint.location}</Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <Close />
              </IconButton>
            </Box>

            <Alert severity={getCategoryColor(selectedPoint.category) as any} sx={{ mb: 2 }}>
              {selectedPoint.category} - HMPI: {selectedPoint.hmpi}
            </Alert>

            <List>
              <ListItem>
                <ListItemIcon>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText
                  primary="Coordinates"
                  secondary={`${selectedPoint.position[0].toFixed(4)}, ${selectedPoint.position[1].toFixed(4)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WaterDrop />
                </ListItemIcon>
                <ListItemText
                  primary="Water Quality"
                  secondary={selectedPoint.category}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info />
                </ListItemIcon>
                <ListItemText
                  primary="Last Updated"
                  secondary={selectedPoint.lastUpdated}
                />
              </ListItem>
            </List>

            {selectedPoint.metals && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Metal Concentrations (mg/L)
                </Typography>
                {Object.entries(selectedPoint.metals).map(([metal, value]) => (
                  <Box key={metal} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" textTransform="capitalize">
                      {metal}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {value as number}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => {
                toast.info('Detailed report feature coming soon!');
              }}
            >
              View Detailed Report
            </Button>
          </Box>
        )}
      </Drawer>

      {/* Floating Action Button */}
      <Tooltip title="Toggle Filters">
        <Fab
          color="primary"
          sx={{ position: 'absolute', bottom: 80, right: 20 }}
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <FilterList />
        </Fab>
      </Tooltip>
    </Container>
  );
};

export default MapView;
