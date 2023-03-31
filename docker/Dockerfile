FROM ubuntu:20.04

# Install dependencies for build
RUN apt-get update && apt -y install build-essential libusb-1.0-0-dev curl unzip

# Install node 16
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt -y install nodejs

# Install yarn
RUN npm install --global yarn

# Install protobuf v21.3
RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v21.3/protoc-21.3-linux-$(if [ $(uname -m) = "aarch64" ]; then echo aarch_64; else echo x86_64; fi).zip
RUN unzip protoc-21.3-linux-$(if [ $(uname -m) = "aarch64" ]; then echo aarch_64; else echo x86_64; fi).zip -d $HOME/protoc
RUN cp -r $HOME/protoc/include /usr/local
RUN cp -r $HOME/protoc/bin /usr/local

RUN mkdir app

COPY ./ /app

WORKDIR /app

ARG KEPLR_EXT_ETHEREUM_ENDPOINT
ARG KEPLR_EXT_LEGACY_AMPLITUDE_API_KEY
ARG KEPLR_EXT_AMPLITUDE_API_KEY
ARG KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN
ARG KEPLR_EXT_ANALYTICS_API_URL
ARG KEPLR_EXT_TRANSAK_API_KEY
ARG KEPLR_EXT_MOONPAY_API_KEY
ARG KEPLR_EXT_KADO_API_KEY
ARG KEPLR_EXT_COINGECKO_ENDPOINT
ARG KEPLR_EXT_COINGECKO_GETPRICE

ENV KEPLR_EXT_ETHEREUM_ENDPOINT $KEPLR_EXT_ETHEREUM_ENDPOINT
ENV KEPLR_EXT_LEGACY_AMPLITUDE_API_KEY $KEPLR_EXT_LEGACY_AMPLITUDE_API_KEY
ENV KEPLR_EXT_AMPLITUDE_API_KEY $KEPLR_EXT_AMPLITUDE_API_KEY
ENV KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN $KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN
ENV KEPLR_EXT_ANALYTICS_API_URL $KEPLR_EXT_ANALYTICS_API_URL
ENV KEPLR_EXT_TRANSAK_API_KEY $KEPLR_EXT_TRANSAK_API_KEY
ENV KEPLR_EXT_MOONPAY_API_KEY $KEPLR_EXT_MOONPAY_API_KEY
ENV KEPLR_EXT_KADO_API_KEY $KEPLR_EXT_KADO_API_KEY
ENV KEPLR_EXT_COINGECKO_ENDPOINT $KEPLR_EXT_COINGECKO_ENDPOINT
ENV KEPLR_EXT_COINGECKO_GETPRICE $KEPLR_EXT_COINGECKO_GETPRICE

RUN cd packages/extension/src/keplr-torus-signin && yarn install --frozen-lockfile
RUN yarn install --frozen-lockfile

RUN yarn build

VOLUME /data

WORKDIR /data

CMD mkdir -p ./build && cd ./build && find . -type f -delete && cp -r /app/packages/extension/build /data
