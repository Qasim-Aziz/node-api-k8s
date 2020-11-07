/* eslint-disable */
import Sequelize from "sequelize";

const lib = require('./lib/lib');

module.exports = {
  up: async () => {
    await lib.createTable('comment', {
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      postedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'posted_at',
      },
      likesCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'likes_count',
      },
      commentsCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'comments_count',
      },
      userId: {
        field: 'user_id',
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      parentId: {
        field: 'parent_id',
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    })
    await lib.wrapCommands([
      lib.createFkV3('comment', 'user', lib.FOREIGN_KEY_ACTIONS.CASCADE ),
      lib.createFkV3('comment', 'comment', lib.FOREIGN_KEY_ACTIONS.CASCADE, { fieldFrom: 'parent_id' }),
      lib.addColumn('love', 'comment_id', Sequelize.INTEGER),
      lib.createFkV3('love', 'comment', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
    ]);
  },
  down: async () => {

  }
};
