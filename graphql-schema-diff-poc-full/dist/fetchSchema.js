"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneOrPull = cloneOrPull;
exports.readSchemaFromRepo = readSchemaFromRepo;
exports.readLocalSchema = readLocalSchema;
const simple_git_1 = require("simple-git");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function cloneOrPull(repoUrl, localPath) {
    try {
        const git = (0, simple_git_1.simpleGit)();
        await git.clone(repoUrl, localPath);
    }
    catch (err) {
        // if already exists, pull
        const g = (0, simple_git_1.simpleGit)(localPath);
        await g.pull('origin', 'main');
    }
}
async function readSchemaFromRepo(localPath, schemaFilePath = 'schema.graphql') {
    const full = path_1.default.join(localPath, schemaFilePath);
    return promises_1.default.readFile(full, 'utf8');
}
async function readLocalSchema(localFile) {
    return promises_1.default.readFile(localFile, 'utf8');
}
