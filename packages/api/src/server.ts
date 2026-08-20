import { App, subscribers } from "@booking/core";
import { productionDependencies } from "@booking/infra";
import { readConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createServer } from "./createServer.js";
import { smtpMailer } from "./smtpMailer.js";

const config = readConfig(process.env);
const logger = createLogger(config.logLevel);

const dependencies = productionDependencies(config, {
  mailer: smtpMailer(config),
  logger,
});
const app = new App(dependencies, subscribers);

const server = createServer(app, {
  logger,
  isProduction: config.isProduction,
}).listen(config.port, () => logger.info({ port: config.port }, "listening"));

export { app, server, dependencies, logger, config };
