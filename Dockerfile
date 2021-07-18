FROM node:14.17.3-alpine as build

ARG BUILD_DIR="/apps"

WORKDIR ${BUILD_DIR}

COPY app/ ./app/
COPY package.json yarn.lock tsconfig.json ./

RUN yarn install
RUN yarn build

FROM public.ecr.aws/lambda/nodejs:14 as release

ARG BUILD_DIR="/apps"
ARG FUNCTION_DIR="/var/task"
ARG OUTPUT_DIR="${BUILD_DIR}/dist/app"

RUN mkdir -p ${FUNCTION_DIR}

COPY --from=build ${OUTPUT_DIR}/ ${FUNCTION_DIR}/
COPY --from=build ${BUILD_DIR}/package.json ${FUNCTION_DIR}/
COPY --from=build ${BUILD_DIR}/yarn.lock ${FUNCTION_DIR}/

RUN npm install -g yarn
RUN yarn --production
