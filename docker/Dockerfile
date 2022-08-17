FROM ubuntu:20.04

# Install dependencies for build
RUN apt-get update && apt -y install build-essential libusb-1.0-0-dev curl unzip watchman

# Install node 14
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt -y install nodejs

# Install yarn
RUN npm install --global yarn

# Install lerna
RUN yarn global add lerna

# Install protobuf v21.3
RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v21.3/protoc-21.3-linux-aarch_64.zip
RUN unzip protoc-21.3-linux-aarch_64.zip -d $HOME/protoc
RUN cp -r $HOME/protoc/include /usr
RUN cp $HOME/protoc/bin/protoc /bin/protoc

RUN mkdir app

COPY ./ /app

WORKDIR /app

# Clean before installing to ensure the same environment
RUN yarn clean

RUN yarn install --frozen-lockfile
RUN cd packages/extension/src/keplr-torus-signin && yarn install --frozen-lockfile

RUN yarn build

VOLUME /data

CMD cp -r /app/packages/extension/build /data
