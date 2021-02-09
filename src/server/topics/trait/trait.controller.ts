import { validation, Auth } from 'src/server/helpers';
import { TraitService } from 'src/server/topics/trait/trait.service';

export class TraitController {
  @validation({})
  @Auth.forLogged()
  static async getThesaurus(req, { transaction = null } = {}) {
    const traitNames = await TraitService.getThesaurus({ transaction });
    return { traitNames };
  }
}
