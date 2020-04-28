const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// GET all users, PUBLIC
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user)
  } catch (error) {
    res.status(500).send('Server error')
  }
});

// POST to api/auth, PUBLIC
router.post('/', [
  check('email', 'Email not valid').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body;

  try {
    // See if user exists
    let user = await User.findOne({ email: req.body.email })    
    
    // If NOT a user, send an error
    if (!user) {
      return res.status(400).json({ errors: [{msg:'Invalid email'}]});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{msg:'Invalid password'}]});
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Sending the user a token back
    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(payload, config.get('JWT_SECRET'), { expiresIn: 3600000000 }, (error, token) => {
      if (error) throw error;
      res.status(201).json({ token });
    });
  } catch (error) {
    res.status(500).json({msg: 'Failure'})
  }
})

module.exports = router;