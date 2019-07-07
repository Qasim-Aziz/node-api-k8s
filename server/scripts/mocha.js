// eslint-disable-next-line import/no-extraneous-dependencies
import Mocha from 'mocha';
import glob from 'server/helpers/glob';

// Instantiate a Mocha instance.
const mocha = new Mocha({ bail: true });

const testGlob = process.env.FOLDER;

glob(testGlob)
  .then((files) => {
    files.forEach((file) => {
      mocha.addFile(file);
    });
    // Run the tests.
    mocha.run((failures) => {
      process.on('exit', () => {
        // eslint-disable-next-line no-process-exit
        process.exit(failures);
      });
    });
  });

