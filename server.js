const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Google OAuth env check:', {
  clientIdLoaded: Boolean(process.env.GOOGLE_CLIENT_ID),
  clientIdPreview: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.slice(0, 12)}...` : 'missing',
  clientSecretLoaded: Boolean(process.env.GOOGLE_CLIENT_SECRET),
  clientSecretPreview: process.env.GOOGLE_CLIENT_SECRET ? `${process.env.GOOGLE_CLIENT_SECRET.slice(0, 8)}...` : 'missing',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'missing'
});

const pageRoutes = require('./backend/routes/pageRoutes');
const authRoutes = require('./backend/routes/authRoutes');
const dashboardRoutes = require('./backend/routes/dashboardRoutes');
const requestRoutes = require('./backend/routes/requestRoutes');
const driverRoutes = require('./backend/routes/driverRoutes');
const adminRoutes = require('./backend/routes/adminRoutes');
const passportConfig = require('./backend/services/passportConfig');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'emergency_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passportConfig(passport);

app.use((req, res, next) => {
  req.app.set('io', io);
  next();
});

app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', requestRoutes);
app.use('/', driverRoutes);
app.use('/', adminRoutes);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0' , () => console.log(`Server running on http://localhost:${PORT}`));

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a different value.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
