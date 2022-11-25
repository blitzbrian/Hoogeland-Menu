#!/bin/sh
echo "Installing Project COOL!"
echo "Updating System"
sudo apt update
sudo apt upgrade -y
echo "--------------------------------"
echo "Done, updating!"
echo "Installing Brave (Chrome but better)"
sudo apt install apt-transport-https curl -y
sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main"|sudo tee /etc/apt/sources.list.d/brave-browser-release.list
sudo apt update
sudo apt install brave-browser -y
echo "--------------------------------"
echo "Done installing Brave"
echo "Installing Discord"
curl https://discord.com/api/download?platform=linux&format=deb --output discord.deb
sudo apt install ./discord.deb -y
rm discord.deb
echo "--------------------------------"
echo "Done installing Discord"
echo "Done installing Project COOL!"
