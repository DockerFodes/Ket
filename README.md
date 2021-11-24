# ⭐ Ket ⭐
✨ Ket is an excellent bot for Discord made in TypeScript using Eris ✨

Uau não tem muita coisa pra ver aqui, mas se quiser executar a Ket na sua máquina você vai precisar de:
- NodeJS (recomendada a versão 14.18.1)


# Como instalar 🤔
- Baixe os arquivos acima ou clone o repositório com:
```
git clone https://github.com/KetDiscordBot/Ket
```
- Instale as dependências necessárias para rodar o projeto:
```
cd Ket
npm install
```
- Crie um arquivo com nome ".env" e preencha com as informações abaixo:
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
- Agora é só iniciar:
```
npm start
```

Espero que goste do projeto :)