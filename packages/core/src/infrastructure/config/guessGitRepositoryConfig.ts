import gitUrlParse from "git-url-parse";
import { readFileSync } from "fs";
import path from "path";
import { GitRepositoryConfig, Log4brainsConfig, gitProviders } from "./schema";

/**
 * `[remote "origin"]` -> true, `[core]` -> false, not a section header -> undefined
 */
function isOriginSectionHeader(line: string): boolean | undefined {
  if (!line.startsWith("[") || !line.endsWith("]")) {
    return undefined;
  }
  const [kind, name] = line.slice(1, -1).trim().split(/\s+/);
  return kind === "remote" && name === '"origin"';
}

/**
 * `url = https://...` -> the URL, without quotes
 */
function parseUrlEntry(line: string): string | undefined {
  const separator = line.indexOf("=");
  if (separator <= 0 || line.slice(0, separator).trim() !== "url") {
    return undefined;
  }
  const value = line.slice(separator + 1).trim();
  return value.startsWith('"') && value.endsWith('"')
    ? value.slice(1, -1)
    : value;
}

/**
 * Reads the URL of the "origin" remote in the `.git/config` file of the given folder.
 * Synchronous on purpose (see guessGitRepositoryConfig()).
 */
function readOriginRemoteUrl(workdir: string): string | undefined {
  let content: string;
  try {
    content = readFileSync(path.join(workdir, ".git/config"), "utf-8");
  } catch {
    return undefined;
  }
  let inOriginSection = false;
  for (const line of content.split("\n").map((l) => l.trim())) {
    const isOrigin = isOriginSectionHeader(line);
    if (isOrigin !== undefined) {
      inOriginSection = isOrigin;
    } else if (inOriginSection) {
      const url = parseUrlEntry(line);
      if (url) {
        return url;
      }
    }
  }
  return undefined;
}

export function guessGitRepositoryConfig(
  existingConfig: Log4brainsConfig,
  workdir: string
): GitRepositoryConfig | undefined {
  // URL
  let url = existingConfig.project.repository?.url;
  if (!url) {
    // Try to guess from the current Git configuration
    // We read it directly and not with SimpleGit because we want this method to remain synchronous
    url = readOriginRemoteUrl(workdir);
  }
  if (!url) {
    return undefined;
  }

  const urlInfo = gitUrlParse(url);
  if (
    !urlInfo.protocol.includes("https") &&
    !urlInfo.protocol.includes("http")
  ) {
    // Probably an SSH URL -> we try to convert it to HTTPS
    url = urlInfo.toString("https");
  }

  url = url.replace(/\/$/, ""); // remove a possible trailing-slash

  // PROVIDER
  let provider = existingConfig.project.repository?.provider;
  if (!provider || !gitProviders.includes(provider)) {
    // Try to guess from the URL
    provider =
      gitProviders.filter((p) => urlInfo.resource.includes(p)).pop() ||
      "generic";
  }

  // PATTERN
  let viewFileUriPattern =
    existingConfig.project.repository?.viewFileUriPattern;
  if (!viewFileUriPattern) {
    switch (provider) {
      case "gitlab":
        viewFileUriPattern = "/-/blob/%branch/%path";
        break;

      case "bitbucket":
        viewFileUriPattern = "/src/%branch/%path";
        break;

      case "github":
      default:
        viewFileUriPattern = "/blob/%branch/%path";
        break;
    }
  }

  return {
    url,
    provider,
    viewFileUriPattern
  };
}
