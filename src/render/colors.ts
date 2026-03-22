import chalk from "chalk";
import type { DecisionStatus } from "../core/types.js";

export const status = (s: DecisionStatus): string => {
  const map: Record<DecisionStatus, (t: string) => string> = {
    accepted: chalk.green,
    proposed: chalk.yellow,
    superseded: chalk.gray,
    deprecated: chalk.red,
  };
  return map[s](s);
};

export const id = (text: string): string => chalk.cyan.bold(text);
export const title = (text: string): string => chalk.white.bold(text);
export const tag = (text: string): string => chalk.magenta(`#${text}`);
export const file = (text: string): string => chalk.blue.underline(text);
export const dim = (text: string): string => chalk.dim(text);
export const success = (text: string): string => chalk.green.bold(text);
export const warn = (text: string): string => chalk.yellow.bold(text);
export const error = (text: string): string => chalk.red.bold(text);
export const heading = (text: string): string => chalk.white.bold.underline(text);

export const edge = {
  "supersedes": chalk.red("supersedes"),
  "depends-on": chalk.blue("depends-on"),
  "related-to": chalk.gray("related-to"),
  "contradicts": chalk.red.bold("contradicts"),
} as const;
