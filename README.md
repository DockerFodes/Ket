# ⭐ Ket Discord Bot ⭐
✨ Ket is a shitty discord bot made in TypeScript using Eris ✨
> ⚠️ » Ket is still in the early stages of its development

- - - -

# How to install 🤔
### `1 -` 🛠️ Download and install the necessary tools to get started
If you want to run Ket on your machine, you'll need to:
- [NodeJS](https://nodejs.org/pt-br/)
> ⚠️ » Recommended version: 14.19.1
- [Yarn](https://yarnpkg.com/)
> ⚠️ » Recommended version: 3.2.0
- [PostgreSQL](https://www.postgresql.org/download/)
> ⚠️ » Recommended version: 13 or higher
- [Lavalink](https://ci.fredboat.com/viewLog.html?buildId=lastSuccessful&buildTypeId=Lavalink_Build&tab=artifacts&guest=1)
> ⚠️ » Lavalink is required for music commands
- [Java 13](https://www.oracle.com/java/technologies/javase/jdk13-archive-downloads.html)
> ⚠️ » Java 13 is required to run Lavalink, Java 14 is not recommended
- [GIT CLI](https://git-scm.com/downloads)

### `2 -` 📁 Download the above frameworks and clone the repository:
```bash
git clone https://github.com/KetDiscordBot/Ket
```

### `3 -` 🧰 Install the necessary dependencies to run the project:
> ⚠️ » If you don't have yarn installed, install corepack before continuing: "`npm i -g corepack`"
```bash
cd Ket
yarn install
```

### `4 -` 🌿 Preparing the environment
> ⚠️ » If you use vscode editor you will need to install yarn SDK:
```bash
yarn dlx @yarnpkg/sdks vscode # Open a .ts file, type Ctrl + Shift + P and change the TypeScript version
```
- Rename the file "`.env.example`" to "`.env`"
- Replace or fill in "`.env`" and "`settings.json`" settings
> 💡 » settings.json is located in "`src/JSON/settings.json`"

### `5 -` 🚀 Getting Started
To get started, just type:
``` bash
# Starting Lavalink:
java -jar Lavalink.jar # Watch out! Lavalink can consume a lot of RAM
# in a separate terminal:
yarn start
```
> ⚠️ » To skip compilation use `yarn noCompile`, but you need to build the project first

- - - -

### I Hope you like the project :)

(Ket is still in development, not yet open for public use.)