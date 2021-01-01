import convict from 'convict';
import { ipaddress } from 'convict-format-with-validator';
import defaultConfig from 'src/config/config';

convict.addFormat(ipaddress);
const config = convict(defaultConfig);

export default config;
