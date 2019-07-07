import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import chaiLint from 'chai-lint';
import chaiSubset from 'chai-subset';
import chaiAsPromised from 'chai-as-promised';
import chaiDatetime from 'chai-datetime';

chai.config.includeStack = true;

chai.use(dirtyChai);
chai.use(chaiDatetime);
chai.use(chaiLint);
chai.use(chaiSubset);
chai.use(chaiAsPromised);

export { expect as default };


// (__filename.slice(__dirname.length + 1)
