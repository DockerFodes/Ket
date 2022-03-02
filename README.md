# ⭐ Ket Discord Bot ⭐
✨ Ket is a shitty discord bot made in TypeScript using Eris ✨
> ⚠️ Ket is still in the early stages of its development

- - - -

# How to install 🤔
### `1 -` 🛠️ Download and install the necessary tools to get started
If you want to run Ket on your machine, you'll need to:
- [NodeJS](https://nodejs.org/pt-br/)
> ⚠️ Recommended version: 14.18.3
- [PostgreSQL](https://www.postgresql.org/download/)
> ⚠️ Recommended version: 13 or higher
- [Lavalink](https://ci.fredboat.com/repository/download/Lavalink_Build/9347:id/Lavalink.jar)
> ⚠️ Lavalink is required for music commands
- [Java 13](https://www.oracle.com/java/technologies/javase/jdk13-archive-downloads.html)
> ⚠️ Java 13 is required to run Lavalink, Java 14 is not recommended
- [GIT CLI](https://git-scm.com/downloads)

### `2 -` 📁 Download the above frameworks and clone the repository:
```bash
git clone https://github.com/KetDiscordBot/Ket
```

### `3 -` 🧰 Install the necessary dependencies to run the project:
```bash
cd ket
npm install
```
> ⚠️ It may be necessary to install a package separately:
```bash
npm install -g typescript
```
### `4 -` 🌿 Preparing the environment
- Rename the file "`.env.example`" to "`.env`"
- Replace or fill in "`.env`" and "`settings.json`" settings
> ⚠️ settings.json is located in "`src/JSON/settings.json`"

### 🚀 Getting Started
To get started, just type:
``` bash
# Starting Lavalink:
java -jar Lavalink.jar # Watch out! Lavalink can consume a lot of RAM
# in a separate terminal:
npm start
```
> ⚠️ To skip compilation use `npm run noCompile`, but you need to build the project first

- - - -

### Hope you like the project :)

(Ket is still in development, not yet open for public use.)