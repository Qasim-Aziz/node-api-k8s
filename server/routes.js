import express from 'express';
import httpStatus from 'http-status';
import config from 'config/env';

import { userRoutes } from 'server/topics/user/user.route';
import { authRoutes } from 'server/topics/auth/auth.route';

import { Env } from 'server/helpers/helpers';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

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
