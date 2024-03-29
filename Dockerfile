# Stage 1 - label this stage as builder
FROM node:8 as builder

# Install dependencies
COPY package*.json ./

# clear stuff?
RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

RUN npm install && mkdir /ng-app && cp -R ./node_modules ./ng-app
# If you are building your code for production
# RUN npm install --only=production

WORKDIR /ng-app

# Bundle app source inside docker image
COPY . .

# Build the angular app in production mode and store the artifacts in dist folder
RUN $(npm bin)/ng build --prod --build-optimizer --env=prod

# Stage 2
FROM nginx:1.13.3-alpine

# Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# From 'builder' stage copy over the artifacts in dist folder to default nginx public folderss
COPY --from=builder /ng-app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
