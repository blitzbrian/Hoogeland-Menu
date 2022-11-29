#!/bin/sh
# curl -s http://server/path/script.sh | bash -s 1 1 1
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
echo "Installing Brave"
sudo apt install apt-transport-https -y
sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main"|sudo tee /etc/apt/sources.list.d/brave-browser-release.list
sudo apt update
sudo apt install brave-browser -y
mkdir ~/.config/BraveSoftware/
mkdir ~/.config/BraveSoftware/Brave-Browser/
echo "" > ~/.config/BraveSoftware/Brave-Browser/First\ Run
mkdir ~/.config/BraveSoftware/Brave-Browser/Default/
echo "$(curl -s https://pages.dazerstudios.ga/Hoogeland-Menu/Preferences)" > ~/.config/BraveSoftware/Brave-Browser/Default/Preferences
echo "$(curl -s https://pages.dazerstudios.ga/Hoogeland-Menu/Bookmarks)" > ~/.config/BraveSoftware/Brave-Browser/Default/Bookmarks
echo "--------------------------------"
echo "Done installing Brave"
if [ $1 = "1" ]
then
echo "Installing Discord"
curl https://dl.discordapp.net/apps/linux/0.0.21/discord-0.0.21.deb --output discord.deb
sudo apt install ./discord.deb -y
rm discord.deb
echo "--------------------------------"
echo "Done installing Discord"
fi
if [ $2 = "1" ]
then
echo "Installing Spotify"
curl -sS https://download.spotify.com/debian/pubkey_5E3C45D7B312C643.gpg | sudo apt-key add - 
echo "deb http://repository.spotify.com stable non-free" | sudo tee /etc/apt/sources.list.d/spotify.list
sudo apt update
sudo apt install spotify-client -y
echo "--------------------------------"
echo "Done installing Spotify"
fi
if [ $3 = "1" ]
then
echo "Installing Wine"
sudo dpkg --add-architecture i386 
sudo mkdir -pm755 /etc/apt/keyrings
sudo echo "$(curl -s https://dl.winehq.org/wine-builds/winehq.key)" > /etc/apt/keyrings/winehq-archive.key
sudo apt update
sudo apt install --install-recommends winehq-stable
echo "--------------------------------"
echo "Done installing Wine"
fi
echo "Done installing Project COOL!"
echo "Note: You need to restart to make Spotify work,"
while true; do
    read -p "Do you want to restart now? " yn
    case $yn in
        [Yy]* ) sudo reboot; exit;;
        [Nn]* ) break;;
        * ) echo "Please answer yes or no.";;
    esac
done
# Nohup runs the command in another process
# So they can run next to eachother
nohup brave-browser >/dev/null 2>&1 &
if [ $1 = "1" ]
then
nohup discord >/dev/null 2>&1 &
fi
