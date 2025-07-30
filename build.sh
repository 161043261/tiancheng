ssh root@121.41.121.204
scp -r .vitepress/dist root@121.41.121.204:~/

sudo rm -rf /var/www/dist
sudo mv ./dist /var/www/
sudo systemctl restart nginx
sudo chmod -R 755 /var/www/dist
echo "http://127.0.0.1"
