FROM ubuntu:20.04

RUN mkdir app

COPY ./ /app

WORKDIR /app

# Remove all .DS_Store fils which exist only in OSX
RUN find . -name .DS_Store -exec rm {} \;

RUN tar cvzf firefox-archive.tar.gz *

VOLUME /data

WORKDIR /data

CMD mkdir -p ./build && cp /app/firefox-archive.tar.gz /data/build/firefox-archive.tar.gz
