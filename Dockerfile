# Stage 1: Install production dependencies
FROM node:12-alpine AS prod-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm install --only=prod

# Stage 2: Install dev dependencies and compile server
FROM prod-deps AS build-server
RUN npm install --only=dev
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build

# Stage 3: Compile client
FROM node:12-alpine AS build-client
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm install --only=prod
COPY client/tsconfig.json ./
COPY client/public ./public
COPY client/src ./src
RUN npm run build

# Stage 4: Combine production deps from stage 1 with compiled code from stages 2 and 3
FROM prod-deps
COPY --from=build-server /app/server/build /app/server/build
COPY --from=build-client /app/client/build /app/client/build
EXPOSE 4444
CMD npm run serve
