import 'dotenv/config';

import { InstallGlobalCommands } from './utils.js';

const PLAY = {
  name: 'play',
  description: 'Play audio from youtube url',
  options: [
    {
      name: 'url',
      type: 3,
      description: 'Enter youtube url',
      required: true,
    }
  ]
};

const STOP = {
  name: 'stop',
  description: 'Stop current',
  type: 1,
};

const ALL_COMMANDS = [PLAY, STOP];

InstallGlobalCommands(process.env.APP_ID!, ALL_COMMANDS);
