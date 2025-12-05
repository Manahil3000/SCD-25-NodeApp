const mongoose = require('mongoose');

const VaultSchema = new mongoose.Schema({
  name: String,
  id: String,
  date: Date,
  data: String,
}, { timestamps: true });

module.exports = mongoose.model('Vault', VaultSchema);
