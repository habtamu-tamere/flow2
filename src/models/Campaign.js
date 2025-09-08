const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  budget: { type: String, required: true },
  performanceModel: { type: String, required: true },
  deadline: { type: Date, required: true },
  niches: [{ type: String }],
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tiktokUsername: { type: String, required: true }, // Advertiser's TikTok username
});

module.exports = mongoose.model('Campaign', campaignSchema);