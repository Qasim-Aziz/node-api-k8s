import { Tag, Trait } from 'src/orm';
import { Op, sequelize } from 'src/orm/database';

export class TraitService {
  static async getThesaurus({ transaction = null } = {}) {
    return Trait.findAll({
      where: { position: { [Op.not]: null } },
      order: ['position', 'name'],
      raw: true,
      nest: true,
      transaction,
    });
  }

  static async getTraits({ transaction = null, messageId = null, userId = null } = {}) {
    const fkId = messageId ? { messageId } : { userId };
    return (await Tag.unscoped().findAll({
      attributes: [],
      where: fkId,
      include: [
        { model: Trait.unscoped(), attributes: ['name'], required: true },
      ],
      transaction,
    })).map((tag: any) => tag.trait.name);
  }

  static async createTraitsIfRequired(traitNames, { transaction = null } = {}) {
    const traitsAlreadyCreated = await Trait.unscoped().findAll({
      attributes: ['id', 'name'],
      where: { name: traitNames },
      transaction,
      raw: true,
      nest: true,
    });
    console.log('traitsAlreadyCreated in createTraitsIfRequired')
    console.log(traitsAlreadyCreated)
    const traitsAlreadyCreatedNames = traitsAlreadyCreated.map((t) => t.name);
    console.log('traitsAlreadyCreatedNames')
    console.log(traitsAlreadyCreatedNames)
    const traitsNotExisting = traitNames.filter((trait) => !(traitsAlreadyCreatedNames.includes(trait)));
    console.log('traitsNotExisting')
    console.log(traitsNotExisting)
    return Trait.bulkCreate(traitsNotExisting.map((name) => ({ name })), { returning: true, transaction });
  }

  static async unTag(traitNames, { transaction = null, messageId = null, userId = null } = {}) {
    const fkId = messageId ? { messageId } : { userId };
    const currentTagsToDeleteIds = (await Tag.unscoped().findAll({
      where: fkId,
      attributes: ['id'],
      include: [{
        model: Trait.unscoped(),
        attributes: ['id', 'name'],
        required: true,
        where: { name: { [Op.notIn]: traitNames } },
      }],
      transaction,
      raw: true,
      nest: true,
    })).map((t) => t.id);
    if (currentTagsToDeleteIds.length) await Tag.destroy({ where: { id: currentTagsToDeleteIds }, transaction });
  }

  static async setNewTags(traitNames, { transaction = null, messageId = null, userId = null } = {}) {
    const fkId = messageId ? { messageId } : { userId };
    const traitsNotLinked = (await Trait.unscoped().findAll({
      attributes: ['id', 'name'],
      include: [{
        model: Tag.unscoped(),
        attributes: ['id'],
        required: false,
        where: fkId,
      }],
      where: {
        [Op.and]: [
          { name: traitNames },
          { '$"tags"."id"$': null },
        ],
      },
      transaction,
      raw: true,
    })).map((trait) => trait.id);
    const tagsToCreate = traitsNotLinked.map((traitId) => ({ traitId, ...fkId }));
    return Tag.bulkCreate(tagsToCreate, { transaction });
  }

  static async createOrUpdateTagsAndTraits(traitNames, { transaction = null, messageId = null, userId = null } = {}) {
    console.log('traitNames in createOrUpdateTagsAndTraits')
    console.log(traitNames)
    if (traitNames === undefined) return null;
    await sequelize.query('LOCK TABLE trait IN ACCESS EXCLUSIVE MODE;', { transaction });
    await TraitService.createTraitsIfRequired(traitNames, { transaction });
    await TraitService.unTag(traitNames, { transaction, messageId, userId });
    return TraitService.setNewTags(traitNames, { transaction, messageId, userId });
  }
}
