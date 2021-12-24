import { red, green, yellow, magenta } from "colorette";

export const colors = {
  error: red("error") + " -",
  ready: green("ready") + " -",
  warn: yellow("warn") + " -",
  event: magenta("event") + " -",
  info: magenta("info") + " -",
};

// Ready, no issues
export const ready = (...message: unknown[]) => {
  console.log(colors.ready, ...message);
};

// Uh oh, there were issues found
export const error = (...message: unknown[]) => {
  console.error(colors.error, ...message);
};

export const warn = (...message: unknown[]) => {
  console.warn(colors.warn, ...message);
};

export const event = (...message: unknown[]) => {
  console.log(colors.event, ...message);
};

// Information
export const info = (...message: unknown[]) => {
  console.log(colors.info, ...message);
};
