const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Post = require('../../models/Post');

// POST a new post, PRIVATE
router.post('/', [auth, [
  check('content', 'Content is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('-password');
    const content = req.body.content;
    const newPost = await new Post({
      user,
      content
    })

    await newPost.save()
    res.status(201).json({msg:'Saved new post', newPost});
  } catch (error) {
    res.status(500).send(error)
  }  
});

// GET a specific posts, PUBLIC
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post)
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// GET all posts, PUBLIC
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json(posts)
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// DELETE all posts, PRIVATE
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).send('User not authorized to delete this post')
    }
    post.remove();
    res.status(200).json({ msg: 'Post deleted' })
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// PUT (edit), add a like, PRIVATE(user signed in)
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    
    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.status(200).json(post.likes);
  } catch (error) {
    res.status(500).send(error);
  }
});

// PUT (edit), remove a like, PRIVATE(user signed in)
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    // Check if post already liked
    const post = await Post.findById(req.params.id);
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }
    
    // Remove post like
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.status(200).json({msg:'Post unliked', likes: post.likes});
  } catch (error) {
    res.status(500).send(error);
  }
});

// TODO
// 1. Add post/comment path
// 2. Remove post/comment path

module.exports = router; 