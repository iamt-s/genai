import { simpleGit } from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

export async function cloneOrPull(repoUrl: string, localPath: string) {
  try {
    const git = simpleGit();
    await git.clone(repoUrl, localPath);
  } catch (err) {
    // if already exists, pull
    const g = simpleGit(localPath);
    await g.pull('origin', 'Development');
    console.log("✅ Succesfully Pulled the data from the repo");
  }

}

export async function readSchemaFromRepo(localPath: string, schemaFilePath = 'schema.graphql') {
  const full = path.join(localPath, schemaFilePath);
  return fs.readFile(full, 'utf8');
}

export async function readLocalSchema(localFile: string) {
  return fs.readFile(localFile, 'utf8');
}