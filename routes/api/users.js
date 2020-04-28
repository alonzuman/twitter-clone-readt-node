const express = require('express');
const config = require('config');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// GET all users, PUBLIC
router.get('/', (req, res) => res.send('Users route'));

// POST to users (sign in), PUBLIC
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Email not valid').isEmail(),
  check('password', 'Password is required').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { name, email, password } = req.body;

  try {
    // See if user exists
    let user = await User.findOne({ email: req.body.email })    
    if (user) {
      return res.status(400).json({ errors: [{msg:'User already exists'}]});
    }
    
    // Create new user model instance
    user = new User({
      name, email, password
    })

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // res.status(201).json({ msg:'User registered' })
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