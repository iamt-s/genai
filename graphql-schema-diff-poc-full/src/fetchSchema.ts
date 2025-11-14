import { simpleGit } from 'simple-git';
import path from 'path';
import * as fs from 'fs';            // for existsSync, readFileSync
import * as fsp from 'fs/promises'

export async function cloneOrPull(repoUrl: string, localPath: string) {
  const repoFilePath = './latest-schema.graphql';
  try {
    // Clone if folder doesn't exist
   
     try {
    const git = simpleGit();
    await git.clone(repoUrl, localPath);
  } catch (err) {
    // if already exists, pull
    const g = simpleGit(localPath);
    await g.checkout('Development'); 
    await g.pull('origin', 'Development');
    console.log("✅ Succesfully Pulled the data from the repo");
  }
    const g = simpleGit(localPath);

     // Fetch latest from remote to ensure we have the newest commits
    await g.fetch('origin', 'Development');


    // Get latest and previous commit hashes
    const log = await g.log(['-n', '2', 'origin/Development']);
    const latestCommit = log.latest?.hash;
    const prevCommit = log.all[1]?.hash;

    if (!latestCommit || !prevCommit) throw new Error("Cannot find commits");

    // --- Latest schema ---
    const latestSchema = await g.show([`${latestCommit}:${repoFilePath}`]);
    const latestFilePath = path.join(localPath, 'latest-schema.graphql');

    if (!fs.existsSync(latestFilePath) || fs.readFileSync(latestFilePath, 'utf-8') !== latestSchema) {
      await fsp.writeFile(latestFilePath, latestSchema, 'utf-8');
      console.log(`✅ latest-schema.graphql updated ${latestCommit}`);
    } else {
      console.log("ℹ️ latest-schema.graphql is already up-to-date So Stopping the execution here No changes found");
        process.exit(1);
    }

    // --- Baseline schema (one commit behind) ---
    const baselineSchema = await g.show([`${prevCommit}:${repoFilePath}`]);
    const baselineFilePath = path.join(localPath, 'baseline-schema.graphql');

    if (!fs.existsSync(baselineFilePath) || fs.readFileSync(baselineFilePath, 'utf-8') !== baselineSchema) {
      await fsp.writeFile(baselineFilePath, baselineSchema, 'utf-8');
      console.log(`✅ baseline-schema.graphql updated ${prevCommit} `);
    } else {
      console.log(`ℹ️ baseline-schema.graphql is already up-to-date`);
    }

  } catch (err) {
    console.error("❌ Error updating schemas:", err);
  }
}

export async function readSchemaFromRepo(localPath: string, schemaFilePath = 'schema.graphql') {
  const full = path.join(localPath, schemaFilePath);
  return fsp.readFile(full, 'utf8');
}

export async function readLocalSchema(localFile: string) {
  return fsp.readFile(localFile, 'utf8');
}