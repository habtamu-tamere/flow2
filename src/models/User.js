const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['brand', 'influencer'], required: true },
  tiktokUsername: { type: String }, // Optional for influencers
  avatar: { type: String, default: 'https://via.placeholder.com/150' },
  niche: { type: String }, // For influencers
  followers: { type: Number }, // For influencers
  engagementRate: { type: Number }, // For influencers
  ratePerPost: { type: Number }, // For influencers
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);