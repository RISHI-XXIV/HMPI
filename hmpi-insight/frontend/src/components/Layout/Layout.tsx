import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Select,
  FormControl,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Calculate,
  Map,
  Dashboard,
  Warning,
  Assessment,
  Person,
  WaterDrop,
  Language,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t, i18n } = useTranslation();

  const menuItems = [
    { title: t('home'), icon: <Home />, path: '/' },
    { title: t('hmpiCalculator'), icon: <Calculate />, path: '/calculator' },
    { title: t('viewMap'), icon: <Map />, path: '/map' },
    { title: t('dashboard'), icon: <Dashboard />, path: '/dashboard' },
    { title: t('alerts'), icon: <Warning />, path: '/alerts' },
    { title: t('reports'), icon: <Assessment />, path: '/reports' },
    { title: 'Citizen Portal', icon: <Person />, path: '/citizen' },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (event: any) => {
    i18n.changeLanguage(event.target.value);
  };

  const isAuthenticated = localStorage.getItem('token') !== null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg, #0288d1 0%, #00897b 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <WaterDrop sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            HMPI-Insight
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              {menuItems.slice(0, 4).map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleMenuClick(item.path)}
                  sx={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </Box>
          )}

          <FormControl size="small" sx={{ mr: 2, minWidth: 80 }}>
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="hi">हिं</MenuItem>
              <MenuItem value="ta">தமி</MenuItem>
              <MenuItem value="te">తె</MenuItem>
            </Select>
          </FormControl>

          {isAuthenticated ? (
            <>
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar sx={{ bgcolor: 'secondary.main' }}>U</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
                <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
                <MenuItem onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/');
                }}>
                  <Logout sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ borderColor: 'white' }}
              >
                {t('login')}
              </Button>
              <Button
                color="inherit"
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}
              >
                {t('register')}
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">HMPI-Insight</Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
