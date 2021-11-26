# ⭐ Ket ⭐
✨ Ket is an excellent bot for Discord made in TypeScript using Eris ✨

There's not much to see here, but if you want to run Ket on your machine you'll need:
- NodeJS (Recommended version: 14.18.1 or higher)


# How to install 🤔
- Download the above files or clone the repository:
```
git clone https://github.com/KetDiscordBot/Ket
```
- Install the necessary dependencies to run the project:
```
cd Ket
npm install
```
- You may need to install 2 packages separately:
```
npm install -g typescript pm2
```
- Create a file named ".env" and fill in the information below:
```
BOT_OWNERS=["id1", "id2", "..."] # These users have access to developer commands
TRUSTED_BOTS=["id1", "id2", "..."] # Trusted bots that can use commands

    #   BOT CONNECTIONS
# TOPGG_TOKEN="" # this can be ignored
    
    #   DATABASE SETTINGS (POSTGRESQL)
DATABASE_USER="database user"
DATABASE_PASSWORD="database password"
DATABASE_HOST="localhost"
DATABASE_PORT="port (number)"
DATABASE="database name"

    #   CHANNEL / WEBHOOK DATA
WEBHOOK_GUILD_ADD="webhookID | webhookTOKEN"
WEBHOOK_GUILD_REMOVE="webhookID | webhookTOKEN"
         
    #   MULTI CLIENT SETTINGS
CLIENT_DISCORD_TOKEN="token of your bot"
BETA_CLIENT_DISCORD_TOKEN="Token of your BETA bot (Can be ignored if CLIENT_CANARY is false)"
```
- Now just start:
```
npm start
```

I hope you like the project :)