// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT



const loopback = require('loopback');
const boot = require('loopback-boot');
const app = module.exports = loopback();
const { Client, Intents,Discord } = require('discord.js');
const configVal = require("./config.json");
const { channel } = require('diagnostics_channel');
//const client = new Discord.Client();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
var x = app.models.model-1
client.on('ready',()=>{
    console.log("Connected as "+ client.user.tag)
    client.user.setActivity("Youtube",{type:"Watching"})
    // client.guilds.cache.forEach((guild)=>{
    //     console.log(guild.name)
    //     guild.channels.cache.forEach((channel)=>{
    //         console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
    //     })
    // })
    let generalChannel=client.channels.cache.get("947910712951463950")
            
   
    client.on('message',(receivedMessage)=>{
        
       if(receivedMessage.author==client.user){
            return
        }

        if (receivedMessage.content.startsWith("!")){
            
            processCommand(receivedMessage)
        }
        else{
            
        }
    })

  
    function processCommand(receivedMessage){
        let fullCommand=receivedMessage.content.substr(1)
        let splitCommand=fullCommand.split(" ")
        let primaryCommand=splitCommand[0]
        let arguments=splitCommand.slice(1)

        if(primaryCommand=="help"){
            helpCommand(arguments,receivedMessage)
        }
        else if(primaryCommand=="multiply"){
            multiplyCommand(arguments,receivedMessage)
        }
        else if(primaryCommand=="bye"){
            receivedMessage.channel.send("Bye, Have a nice day")
        }
        else{
            receivedMessage.channel.send("Unknown command. Try `!help` or `!multiply`")
        }
    }

    function multiplyCommand(arguments,receivedMessage){
        if(arguments.length<2){
            receivedMessage.channel.send("Not enough arguments. try ` !multiply 2 10`")
            return
        }
        let product =1
        arguments.forEach((value)=>{
            product=product*parseFloat(value)
        })
        receivedMessage.channel.send("The product of "+arguments+" is "+product.toString())
    }

    function helpCommand(arguments,receivedMessage){
        if(arguments.length==0){
            receivedMessage.channel.send("I'm not sure what you need help with. Try `!help [topic]`")
        }
        else{
          var botResponse=arguments
          app.models.tradingview_alerts.create({
            ticker:"AA",
            message:botResponse,
            time:new Date().toISOString(),
            title:"NH"
           

          },function(error,res){
            if(error){
              console.log(error)
            }
          })
           // receivedMessage.channel.send("It looks like you need help with "+arguments)
            app.models.tradingview_alerts.findOne({where:{"id":"1"}},function(err,result){
               
               if(err){
                 console.log(err)
               }
               else{
                 if(result){
                  let titlename = result.toJSON().title;
                  if (!titlename) {
                    console.log("a")
                  }
                  else{
                    receivedMessage.channel.send("It looks like you need help with "+botResponse+"\n"+titlename)
                    console.log(titlename)
                  }
                 }
               }
              
             })
        }
    }
    
})
client.login("OTQ3OTE1OTc1OTcyNTA3NzE4.Yh0NjA.geJKP-D07fO9yiCFTrAPPq5PnR4")
app.start = function () {

    

    //Isshan stuff
  
  
  
    app.use(function (req, response, next) {
      // // console.log('in cors');
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Credentials", "true");
      response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      next();
    });
  
   
   //my stuff****************** 
    // start the web server
    return app.listen(function () {

      app.emit('started');
      const baseUrl = app.get('url').replace(/\/$/, '');
      console.log('Web server listening at: %s', baseUrl);
      if (app.get('loopback-component-explorer')) {
        const explorerPath = app.get('loopback-component-explorer').mountPath;
        console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
      }
    });
  //*******MY STUFF END******* */
  
  
   
  };
 
  // Bootstrap the application, configure models, datasources and middleware.
  // Sub-apps like REST API are mounted via boot scripts.
  boot(app, __dirname, function (err) {
    if (err) throw err;
  
    // start the server if `$ node server.js`
    if (require.main === module)
      app.start();

      // app.models.tradingview_alerts.find((err,result)=>{
      //      console.log(result);
      //      console.log(err);
      //   })
  
    });


