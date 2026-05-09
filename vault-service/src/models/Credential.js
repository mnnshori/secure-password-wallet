const mongoose = require('mongoose');

const CredentialSchema = new mongoose.Schema({
  userId: { 
    type: String, // String representation of ObjectId from Auth Service
    required: true 
  }, 
  title: { 
    type: String, 
    required: true,
    trim: true
  }, 
  url: { 
    type: String,
    trim: true
  }, 
  username: { 
    type: String, 
    required: true,
    trim: true
  }, 
  encryptedPassword: { 
    type: String, 
    required: true 
  }, 
  iv: { 
    type: String, 
    required: true 
  }, 
  authTag: { 
    type: String, 
    required: true 
  }, 
  strengthScore: { 
    type: Number, 
    min: 0, 
    max: 4 
  }, 
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp before saving
CredentialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Credential', CredentialSchema);
