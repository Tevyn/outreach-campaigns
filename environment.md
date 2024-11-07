# Setting up your environment
[Back to README](README.md)

1. Install NVM:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```
- If you want, [get the latest version of the above script](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script)

2. Close and reopen terminal
3. Check to see if nvm installed:
```
nvm  --version
```
- If terminal returns a version number, you’re good
- If not, you may need to enter:
```
touch ~/.bash_profile
```
- Check for a version again
4. Install node:
```
nvm install node
```
5. Clone github repo
- In terminal, navigate to to the directory you want it cloned in
- Clone repo:
```
git clone https://github.com/Tevyn/outreach-campaigns.git
```
6. Go to the app directory:
```
cd outreach-campaigns
```
7. Start app:
```
npm start
```
8. In browser, go to http://localhost:3000

9. End app with ctrl+c

[Back to README](README.md)
