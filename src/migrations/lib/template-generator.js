/* eslint-disable */
// This file is taken from node-migrate project
const path = require('path');
const fs = require('fs');
const slug = require('slug');
const mkdirp = require('mkdirp');

function format(input) {
  return (`${input}`).padStart(2, '0');
}

module.exports = function templateGenerator(opts = {}, cb) {
  // Setup default options
  const name = opts.name;
  const templateFile = opts.templateFile || path.join(__dirname, 'template.js');
  const migrationsDirectory = opts.migrationsDirectory || 'migrations';
  const extension = '.ts';

  loadTemplate(templateFile, (err, template) => {
    if (err) {
      return cb(err);
    }

    // Ensure migrations directory exists
    return mkdirp(migrationsDirectory, (err) => {
      if (err) return cb(err);

      // Create date string
      const date = new Date();
      const formattedDate = date.getFullYear() + format(date.getMonth() + 1) + format(date.getDate()) + format(date.getHours()) + format(date.getMinutes()) + format(date.getSeconds());

      // Fix up file path
      const p = path.join(process.cwd(), migrationsDirectory, slug(formattedDate + (name ? `-${name}` : '')) + extension);

      // Write the template file
      return fs.writeFile(p, template, (err) => {
        if (err) return cb(err);
        return cb(null, p);
      });
    });
  });
};

const _templateCache = {};
function loadTemplate(tmpl, cb) {
  if (_templateCache[tmpl]) {
    return cb(null, _templateCache);
  }
  fs.readFile(tmpl, {
    encoding: 'utf8'
  }, (err, content) => {
    if (err) return cb(err);
    _templateCache[tmpl] = content;
    return cb(null, content);
  });
}
