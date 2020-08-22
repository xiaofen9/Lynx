FROM alpine:3.10
RUN apk add npm
WORKDIR /
RUN npm install @babel/core@^7.0.0 @babel/cli@^7.0.0 @babel/preset-env@^7.0.0 core-js@3 --save && \
	ln -s /node_modules/@babel/cli/bin/babel.js  /bin/babel
COPY ./babel.config.json /babel.config.json
# u can use whatever u want here in COPY command