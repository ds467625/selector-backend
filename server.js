require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ── Portal Config Schema ──
const configSchema = new mongoose.Schema({ active: { type: Boolean, default: true } });
const PortalConfig = mongoose.model('PortalConfig', configSchema);

// ── Event Schema (tracks every click + bookings) ──
const eventSchema = new mongoose.Schema({
  type:      { type: String, required: true }, // e.g. 'click', 'booking', 'not_interested'
  action:    { type: String, required: true }, // e.g. 'startBtn', 'generateBtn'
  data:      { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});
const Event = mongoose.model('Event', eventSchema);

// ── GET /api/config  (returns active flag) ──
app.get('/api/config', async (req, res) => {
  try {
    let config = await PortalConfig.findOne();
    if (!config) config = await PortalConfig.create({ active: true });
    res.json({ active: config.active });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/config ──
app.patch('/api/config', async (req, res) => {
  try {
    let config = await PortalConfig.findOne();
    if (!config) config = await PortalConfig.create({ active: true });
    config.active = req.body.active;
    await config.save();
    res.json({ active: config.active });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/event  (track any click or booking) ──
app.post('/api/event', async (req, res) => {
  try {
    const { type, action, data } = req.body;
    if (!type || !action) return res.status(400).json({ error: 'type and action required' });
    const ev = await Event.create({ type, action, data: data || {} });
    res.status(201).json({ success: true, id: ev._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/booking  (save plan + emit event) ──
app.post('/api/booking', async (req, res) => {
  try {
    const { date, timeFrom, timeTill, activities, note, notInterested } = req.body;
    if (!date || !timeFrom || !timeTill || !activities?.length)
      return res.status(400).json({ error: 'Missing required fields' });
    const ev = await Event.create({
      type: notInterested ? 'not_interested' : 'booking',
      action: notInterested ? 'notInterestedBtn2' : 'generateBtn',
      data: { date, timeFrom, timeTill, activities, note, notInterested: !!notInterested }
    });
    res.status(201).json({ success: true, id: ev._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/events  (view all tracked events) ──
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Connect & Start ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected');
    app.listen(process.env.PORT || 3000, () =>
      console.log(`🚀 Server running at http://localhost:${process.env.PORT || 3000}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
