import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success('Login successful! Redirecting...');
        
        const userRole = response.data.user.role;
        if (userRole === 'admin' || userRole === 'scientist') {
          navigate('/dashboard');
        } else if (userRole === 'policymaker') {
          navigate('/reports');
        } else {
          navigate('/citizen');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onSubmit({
      email: 'demo@example.com',
      password: 'demo123'
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0288d1 0%, #00897b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>

        <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
          Welcome Back
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Login to access HMPI-Insight Platform
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            margin="normal"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              background: 'linear-gradient(135deg, #0288d1 0%, #00897b 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0277bd 0%, #00796b 100%)',
              },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Password reset feature coming soon!');
              }}
            >
              Forgot password?
            </Link>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
            >
              Don't have an account? Sign Up
            </Link>
          </Box>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleDemoLogin}
            startIcon={<PersonAdd />}
            sx={{ mb: 1 }}
          >
            Try Demo Account
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/')}
            sx={{ mt: 1 }}
          >
            Back to Home
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
