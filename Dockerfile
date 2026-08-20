# Une image pour les deux processus : l'API et, plus tard, le worker de la
# boîte d'envoi. Même image, même configuration, points d'entrée différents.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
COPY packages/core/package.json packages/core/
COPY packages/infra/package.json packages/infra/
COPY packages/api/package.json packages/api/
COPY packages/webapp/package.json packages/webapp/
# --frozen-lockfile : on installe EXACTEMENT ce qui a été testé.
RUN yarn install --frozen-lockfile --production=false

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Un utilisateur non privilégié : un processus root dans un conteneur est une
# élévation de privilèges qui attend une faille.
USER node

EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["yarn", "workspace", "@booking/api", "start"]
