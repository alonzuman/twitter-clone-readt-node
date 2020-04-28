const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// GET all profiles, PUBLIC
router.get('/', async (req, res) => {
  try {
    profiles = await Profile.find().populate('user', ['username', 'avatar']);
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).send('Server error')
  }
});

// GET a specific users profile, PUBLIC
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// GET current user profile, PUBLIC
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'No such profile exists' });
    }

    res.status(200).json(profile)
  } catch (error) {
    res.status(500).send('Server error')
  }
});

// POST a new user profile, PRIVATE
router.post('/', [auth, [
  check('username', 'Username is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()});
  }

  const { username, bio, avatar } = req.body;
  // const user = await User.findOne({ id: req.body.id });

  const profileFields = {};
  profileFields.user = req.user.id // NOTICE TO REFER TO THE REQ.USER AND NOT BODY
  if (username) profileFields.username = username;
  if (bio) profileFields.bio = bio;
  if (avatar) profileFields.avatar = avatar; 

  try {
    
    let profile = await Profile.findOne({ user: req.user.id })
    
    // If found profile then update it
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
  
      return res.json(profile);
    }

    profile = new Profile(profileFields);
    await profile.save()

    return res.status(201).json(profileFields);
  } catch (error) {
    res.status(500).json({ msg:'Server error', error })
  }
});

// DELETE a user & its profile, PRIVATE
router.delete('/', auth, async (req, res) => {
  try {
    // Remove the users posts
    // Remove the users profile
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.status(200).send('User deleted')
  } catch (error) {
    res.status(500).send('Server error');
  }
})

module.exports = router;