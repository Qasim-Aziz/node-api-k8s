#!/usr/bin/env node
require('tsconfig-paths/register');
require('ts-node/register');

const path = require('path');
const { argv } = require('yargs');

const scriptFile = argv._[0].endsWith('.ts') ? argv._[0] : `${argv._[0]}.ts`;
const fullPathScriptFile = path.join(__dirname, 'src/scripts/', scriptFile);

const runScript = require(fullPathScriptFile).default;
(new runScript).exec();
