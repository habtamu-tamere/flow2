const express = require('express');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a campaign (Brand only)
router.post('/create', auth, async (req, res) => {
  if (req.user.role !== 'brand') return res.status(403).json({ error: 'Only brands can create campaigns' });

  const { title, description, industry, budget, performanceModel, deadline, niches } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const campaign = new Campaign({
      title,
      description,
      industry,
      budget,
      performanceModel,
      deadline,
      niches,
      creator: req.user.id,
      tiktokUsername: user.tiktokUsername,
    });
    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('creator', 'tiktokUsername');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all influencers
router.get('/influencers', async (req, res) => {
  try {
    const influencers = await User.find({ role: 'influencer' });
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Apply to a campaign (Influencer only)
router.post('/:id/apply', auth, async (req, res) => {
  if (req.user.role !== 'influencer') return res.status(403).json({ error: 'Only influencers can apply' });

  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (!campaign.applications.includes(req.user.id)) {
      campaign.applications.push(req.user.id);
      await campaign.save();
    }
    res.json({ message: 'Applied successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;