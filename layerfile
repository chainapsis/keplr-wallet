#This is an example webapp.io configuration for React!
FROM vm/ubuntu:18.04

# To note: Layerfiles create entire VMs, *not* containers!

RUN curl -fSsL https://deb.nodesource.com/setup_12.x | bash && \
    apt-get install nodejs python3 make gcc build-essential && \
    rm -f /etc/apt/sources.list.d/nodesource.list

# node is a memory hog
MEMORY 2G
ENV NODE_OPTIONS=--max-old-space-size=8192

COPY . .
RUN npm install || true
RUN BACKGROUND npm start || python3 -m http.server 3000

# Create a unique link to share the app in this runner.
# Every time someone clicks the link, we'll wake up this staging server.
EXPOSE WEBSITE http://localhost:3000
