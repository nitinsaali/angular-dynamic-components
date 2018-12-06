#!/bin/sh
echo 'Building web-box:dev using Dev.Dockerfile'
docker build -f Dev.Dockerfile -t web-box:dev .
docker tag web-box:dev web-box:latest

echo 'Building web-box:lates using Dockerfile(used for prod)'
docker build -t web-box:prod .

echo 'Building web-box:lates using Dockerfile(used for eviqa)'
docker build -f Eviqa.Dockerfile -t web-box:eviqa .