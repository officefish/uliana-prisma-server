# copy src from locahost to server

scp -r C:/Users/SA19S/nest/uliana-prisma-server/src root@82.148.18.82:/var/www/kubiki.io

# restart server

sudo systemctl restart diarma.service

# connect to new server
ssh root@82.148.18.82

# brutforce stop production server

# kill $(lsof -t -i:8001)

# copy certs

scp -r D:/nest/dragon-farm-server/ssl/ root@63.250.60.63:/etc/ssl/cert

# restart server

sudo systemctl restart toncase.service

# copy logs
scp root@63.250.60.63:/var/www/toncase.fun/logs/* D:/logs/dragon-farm