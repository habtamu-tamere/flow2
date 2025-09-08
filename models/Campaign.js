const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  budget: { type: String, required: true },
  performanceModel: { type: String, required: true },
  niches: [{ type: String }],
  basePay: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deadline: { type: Date, required: true },
  advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tiktokUsername: { type: String, required: true }, // Added to store advertiser's TikTok username
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Campaign', campaignSchema);