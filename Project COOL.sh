#!/bin/sh
# bash <(curl -s https://pages.dazerstudios.ga/Hoogeland-Menu/Project%20COOL.sh)
echo "        CCCCCCCCCCCCC     OOOOOOOOO          OOOOOOOOO     LLLLLLLLLLL             "
echo "     CCC::::::::::::C   OO:::::::::OO      OO:::::::::OO   L:::::::::L             "
echo "   CC:::::::::::::::C OO:::::::::::::OO  OO:::::::::::::OO L:::::::::L             "
echo "  C:::::CCCCCCCC::::CO:::::::OOO:::::::OO:::::::OOO:::::::OLL:::::::LL             "
echo " C:::::C       CCCCCCO::::::O   O::::::OO::::::O   O::::::O  L:::::L               "
echo "C:::::C              O:::::O     O:::::OO:::::O     O:::::O  L:::::L               "
echo "C:::::C              O:::::O     O:::::OO:::::O     O:::::O  L:::::L               "
echo "C:::::C              O:::::O     O:::::OO:::::O     O:::::O  L:::::L               "
echo "C:::::C              O:::::O     O:::::OO:::::O     O:::::O  L:::::L               "
echo "C:::::C              O:::::O     O:::::OO:::::O     O:::::O  L:::::L               "
echo "C:::::C              O:::::O     O:::::OO:::::O     O:::::O  L:::::L               "
echo " C:::::C       CCCCCCO::::::O   O::::::OO::::::O   O::::::O  L:::::L         LLLLLL"
echo "  C:::::CCCCCCCC::::CO:::::::OOO:::::::OO:::::::OOO:::::::OLL:::::::LLLLLLLLL:::::L"
echo "   CC:::::::::::::::C OO:::::::::::::OO  OO:::::::::::::OO L::::::::::::::::::::::L"
echo "     CCC::::::::::::C   OO:::::::::OO      OO:::::::::OO   L::::::::::::::::::::::L"
echo "        CCCCCCCCCCCCC     OOOOOOOOO          OOOOOOOOO     LLLLLLLLLLLLLLLLLLLLLLLL"
echo "                                                                                   "
echo "                                                                                   "
echo "                                                                                   "
echo "                                                                                   "
echo "                                                                                   "
echo "                                                                                   "
echo "                                                                                   "
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
curl https://dl.discordapp.net/apps/linux/0.0.21/discord-0.0.21.deb --output discord.deb
sudo apt install ./discord.deb -y
rm discord.deb
echo "--------------------------------"
echo "Done installing Discord"
echo "Opening Installers of Discord and Brave"
# Nohup runs the command in another process
# So they can run next to eachother
nohup brave-browser >/dev/null 2>&1 &
nohup discord >/dev/null 2>&1 &
echo "Done installing Project COOL!"
