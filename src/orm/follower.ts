import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { User } from 'src/orm/user';

export class Follower extends OrmModel {
  public follower!: User;

  public followed!: User;
}

Follower.init({}, { sequelize, tableName: 'follower', modelName: 'follower' });

makeOneToMany(User, Follower, 'followerId', false, 'followed');
makeOneToMany(User, Follower, 'followedId', false, 'followers');
