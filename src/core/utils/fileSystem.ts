import { copyFile as __copyFile, exists as __exists, readFile as __readFile, writeFile as __writeFile } from 'fs';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { promisify } from 'util';

const fileSystem = {
  readFile: promisify(__readFile),
  writeFile: promisify(__writeFile),
  copyFile: promisify(__copyFile),
  exists: promisify(__exists),
  mkdir: mkdirp,
  rmdir: (path: string): Promise<void> =>
    new Promise((resolve, reject) => {
      rimraf(path, (error: Error) => {
        if (error) reject(error);
        else resolve();
      });
    }),
};

export { fileSystem };