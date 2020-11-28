const checkHerokuLogin = require('../deploy/checkHerokuLogin');
const gitCheckoutHApp = require('../deploy/gitCheckoutHApp');
const createTMP = require('../deploy/createTMP');
const downloadUnzip = require('../deploy/downloadUnzip');
const initBackendnCommit = require('../deploy/initBackendnCommit');
const inputPrompts = require('../deploy/inputPrompts');
const pushBackend = require('./pushBackend');
const herokuNotAuthMess = require('../init/post-init');
const spinner = require('../../helpers/spinner');

const chalk = require('chalk');

module.exports = async () => {
  spinner(true, 'Check for Heroku Login Status', 0, false, async(herokuSpin) => {
    const checkHeroku = await checkHerokuLogin();
    herokuSpin.stop();
    if(checkHeroku.res){
      console.log(
        '\n'+
        chalk.bold.green("Heroku Login Successfull")+'\n\n'+
        chalk.white(checkHeroku.output)+
        '\n'
      );
      const appname = await inputPrompts.appName();
      if(appname.length > 1){
        createTMP(async (tempPath, resPath) => {
          spinner(true, 'Downloading latest Backend Repo and Unzipping Now', 0, false, async(downSpin) => {
            const downloadUnzipBackend = downloadUnzip(tempPath, async () => {
              downSpin.stop();
              console.log(
                '\n'+
                chalk.bold.green("Download and Unzip of Backend Successfull")+'\n\n'+
                chalk.white("Backend downloaded and Unzipped in "+tempPath+". Don\'t Worry this will be Autocleaned after this Process.")+
                '\n'
              );
              spinner(true, 'Initializing Repo for Deploying to Heroku', 0, false, async(initSpin) => {
                const gitInitBack = await initBackendnCommit(resPath);
                initSpin.stop();
                if(gitInitBack.res){
                  console.log(
                    '\n'+
                    chalk.bold.green("Initialized Backend and Ready to Deploy to Heroku")+'\n\n'+
                    chalk.white(gitInitBack.output)+
                    '\n'
                  );
                  spinner(true, 'Checking Heroku App for Deployment', 0, false, async(checkSpin) => {
                    const checkOutHeroku = await gitCheckoutHApp(appname, resPath);
                    checkSpin.stop();
                    if(checkOutHeroku.res){
                      console.log(
                        '\n'+
                        chalk.bold.green("Sucessfully Initialized the Heroku app for Backend Deployment")+'\n\n'+
                        chalk.white(checkOutHeroku.output)+
                        '\n'
                      );
                      spinner(true, 'Pushing the Latest Backend to Heroku App', 0, false, async(pushSpin) => {
                        const pushHeroku = await pushBackend(resPath);
                        pushSpin.stop();
                        if(pushHeroku.res){
                          console.log(
                            '\n'+
                            chalk.bold.green("Pushing to Backend Successfull. Here is the Build Process.")+'\n\n'+
                            chalk.white(pushHeroku.output)+
                            '\n'
                          );
                          console.log(
                            '\n'+
                            chalk.yellow.bold(`You can Access the backend in the following Address for Creating the Super User\n>> https://${appname}.herokuapp.com`)+
                            '\n'
                          );
                          process.exit();
                        } else {
                          console.log(
                            '\n'+
                            chalk.bold.red("Pushing to Backend Failed with the Following Error")+'\n\n'+
                            chalk.white(pushHeroku.output)+
                            '\n'
                          );
                          process.exit();
                        }
                      })
                    } else {
                      console.log(
                        '\n'+
                        chalk.bold.red("Initializing Heroku App Failed with the Following Error")+'\n\n'+
                        chalk.white(checkOutHeroku.output)+
                        '\n'
                      );
                      process.exit();
                    }
                  })
                } else {
                  console.log(
                    '\n'+
                    chalk.bold.red("Initializing Backend Zip Failed with the Following Error")+'\n\n'+
                    chalk.white(gitInitBack.output)+
                    '\n'
                  );
                  process.exit();
                }
              })
            })
          })
        })
      } else {
        console.log(
          '\n'+
          chalk.bold.red("Appname Should be More than Atleast 1 Chars")+'\n'
        );
        process.exit();
      }
    } else {
      console.log(
        '\n'+
        chalk.bold.red("It Looks like You are not Logged in to Heroku")+'\n\n'+
        chalk.white(checkHeroku.output)+
        '\n'+
        herokuNotAuthMess
      );
      process.exit();
    }
  })
}
