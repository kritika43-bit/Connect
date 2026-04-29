const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
// Note: S3/Multer setup is typically added here for imageUrl uploads.

const router = express.Router();
const prisma = new PrismaClient();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const { getSignedImageUrl } = require('../utils/upload');

// Get posts chronologically (no algorithm)
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { include: { profile: true } },
        comments: { include: { author: { include: { profile: true } } } }
      }
    });

    // Generate signed URLs for post authors and comment authors
    const postsWithSignedUrls = await Promise.all(posts.map(async (post) => {
      if (post.author.profile && post.author.profile.avatarUrl) {
        post.author.profile.avatarUrl = await getSignedImageUrl(post.author.profile.avatarUrl);
      }
      if (post.comments) {
        await Promise.all(post.comments.map(async (comment) => {
          if (comment.author.profile && comment.author.profile.avatarUrl) {
            comment.author.profile.avatarUrl = await getSignedImageUrl(comment.author.profile.avatarUrl);
          }
        }));
      }
      return post;
    }));

    res.json(postsWithSignedUrls);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    const post = await prisma.post.create({
      data: { content, imageUrl, authorId: req.user.userId }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a post
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.userId;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    let likes = post.likes || [];
    if (!Array.isArray(likes)) likes = [];

    const hasLiked = likes.includes(userId);
    if (hasLiked) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { likes }
    });

    res.json({ likes: updatedPost.likes, hasLiked: !hasLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment
router.post('/:id/comment', authenticate, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    
    if (!content) return res.status(400).json({ message: 'Comment content required' });

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.user.userId
      },
      include: {
        author: { include: { profile: true } }
      }
    });

    // Generate signed URL for comment author if needed
    if (comment.author.profile && comment.author.profile.avatarUrl) {
      comment.author.profile.avatarUrl = await getSignedImageUrl(comment.author.profile.avatarUrl);
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
