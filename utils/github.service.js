import { Octokit } from "@octokit/rest";
import env from "../config/env.js";
import fs from "fs";

const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

export const upsert = async (localFilePath, remoteRepositoryPath) => {

    let sha = undefined;

    try {
        const { data } = await octokit.repos.getContent({ owner: env.GITHUB_USERNAME, repo: env.GITHUB_REPO, path: `blogs/${remoteRepositoryPath}` });
        sha = data.sha;
    } catch (error) {
        if (error.status !== 404) {
            if (env.isDevelopment()) console.log(error);
            throw error
        }
    }

    const markdownContent = fs.readFileSync(localFilePath, { encoding: "base64" });

    const repo = await octokit.repos.createOrUpdateFileContents({
        content: markdownContent,
        message: `Create or Update ${remoteRepositoryPath}`,
        owner: env.GITHUB_USERNAME,
        path: `blogs/${remoteRepositoryPath}`,
        sha,
        repo: env.GITHUB_REPO,
        branch: env.GITHUB_BRANCH || "main",
    });

    fs.unlink(localFilePath, (e) => {
        if (e) throw e;
    });

    return repo.data.content.html_url;
}

export const read = async (remoteRepositoryPath) => {
    try {
        const { data } = await octokit.repos.getContent({
            owner: env.GITHUB_USERNAME,
            repo: env.GITHUB_REPO,
            path: `blogs/${remoteRepositoryPath}`,
        });

        if (data && data.content) {
            const markdown = Buffer.from(data.content, 'base64').toString('utf-8');
            return markdown;
        } else {
            throw new Error("No content found in file.");
        }
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        throw error;
    }
}