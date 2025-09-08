const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Campaign = require('../models/Campaign');
const User = require('../models/User');

router.post('/create', protect, async (req, res) => {
  const { title, description, industry, budget, performanceModel, niches, basePay, commission, deadline } = req.body;

  if (req.user.role !== 'brand') {
    return res.status(403).json({ message: 'Only brands can create campaigns' });
  }

  try {
    const user = await User.findById(req.user.userId);
    const campaign = new Campaign({
      title,
      description,
      industry,
      budget,
      performanceModel,
      niches,
      basePay,
      commission,
      deadline,
      advertiser: req.user.userId,
      tiktokUsername: user.tiktokUsername, // Include advertiser's TikTok username
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { industry, budget, performance } = req.query;
    const query = {};

    if (industry) query.industry = industry;
    if (budget) query.budget = budget;
    if (performance) query.performanceModel = performance;

    const campaigns = await Campaign.find(query).populate('advertiser', 'name tiktokUsername');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/apply', protect, async (req, res) => {
  if (req.user.role !== 'influencer') {
    return res.status(403).json({ message: 'Only influencers can apply to campaigns' });
  }

  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.applications.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already applied to this campaign' });
    }

    campaign.applications.push(req.user.userId);
    await campaign.save();
    res.json({ message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;