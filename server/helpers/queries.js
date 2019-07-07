import { sequelize } from 'orm/index';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

export const duringNowWhere = {
  startDate: { $lte: sequelize.literal('now()') },
  $or: [
    { endDate: { $gte: sequelize.literal('now()') } },
    { endDate: null },
  ],
};

export const duringNowOrAfterWhere = {
  $or: [
    { endDate: { $gte: sequelize.literal('now()') } },
    { endDate: null },
  ],
};
