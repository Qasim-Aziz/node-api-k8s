import express from 'express';

import userRoutes from 'src/server/topics/user/user.route';
import authRoutes from 'src/server/topics/auth/auth.route';

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

export default router;
