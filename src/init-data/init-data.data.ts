import { EMOTION_CODE, PRIVACY_LEVEL } from 'src/server/constants';
import { moment } from 'src/server/helpers';

const usersEnum = Object.freeze({
  MIK: 'mik',
  YAL: 'yal',
  MEG: 'meg',
  TAT: 'tat',
  YAS: 'yas',
  HAK: 'hak',
});

export const password = 'azerty123';

export const initDataConf = Object.freeze({
  [usersEnum.MEG]: {},
  [usersEnum.TAT]: {},
  [usersEnum.YAS]: {},
  [usersEnum.MIK]: {
    messages: [
      {
        apiData: {
          content: 'Encore une journée où je me sens bien. J’ai vu plusieurs amis dans l’après-midi, je me suis plutôt '
            + 'senti bien, chose assez exceptionnel, je trouve que c’est un énorme bon en avant ! J’espère que demain ça '
            + 'va continuer, je vois d’autres personnes mais que je connais moins, ce qui me stresse un peu, '
            + 'mais je pense que ça ira bien, restons positifs !',
          emotionCode: EMOTION_CODE.APAISE,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['Anxiété', 'Mon combat', 'Astuce', 'Notre combat', 'Dépression', 'Amour', 'Fun', 'Malheur', 'Communauté'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 4 }).toISOString,
          lovedBy: [usersEnum.MEG, usersEnum.YAS, usersEnum.HAK],
          viewedBy: [usersEnum.MEG, usersEnum.YAS, usersEnum.HAK, usersEnum.TAT],
        },
      },
      {
        apiData: {
          content: 'Aujourd’hui j’ai revu des amis de lycées, c’était une super journée, sans angoisse !',
          emotionCode: EMOTION_CODE.CONTENT,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['Anxiété', 'Bonheur'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 3 }).toISOString,
          lovedBy: [usersEnum.MEG],
          viewedBy: [usersEnum.MEG, usersEnum.TAT],
        },
      },
      {
        apiData: {
          content: 'Personne ne comprend mon anxiété et mon combat quotidien. J\'ai eu une discussion diffile avec '
            + 'des amis, ils ne comprennent pas ce que je ressens.',
          emotionCode: EMOTION_CODE.DEPRIME,
          privacy: PRIVACY_LEVEL.PRIVATE,
          tags: ['Incompréhension', 'Dépression'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 1 }).toISOString,
        },
      },
      {
        apiData: {
          content: 'Journée sans difficulté, quelques moments d`anxiété qui sont vite passés heureusement.',
          emotionCode: EMOTION_CODE.LEGER,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['RAS', 'Anxiété'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 6 }).toISOString,
          lovedBy: [usersEnum.MEG, usersEnum.YAL],
          viewedBy: [usersEnum.MEG, usersEnum.TAT, usersEnum.YAL],
        },
      },
      {
        apiData: {
          content: 'J`aurais aimé demander à la communauté son avis sur cet aspect de ma vie. Que préférez-vous faire'
            + 'lorsque les choses ne vont pas dans le sens que vous voulez ? Personnellement je ne sais jamais comment'
            + 'm`y prendre et me fais toujours avoir. Et vous ?',
          emotionCode: EMOTION_CODE.LEGER,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['QuestionALaCommunauté', 'Conseils'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 8 }).toISOString,
          lovedBy: [usersEnum.YAL, usersEnum.HAK],
          viewedBy: [usersEnum.MEG, usersEnum.TAT, usersEnum.YAL, usersEnum.HAK],
        },
      },
      {
        apiData: {
          content: 'Bon ben il y a des jours qui ne valent pas le coup d`être vécus, comme aujourd`hui ! Grosse bagarre'
            + 'avec mon voisin sur le niveau de son chez lui à 3h du matin.',
          emotionCode: EMOTION_CODE.ENERVE,
          privacy: PRIVACY_LEVEL.PRIVATE,
          tags: [],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 10 }).toISOString,
        },
      },
      {
        apiData: {
          content: 'Lecture d`un excellent roman, que je conseille à la communauté, autour du dueil...',
          emotionCode: EMOTION_CODE.APAISE,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['Conseils', 'Lecture'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 1 }).toISOString,
          lovedBy: [usersEnum.MEG],
          viewedBy: [usersEnum.MEG],
        },
      },
      {
        apiData: {
          content: 'Aujourd`hui je dois reprendre la conduite depuis un accident de la route qui m`avait traumatisé'
            + ' il y a de ça 2 mois. Très inquiets à l`idée d`en faire un autre.',
          emotionCode: EMOTION_CODE.TRISTE,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['Phobie', 'Conduite'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 12 }).toISOString,
          lovedBy: [usersEnum.HAK],
          viewedBy: [usersEnum.HAK, usersEnum.TAT],
        },
      },
      {
        apiData: {
          content: 'Ce matin, j`ai légérement glissé en voulant sauté plusieurs escaliers à la fois'
            + ', je me suis rattrapé à la dernière minute, j`avais l`impression que tous les gens autour de moi'
            + 'me scrutaient bizaremment.',
          emotionCode: EMOTION_CODE.SURPRIS,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['SuisJeBizarre'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 15 }).toISOString,
          lovedBy: [usersEnum.YAL],
          viewedBy: [usersEnum.YAL, usersEnum.TAT],
        },
      },
      {
        apiData: {
          content: 'Grosse frayeur en me levant ce matin. Je suis allé toquer dans la chambre de ma grande soeur, elle'
            + ' ne répondait pas. J`ai donc ouvert la porte, elle semblait endormie, j`ai essayé de la secouer pour la'
            + ' réveiller, mais rien à faire. Au bout de quelques tentatives, elle a enfin réagi, et j`ai été soulagé.'
            + ' Encore des inquiétudes infondées de mon côté.',
          emotionCode: EMOTION_CODE.LASSE,
          privacy: PRIVACY_LEVEL.PRIVATE,
          tags: ['Angoisse'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 19 }).toISOString,
        },
      },
      {
        apiData: {
          content: 'Je naviguais sur le web aujourd`hui, comme tous les autres jours d`ailleurs, j`ai vraiment l`'
            + 'impression de perdre mon temps tous les jours. Comment faites vous de votre côté ?.',
          emotionCode: EMOTION_CODE.TRISTE,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['Conseils'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 21 }).toISOString,
          lovedBy: [usersEnum.HAK],
          viewedBy: [usersEnum.HAK, usersEnum.TAT],
        },
      },
    ],
  },
  [usersEnum.YAL]: {
    messages: [
      {
        apiData: {
          content: 'Nouveau dans la communauté, je vais tenter de vous raconter régulièrement mon combat contre'
            + ' mon anorexie qui dure depuis 2 ans et contre laquelle je ne trouve pas encore de solution.',
          emotionCode: EMOTION_CODE.LEGER,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['Anorexie', 'Nouveau'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 3 }).toISOString,
          lovedBy: [usersEnum.MIK],
          viewedBy: [usersEnum.MIK, usersEnum.TAT],
        },
      },
      {
        apiData: {
          content: 'J`ai absolument rien mangé aujourd`hui, et le peu que j`ai mangé je l`ai directement'
            + ' vomi, encore une fois... Ma mère me conseille de manger plus doucement mais je vois bien que ce'
            + ' genre de remarques montre qu`elle n`a rien compris au problème.',
          emotionCode: EMOTION_CODE.ENERVE,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['Anorexie'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 1 }).toISOString,
          lovedBy: [usersEnum.MIK],
          viewedBy: [usersEnum.MIK, usersEnum.TAT],
        },
      },
    ],
  },
  [usersEnum.HAK]: {
    messages: [
      {
        apiData: {
          content: 'Encore un jour où je me lève sans aucun objectif. Pourriez vous me conseiller sur quelle a'
            + ' été vos approches pour combattre la dépression ?',
          emotionCode: EMOTION_CODE.DEPRIME,
          privacy: PRIVACY_LEVEL.PUBLIC,
          tags: ['Dépression', 'Nouveau'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 2 }).toISOString(),
          lovedBy: [usersEnum.HAK],
          viewedBy: [usersEnum.HAK, usersEnum.MIK],
        },
      },
    ],
  },
});
