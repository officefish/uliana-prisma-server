server {
        listen 443 ssl;

        server_name 82.148.18.82 kubiki.io;

        ssl_certificate /etc/ssl/certs/kubiki.io.crt;
        ssl_certificate_key /etc/ssl/certs/kubiki.io.key;

        location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
