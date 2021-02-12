import Router from 'src/server/abstracts/router';
import { TraitController } from 'src/server/topics/trait/trait.controller';

const traitRoutes = new Router();

traitRoutes
  .addRoute('/thesaurus', {
    get: { handler: TraitController.getThesaurus },
  });

export default traitRoutes.getRouter();
