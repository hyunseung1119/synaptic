import type { SynapticConfig, Result } from "../core/types.js";
import { readJsonFile, writeJsonFile, configPath } from "./fs.js";

const DEFAULT_CONFIG: SynapticConfig = {
  version: 1,
  projectName: "",
  decisionPrefix: "DEC",
  autoReminder: true,
};

export function createDefaultConfig(projectName: string): SynapticConfig {
  return { ...DEFAULT_CONFIG, projectName };
}

export async function loadConfig(projectRoot: string): Promise<Result<SynapticConfig>> {
  return readJsonFile<SynapticConfig>(configPath(projectRoot));
}

export async function saveConfig(projectRoot: string, config: SynapticConfig): Promise<Result<void>> {
  return writeJsonFile(configPath(projectRoot), config);
}
