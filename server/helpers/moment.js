import moment from 'moment-timezone';
import 'moment/locale/fr';

moment.locale('fr');
moment.tz.setDefault('Europe/Paris');
export default moment;
