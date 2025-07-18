import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, TextField, Typography, Snackbar, Alert, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';

interface Props {
  onLogin: (token: string) => void;
  studioToken: string | null;
  setStudioToken: (token: string | null) => void;
  showRegister: boolean;
  setShowRegister: (show: boolean) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

const apiUrl = '/api/studio-users';

const StudioFlyerLogin: React.FC<Props> = ({ onLogin, studioToken, setStudioToken, showRegister, setShowRegister, loginModalOpen, setLoginModalOpen }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (showOtp && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [showOtp]);

  const handleSendOtp = async () => {
    if (loginMethod === 'email' && !email.includes('@')) {
      setSnackbar({ open: true, message: 'Enter a valid email', severity: 'error' });
      return;
    }
    if (loginMethod === 'phone' && !/^\d{10,15}$/.test(phone)) {
      setSnackbar({ open: true, message: 'Enter a valid phone number', severity: 'error' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginMethod === 'email' ? { email } : { phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtp(true);
        setSnackbar({ open: true, message: `OTP sent to ${loginMethod === 'email' ? email : phone}`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to send OTP', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to send OTP', severity: 'error' });
    }
    setIsLoading(false);
  };

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/\d?/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setIsOtpInvalid(false);
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') handleVerifyOtp();
  };

  const setInputRef = (el: HTMLInputElement | null, index: number) => {
    inputRefs.current[index] = el;
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setIsOtpInvalid(true);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginMethod === 'email' ? { email, otp: enteredOtp } : { phone, otp: enteredOtp }),
      });
      const data = await res.json();
      if (res.ok) {
        // Always store the token after OTP verification
        if (data.token) {
          localStorage.setItem('studioToken', data.token);
        }
        if (data.isNewUser) {
          setIsNewUser(true);
          setSnackbar({ open: true, message: 'Complete registration', severity: 'info' });
        } else {
          onLogin(data.token);
        }
      } else {
        setIsOtpInvalid(true);
        setSnackbar({ open: true, message: data.message || 'Invalid OTP', severity: 'error' });
      }
    } catch (err) {
      setIsOtpInvalid(true);
      setSnackbar({ open: true, message: 'Failed to verify OTP', severity: 'error' });
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setSnackbar({ open: true, message: 'Enter first and last name', severity: 'error' });
      return;
    }
    // If phone login, require email for registration; if email login, require phone for registration
    if (loginMethod === 'phone' && (!regEmail || !regEmail.includes('@'))) {
      setSnackbar({ open: true, message: 'Enter a valid email address', severity: 'error' });
      return;
    }
    if (loginMethod === 'email' && regPhone && !/^\d{10,15}$/.test(regPhone)) {
      setSnackbar({ open: true, message: 'Enter a valid phone number', severity: 'error' });
      return;
    }
    // Check for token before making PATCH request
    const token = localStorage.getItem('studioToken');
    if (!token) {
      setSnackbar({ open: true, message: 'Session expired. Please login again.', severity: 'error' });
      setTimeout(() => { window.location.href = '/studio/login'; }, 1500);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: loginMethod === 'email' ? regPhone : phone,
          email: loginMethod === 'phone' ? regEmail : email
        }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Registration complete! Please login.', severity: 'success' });
        setTimeout(() => {
          window.location.href = '/studio/login';
        }, 1500);
      } else {
        const data = await res.json();
        if (res.status === 401) {
          setSnackbar({ open: true, message: 'Session expired. Please login again.', severity: 'error' });
          setTimeout(() => { window.location.href = '/studio/login'; }, 1500);
        } else {
          setSnackbar({ open: true, message: data.message || 'Failed to complete registration', severity: 'error' });
        }
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to complete registration', severity: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 340, mx: 'auto', mt: 4, background: '#fff', borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>StudioFlyer Login / Register</Typography>
      <ToggleButtonGroup
        value={loginMethod}
        exclusive
        onChange={(_, v) => v && setLoginMethod(v)}
        sx={{ mb: 2, width: '100%' }}
      >
        <ToggleButton value="email" sx={{ flex: 1 }}>Email</ToggleButton>
        <ToggleButton value="phone" sx={{ flex: 1 }}>Phone</ToggleButton>
      </ToggleButtonGroup>
      {!showOtp ? (
        <>
          {loginMethod === 'email' ? (
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth sx={{ mb: 2 }} />
          ) : (
            <TextField label="Phone" value={phone} onChange={e => setPhone(e.target.value)} fullWidth sx={{ mb: 2 }} />
          )}
          <Button variant="contained" onClick={handleSendOtp} fullWidth disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : 'Send OTP'}</Button>
        </>
      ) : isNewUser ? (
        <>
          <Typography sx={{ mb: 2 }}>Complete your registration</Typography>
          <TextField label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth sx={{ mb: 2 }} />
          {loginMethod === 'email' && (
            <TextField label="Phone (optional)" value={regPhone} onChange={e => setRegPhone(e.target.value)} fullWidth sx={{ mb: 2 }} />
          )}
          {loginMethod === 'phone' && (
            <TextField label="Email (required)" value={regEmail} onChange={e => setRegEmail(e.target.value)} fullWidth sx={{ mb: 2 }} />
          )}
          <Button variant="contained" onClick={handleRegister} fullWidth disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : 'Register'}</Button>
        </>
      ) : (
        <>
          <Typography sx={{ mb: 2 }}>Enter the 6-digit OTP sent to your {loginMethod === 'email' ? 'email' : 'phone'}</Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
            {otp.map((digit, idx) => (
              <TextField
                key={idx}
                inputRef={el => setInputRef(el, idx)}
                value={digit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(idx, e)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(idx, e)}
                inputProps={{ maxLength: 1, style: { textAlign: 'center', width: 32 } }}
                error={isOtpInvalid}
              />
            ))}
          </Box>
          <Button variant="contained" onClick={handleVerifyOtp} fullWidth disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : 'Verify OTP'}</Button>
        </>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity as any} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StudioFlyerLogin; 