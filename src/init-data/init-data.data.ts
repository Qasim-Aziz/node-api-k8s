import { EmotionCode, PrivacyLevel } from 'src/server/constants';
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
  [usersEnum.MEG]: {
    description: 'Burn-out suite à des harcélements au travail, je vous raconte mon quotidien.',
  },
  [usersEnum.TAT]: {
    description: 'Boulimique après avoir été anorexique.',
  },
  [usersEnum.YAS]: {
    description: 'Grosse dépression depuis 2019 suite à un problème au travail.',
  },
  [usersEnum.MIK]: {
    description: 'Anxieux depuis 10 ans, cadre dans la grande distribution, j’évolue au gré des hauts et des bas de ma maladie.',
    messages: [
      {
        apiData: {
          content: 'Encore une journée où je me sens bien. J’ai vu plusieurs amis dans l’après-midi, je me suis plutôt '
            + 'senti bien, chose assez exceptionnel, je trouve que c’est un énorme bon en avant ! J’espère que demain ça '
            + 'va continuer, je vois d’autres personnes mais que je connais moins, ce qui me stresse un peu, '
            + 'mais je pense que ça ira bien, restons positifs !',
          emotionCode: EmotionCode.APAISE,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['Anxiété', 'Mon combat', 'Astuce', 'Notre combat', 'Dépression', 'Amour', 'Fun', 'Malheur', 'Communauté'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 4 }).toISOString,
          lovedBy: [usersEnum.MEG, usersEnum.YAS, usersEnum.HAK],
          viewedBy: [usersEnum.MEG, usersEnum.YAS, usersEnum.HAK, usersEnum.TAT],
          comments: [{
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vel porta mauris, quis faucibus dolor. '
              + 'Mauris efficitur elit mollis porta porttitor. Cras elementum, tortor at gravida mattis, nisl mi feugiat.',
            commentedBy: usersEnum.YAS,
            lovedBy: [usersEnum.MEG, usersEnum.HAK],
          }],
        },
      },
      {
        apiData: {
          content: 'Aujourd’hui j’ai revu des amis de lycées, c’était une super journée, sans angoisse !',
          emotionCode: EmotionCode.CONTENT,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['Anxiété', 'Bonheur'],
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
          emotionCode: EmotionCode.DEPRIME,
          privacy: PrivacyLevel.PRIVATE,
          traitNames: ['Incompréhension', 'Dépression'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 1 }).toISOString,
        },
      },
      {
        apiData: {
          content: 'Journée sans difficulté, quelques moments d`anxiété qui sont vite passés heureusement.',
          emotionCode: EmotionCode.LEGER,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['RAS', 'Anxiété'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 6 }).toISOString,
          lovedBy: [usersEnum.MEG, usersEnum.YAL],
          viewedBy: [usersEnum.MEG, usersEnum.TAT, usersEnum.YAL],
          comments: [{
            content: 'Aenean pulvinar nisi ac libero volutpat, non auctor lectus pharetra. Mauris ullamcorper tortor ac ante posuere cursus.'
              + ' Maecenas elementum auctor tristique.',
            commentedBy: usersEnum.YAL,
            lovedBy: [usersEnum.MEG],
          }, {
            content: 'Sed dui arcu, vulputate vehicula enim et, auctor faucibus arcu. Nunc volutpat eget turpis id pretium.'
              + ' Cras tincidunt turpis vel laoreet mattis.',
            commentedBy: usersEnum.MEG,
            lovedBy: [usersEnum.TAT, usersEnum.YAL, usersEnum.HAK],
          }],
        },
      },
      {
        apiData: {
          content: 'J`aurais aimé demander à la communauté son avis sur cet aspect de ma vie. Que préférez-vous faire'
            + 'lorsque les choses ne vont pas dans le sens que vous voulez ? Personnellement je ne sais jamais comment'
            + 'm`y prendre et me fais toujours avoir. Et vous ?',
          emotionCode: EmotionCode.LEGER,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['QuestionALaCommunauté', 'Conseils'],
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
          emotionCode: EmotionCode.ENERVE,
          privacy: PrivacyLevel.PRIVATE,
          traitNames: [],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 10 }).toISOString,
        },
      },
      {
        apiData: {
          content: 'Lecture d`un excellent roman, que je conseille à la communauté, autour du dueil...',
          emotionCode: EmotionCode.APAISE,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['Conseils', 'Lecture'],
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
          emotionCode: EmotionCode.TRISTE,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['Phobie', 'Conduite'],
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
          emotionCode: EmotionCode.SURPRIS,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['SuisJeBizarre'],
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
          emotionCode: EmotionCode.LASSE,
          privacy: PrivacyLevel.PRIVATE,
          traitNames: ['Angoisse'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 19 }).toISOString,
        },
      },
      {
        apiData: {
          content: 'Je naviguais sur le web aujourd`hui, comme tous les autres jours d`ailleurs, j`ai vraiment l`'
            + 'impression de perdre mon temps tous les jours. Comment faites vous de votre côté ?.',
          emotionCode: EmotionCode.TRISTE,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['Conseils'],
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
    description: 'Anorexique depuis 2018, je me bats contre mes travers.',
    messages: [
      {
        apiData: {
          content: 'Nouveau dans la communauté, je vais tenter de vous raconter régulièrement mon combat contre'
            + ' mon anorexie qui dure depuis 2 ans et contre laquelle je ne trouve pas encore de solution.',
          emotionCode: EmotionCode.LEGER,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['Anorexie', 'Nouveau'],
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
          emotionCode: EmotionCode.ENERVE,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['Anorexie'],
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
    description: 'Dépression depuis plusieurs années.',
    messages: [
      {
        apiData: {
          content: 'Encore un jour où je me lève sans aucun objectif. Pourriez vous me conseiller sur quelle a'
            + ' été vos approches pour combattre la dépression ?',
          emotionCode: EmotionCode.DEPRIME,
          privacy: PrivacyLevel.PUBLIC,
          traitNames: ['Dépression', 'Nouveau'],
        },
        otherData: {
          publishedAt: moment().subtract({ day: 2 }).toISOString(),
          lovedBy: [usersEnum.HAK],
          viewedBy: [usersEnum.HAK, usersEnum.MIK],
          comments: [{
            content: 'Sed pellentesque pulvinar diam non mattis. Suspendisse id sem ipsum. Vivamus at nunc id risus feugiat pharetra. '
              + 'Fusce luctus et urna egestas efficitur. Nulla facilisi. Nullam sodales est non ex ornare laoreet nec quis mauris. ',
            commentedBy: usersEnum.TAT,
            lovedBy: [usersEnum.MEG, usersEnum.YAL],
          }, {
            content: 'Quisque quis mauris non justo ullamcorper ultricies sed ac nisi. Ut cursus, elit id aliquam rutrum, '
              + 'eros purus iaculis nisi, eu lacinia nibh ligula in ante. Aliquam eget felis pulvinar, pharetra dolor sed, fermentum nunc.',
            commentedBy: usersEnum.MEG,
            lovedBy: [usersEnum.TAT, usersEnum.YAL],
          }],
        },
      },
    ],
  },
});
