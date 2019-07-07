const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');


const extendedJoi = BaseJoi.extend(Extension);

extendedJoi.p_date = extendedJoi.date().format('YYYY-MM-DD').raw();

export default extendedJoi;
