import express from 'express';

import userRoutes from 'src/server/topics/user/user.route';
import authRoutes from 'src/server/topics/auth/auth.route';
import messageRoutes from 'src/server/topics/message/message.route';
import commentRoutes from 'src/server/topics/comment/comment.route';
import tropheeRoutes from 'src/server/topics/trophee/trophee.route';
import initDataRoutes from 'src/server/topics/init-data/init-data.route';
import traitRoutes from 'src/server/topics/trait/trait.route';

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
router.use('/init-data', initDataRoutes);
router.use('/traits', traitRoutes);

export default router;
