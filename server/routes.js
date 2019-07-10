import express from 'express';
import httpStatus from 'http-status';
import config from 'config/env';

import { userRoutes } from 'server/topics/user/user.route';
import { authRoutes } from 'server/topics/auth/auth.route';

import { Env } from 'server/helpers/helpers';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

const router = express.Router(); // eslint-disable-line new-cap

router.use((req, res, next) => {
  const env = process.env.NODE_ENV || config.env;
  if (Env.isTest) {
    next();
    return;
  }
  const headerEnv = req.get('env') || req.cookies.env;

  if (env !== headerEnv) {
    const error = [
      `Rejecting frontend request claiming to be on environment [${headerEnv}]`,
      `because the server is running on environment [${env}].`,
      `Request was a ${req.method} on "${req.originalUrl}"`,
    ].join(' ');
    res.status(httpStatus.NOT_ACCEPTABLE).json({ error });
    return;
  }
  next();
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

export default router;
