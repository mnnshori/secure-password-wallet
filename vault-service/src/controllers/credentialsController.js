const Credential = require('../models/Credential');
const { encryptPassword, decryptPassword } = require('../utils/cryptoUtil');
const zxcvbn = require('zxcvbn');

// @route   GET /api/credentials
// @desc    Get all user credentials
exports.getCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    // Decrypt passwords before sending to frontend
    const decryptedCredentials = credentials.map(cred => {
      const plainPassword = decryptPassword(cred.encryptedPassword, cred.iv, cred.authTag);
      return {
        id: cred._id,
        title: cred.title,
        url: cred.url,
        username: cred.username,
        password: plainPassword,
        strengthScore: cred.strengthScore,
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt
      };
    });

    res.json(decryptedCredentials);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   POST /api/credentials
// @desc    Add new credential
exports.addCredential = async (req, res) => {
  try {
    const { title, url, username, password } = req.body;

    // Calculate strength score
    const strength = zxcvbn(password);
    const strengthScore = strength.score;

    // Encrypt password
    const { encryptedPassword, iv, authTag } = encryptPassword(password);

    const newCredential = new Credential({
      userId: req.user.id,
      title,
      url,
      username,
      encryptedPassword,
      iv,
      authTag,
      strengthScore
    });

    const credential = await newCredential.save();

    res.json({
      id: credential._id,
      title: credential.title,
      url: credential.url,
      username: credential.username,
      password: password, // Send back plain password for immediate UI use
      strengthScore: credential.strengthScore
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   PUT /api/credentials/:id
// @desc    Update credential
exports.updateCredential = async (req, res) => {
  const { title, url, username, password } = req.body;

  try {
    let credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    // Make sure user owns credential
    if (credential.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedFields = { title, url, username };

    if (password) {
      const strength = zxcvbn(password);
      updatedFields.strengthScore = strength.score;
      
      const { encryptedPassword, iv, authTag } = encryptPassword(password);
      updatedFields.encryptedPassword = encryptedPassword;
      updatedFields.iv = iv;
      updatedFields.authTag = authTag;
    }

    credential = await Credential.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );
    
    // We send back updated credential without password, frontend already knows password it sent
    res.json({
      id: credential._id,
      title: credential.title,
      url: credential.url,
      username: credential.username,
      strengthScore: credential.strengthScore
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   DELETE /api/credentials/:id
// @desc    Delete credential
exports.deleteCredential = async (req, res) => {
  try {
    let credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    // Make sure user owns credential
    if (credential.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // In mongoose 7/8 findByIdAndRemove is deprecated in favor of findByIdAndDelete
    await Credential.findByIdAndDelete(req.params.id);

    res.json({ message: 'Credential removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
