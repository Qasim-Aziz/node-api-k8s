import express from 'express';

import userRoutes from 'src/server/topics/user/user.route';
import authRoutes from 'src/server/topics/auth/auth.route';
import messageRoutes from 'src/server/topics/message/message.route';
import commentRoutes from 'src/server/topics/comment/comment.route';

import { Env } from 'src/server/helpers';

const router = express.Router(); // eslint-disable-line new-cap

router.use((req, res, next) => {
  if (Env.isTest) {
    next();
    return;
  }
  next();
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/comments', commentRoutes);
router.use('/trophees', tropheeRoutes);

export default router;
