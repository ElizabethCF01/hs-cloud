#!/bin/bash
yum update -y
yum install -y git nodejs

git clone https://github.com/ElizabethCF01/hs-cloud.git /home/ec2-user/app
cd /home/ec2-user/app
npm install
npm run build
npm start &
