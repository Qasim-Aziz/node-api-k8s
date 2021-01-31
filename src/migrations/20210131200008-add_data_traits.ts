/* eslint-disable */
import * as lib from './lib/lib';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const traits = [
      ['addiction', 2],
      ['troublebipolaire', 1],
      ['manie', 3],
      ['dépression', 1],
      ['agoraphobie', 2],
      ['troublepanique', 1],
      ['phobiesociale', 1],
      ['claustrophobie', 3],
      ['acrophobie', 3],
      ['aérophobie', 3],
      ['zoophobie', 3],
      ['autrephobie', 3],
      ['anxiétégénéralisée', 1],
      ['troubleanxieux', 1],
      ['toc', 1],
      ['stressposttraumatique', 3],
      ['troubledissociatif', 4],
      ['hypocondrie', 1],
      ['anorexie', 2],
      ['boulimie', 2],
      ['hyperphagie', 3],
      ['insomnie', 3],
      ['hypersomnie', 3],
      ['postpartum', 2],
      ['deuil', 1],
      ['séparation', 1],
      ['burnout', 1],
      ['précarité', 2],
      ['harcélement', 1],
      ['maladie', 1],
      ['echec', 2],
      ['souffranceautravail', 1],
    ];

    const sql = `
INSERT INTO trait (created_at, updated_at, name, position)
 VALUES ${traits.map(([name, position]) => `(now(), now(), '${name}', ${position})`).join(',')};
`;
    return lib.wrapCommands([sql]);
  },
  /**
   * Add altering commands here.
   *
   * Example:
   * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
   */

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
