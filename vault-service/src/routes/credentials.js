const express = require('express');
const router = express.Router();
const credentialsController = require('../controllers/credentialsController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/credentials
// @desc    Get all user credentials
router.get('/', credentialsController.getCredentials);

// @route   POST /api/credentials
// @desc    Add new credential
router.post('/', credentialsController.addCredential);

// @route   PUT /api/credentials/:id
// @desc    Update credential
router.put('/:id', credentialsController.updateCredential);

// @route   DELETE /api/credentials/:id
// @desc    Delete credential
router.delete('/:id', credentialsController.deleteCredential);

module.exports = router;
