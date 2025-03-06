sudo rm -rf /var/www/dist
sudo mv ./dist /var/www/
sudo systemctl restart nginx
sudo chmod -R 755 /var/www/dist
echo "IPv4: http://127.0.0.1"
