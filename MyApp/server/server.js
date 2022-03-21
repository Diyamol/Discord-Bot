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
const { title } = require('process');
const axios = require('axios');
//const client = new Discord.Client();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready',()=>{
    console.log("Connected as "+ client.user.tag)

    // client.guilds.cache.forEach((guild)=>{
    //     console.log(guild.name)
    //     guild.channels.cache.forEach((channel)=>{
    //         console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
    //     })
    // })
   
    let generalChannel=client.channels.cache.get("947910712951463950")
    let alertsChannel=client.channels.cache.get("952954022376120320")
    var checkminutes = 1, checkthe_interval = checkminutes * 60 * 1000; //This checks every 1 minutes, change 10 to whatever minute you'd like
     var oldCount=0,newAllCount,newSpecCount;
     var allAlertsAndTickers
     var allAlertsAndSpecificTickers
     var SpecificAlertsAndAllTickers
     var SpecificAlertsAndTickers
     var onlyTicker=''
     var onlyTitle=''
     var currentTitle,mainTitle,primaryTitle='',secondaryTitle='',onlyPrimaryTitle=''
     var currentTicker,mainTicker,primaryTicker='',secondaryTicker='',onlyPrimaryTicker=''
     var reqTitle1='',reqTicker1='',newPost
     var insertTitle,insertTicker,insertId

     const sendPostRequest = async () => {
      try {
          const resp = await axios.post('https://dev-finance-server.azurewebsites.net/api/tradingview_alerts/titleCount',newPost);
          console.log(resp.data.count.cnt);
          alertsChannel.send("Total number of alerts for title: "+newPost.reqTitle+" and ticker: "+newPost.reqTicker+" is, "+resp.data.count.cnt)
      } catch (err) {
         
          console.error(err);
          
      }
  };
  client.on('messageCreate',(receivedMessage)=>{
    if(receivedMessage.author==client.user){
         return
     }
     if (receivedMessage.content==="Hi" ||receivedMessage.content==="hi"){
         initialCommand(receivedMessage)
     }
     else{
      processCommand(receivedMessage)
     }
 })

 function initialCommand(receivedMessage){
  receivedMessage.channel.send("Ask me anything")
 }

 function processCommand(receivedMessage){
  let fullCommand=receivedMessage.content
  let splitCommand=fullCommand.split(" ")
  let primaryCommand=splitCommand[0]
  let argumentTitle=splitCommand[1]
  let argumentTicker=splitCommand[2]
  let argumentTicker1=splitCommand[3]
  if(argumentTitle!==null && argumentTitle!==""){
    if(primaryCommand===('subscribe'||'Subscribe')){
      subscribeAlerts(argumentTitle,argumentTicker,receivedMessage)
    }
    else if(primaryCommand===('modify'||'modify')){
      modifyAlerts(argumentTitle,argumentTicker,argumentTicker1,receivedMessage)
    }
    else if(primaryCommand===('remove'||'remove')){
      removeAlerts(argumentTitle,argumentTicker,receivedMessage)
    }
  }
 }
 function checkExistingAlertsAndTickers(argumentTitle,argumentTicker){
  insertTitle=argumentTitle
  insertTicker=argumentTicker
  app.models.trading_view_subscription.findOne({where:{and:[{user_id:'discord_alerts'},{alert_keyword:insertTitle},{ticker:insertTicker}]}},function(errCheckExist,getExistRes){
    if(errCheckExist){
      console.log(errCheckExist+'error in check exist')
      return 0
    }
    else{
      console.log(getExistRes)
      return getExistRes
    }
  })
 }
function modifyAlerts(argumentTitle,argumentTicker,argumentTicker1,receivedMessage){
  insertTitle=argumentTitle
  insertTicker=argumentTicker
  var insertTicker1=argumentTicker1
  app.models.trading_view_subscription.findOne({where:{and:[{user_id:'discord_alerts'},{alert_keyword:insertTitle},{ticker:insertTicker}]}},function(errCheckExist,getExistRes){
    if(errCheckExist){
      console.log(errCheckExist+'error in check exist')
    }
    else{
      if(getExistRes===null)
      {
        console.log("Doesn't exist!!! Try new one ")
     //   receivedMessage.channel.send("Doesn't exist!!Try new one")
      }
      else{
        var id=getExistRes.id
        app.models.trading_view_subscription.updateAll({id:getExistRes.id},{ticker:insertTicker1},function(err,result){
          if(err){
            console.log("modification failed"+err)
          }
          else{
            console.log("Modified your subscription")
            receivedMessage.channel.send("Modified your subscription")
          }
      })
      }
    }
  })
}

function removeAlerts(argumentTitle,argumentTicker,receivedMessage){
  insertTitle=argumentTitle
  insertTicker=argumentTicker
  app.models.trading_view_subscription.findOne({where:{and:[{user_id:'discord_alerts'},{alert_keyword:insertTitle},{ticker:insertTicker}]}},function(errCheckExist,getExistRes){
    if(errCheckExist){
      console.log(errCheckExist+'error in check exist')
    }
    else{
      if(getExistRes===null)
      {
        console.log("Doesn't exist!!! Try new one ")
     //   receivedMessage.channel.send("Doesn't exist!!Try new one")
      }
      else{
        var id=getExistRes.id
        app.models.trading_view_subscription.destroyById(id,function(err,result){
          if(err){
            console.log("deletion failed"+err)
          }
          else{
            console.log("unsubscribed")
            receivedMessage.channel.send("Unsubscribed")
          }
      })
      }
    }
  })
}

 function subscribeAlerts(argumentTitle,argumentTicker,receivedMessage){
  insertTitle=argumentTitle
  insertTicker=argumentTicker
  app.models.trading_view_subscription.findOne({where:{and:[{user_id:'discord_alerts'},{alert_keyword:insertTitle},{ticker:insertTicker}]}},function(errCheckExist,getExistRes){
    if(errCheckExist){
      console.log(errCheckExist+'error in check exist')
    }
    else{
      if(getExistRes===null)
      {
        app.models.trading_view_subscription.create([{user_id:'discord_alerts',alert_keyword:insertTitle,ticker:insertTicker}],
          function(err,result){
            if(err){
              console.log("insertion failed"+err)
            }
            else{
              receivedMessage.channel.send("Subscribed to "+insertTitle+" and "+insertTicker)
            }
        })
      }
      else{
            console.log("exist "+getExistRes.id)
            receivedMessage.channel.send("Already exist!!Try new one")
      }
    }
  })
 
 }
     // ****************fetching all conditions from trading_view_subscription****************
     app.models.trading_view_subscription.find(function(error,rs){
      if(error){
        console.log("error in fetching data from subscription table")
      }
      else{
        if(rs.count!==0){
          
          rs.forEach((key,i)=>{
            if(key.alert_keyword==="*"){
              if(key.ticker==="$"){
                allAlertsAndTickers=1
              }
              else if(key.ticker===null || key.ticker===" "){
                allAlertsAndTickerNull=1
              }
              else{
                onlyTickerArr=key.ticker
                if(onlyTickerArr.includes(',')){
                  onlyTickerArrValue=onlyTickerArr.split(",")
                  onlyTickerArrValue.forEach((k,i)=>{
                    onlyPrimaryTicker+='{ticker:"'+k+'"},'
                  })
                }
                else{
                  onlyPrimaryTicker+='{ticker:"'+onlyTickerArr+'"},'
                }
                allAlertsAndSpecificTickers=onlyPrimaryTicker
              }
            } 
            else if(key.alert_keyword===null || key.alert_keyword===" "){
              nullAlertsAndTickers=1
            }
            else{
              if(key.ticker==="$"){
                onlyTitleArr=key.ticker
                if(onlyTitleArr.includes(',')){
                  onlyTitleArrValue=onlyTitleArr.split(",")
                  onlyTitleArrValue.forEach((k,i)=>{
                    onlyPrimaryTitle+='{title:"'+k+'"},'
                  })
                }
                else{
                  onlyPrimaryTitle+='{title:"'+onlyTitleArr+'"},'
                }
                
                SpecificAlertsAndAllTickers=onlyPrimaryTitle
              }
              else if(key.ticker===null || key.ticker===" "){
                alertsAndNullTickers=1
              }
              else{
                currentTitle=key.alert_keyword
                currentTicker=key.ticker
                if(currentTitle.includes(',')){
                  mainTitle=currentTitle.split(",")
                  mainTitle.forEach((k,i)=>{
                    primaryTitle+='{title:"'+k+'"},'
                  })
                }
                else{
                  primaryTitle+='{title:"'+currentTitle+'"},'
                }
                //console.log(secondaryTitle)
                if(currentTicker.includes(',')){
                  mainTicker=currentTicker.split(",")
                  mainTicker.forEach((k,i)=>{
                    primaryTicker+='{ticker:"'+k+'"},'
                  })
                }
                else{
                  primaryTicker+='{ticker:"'+currentTicker+'"},'
                }
                SpecificAlertsAndTickers=primaryTitle+primaryTicker
              }
           
          }
        })
        }
      }
     })
 
var newAlertValue, alertValue,specAlertValue;
if(allAlertsAndTickers!==null){
  app.models.tradingview_alerts.count({where:{and:[{and:[{title:{"neq":" "}},{ticker:{"neq":" "}}]},{and:[{title:{"neq":null}},{ticker:{"neq":null}}]}]}},function(errAllCount,resultAllCount){
    if(errAllCount){
      console.log("error in count with all titles and tickers "+errAllCount)
              oldCount=1
    }
    else{
      if(!resultAllCount){
        console.log("Something went wrong in all titles and tickers count")
        oldCount=2
      }
      else{
      //  console.log(resultAllCount+ " result count for all titles and tickers")
        oldCount=resultAllCount
       // newAllCount=oldCount
      //  console.log(newAllCount+ " result count for all titles and tickers new")
      }
    }
  })
}
else{
  if(allAlertsAndSpecificTickers!==null){
    onlyTicker=onlyPrimaryTicker.slice(0, -1)
    if(SpecificAlertsAndAllTickers!==null){
      onlyTitle=onlyPrimaryTitle.slice(0, -1)
      if(SpecificAlertsAndTickers!==null){
        secondaryTitle=primaryTitle.slice(0, -1)
        secondaryTicker=primaryTicker.slice(0, -1)
          app.models.tradingview_alerts.count({where:{or:[{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]},{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]},{and:[{or:[secondaryTitle]},{or:[secondaryTicker]}]}]}},function(errCount,resCount){
            if(errCount){
              console.log(errCount+" error in count of specific ")
              //console.log("error in specific count")
              oldCount=0
            }
            else{
              if(!resCount){
                console.log("something went wrong in specific count")
                oldCount=0
              }
              else{
                console.log(resCount+" count of all specific alerts and tickers")
                oldCount=resCount
              }
            }
          })
      }
      else{
        app.models.tradingview_alerts.count({where:{or:[{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]},{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]}]}},function(erronlytTitleOnlytTickerCount,resonlytTitleOnlytTickerCount){
          if(erronlytTitleOnlytTickerCount){
            console.log(erronlytTitleOnlytTickerCount+" case 3 ")
            oldCount=0
          }
          else{
            console.log(resonlytTitleOnlytTickerCount+" count of all specific alerts and tickers")
            oldCount=resonlytTitleOnlytTickerCount
          }
        })
      }
    }
    else{
      if(SpecificAlertsAndTickers!==null){
        secondaryTitle=primaryTitle.slice(0, -1)
        secondaryTicker=primaryTicker.slice(0, -1)
          app.models.tradingview_alerts.count({where:{or:[{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]},{and:[{or:[secondaryTitle]},{or:[secondaryTicker]}]}]}},function(errOnlyTickerAndTitleTickerCount,resOnlyTickerAndTitleTickerCount){
            if(errOnlyTickerAndTitleTickerCount){
              console.log(errOnlyTickerAndTitleTickerCount+" case 4 err ")
              oldCount=0
            }
            else{
                console.log(resOnlyTickerAndTitleTickerCount+" case 4 res")
                oldCount=resOnlyTickerAndTitleTickerCount
            }
          })
      }
      else{
        app.models.tradingview_alerts.count({where:{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]},function(errOnlytTickerCount,resOnlytTickerCount){
          if(errOnlytTickerCount){
            console.log(errOnlytTickerCount+" case 5 err ")
            oldCount=0
          }
          else{
            console.log(resOnlytTickerCount+" case 5 res")
            oldCount=resOnlytTickerCount
          }
        }
      })
      }
    }
  }
  else{
    if(SpecificAlertsAndAllTickers!==null){
      onlyTitle=onlyPrimaryTitle.slice(0, -1)
      if(SpecificAlertsAndTickers!==null){
        secondaryTitle=primaryTitle.slice(0, -1)
        secondaryTicker=primaryTicker.slice(0, -1)
        app.models.tradingview_alerts.count({where:{or:[{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]},{and:[{or:[secondaryTitle]},{or:[secondaryTicker]}]}]}},function(errOnlyTickerAndOnlyTitleCount,resOnlyTickerAndOnlyTitleCount){
          if(errOnlyTickerAndOnlyTitleCount){
            console.log(errOnlyTickerAndOnlyTitleCount+" case 6 err ")
            oldCount=0
          }
          else{
              console.log(resOnlyTickerAndOnlyTitleCount+" case 6 res")
              oldCount=resOnlyTickerAndOnlyTitleCount
          }
        })
      }
      else{
        app.models.tradingview_alerts.count({where:{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]}},function(errAllTickerAndOnlyTitleCount,resAllTickerAndOnlyTitleCount){
          if(errAllTickerAndOnlyTitleCount){
            console.log(errAllTickerAndOnlyTitleCount+" case 7 err ")
            oldCount=0
          }
          else{
              console.log(resAllTickerAndOnlyTitleCount+" case 7 res")
              oldCount=resAllTickerAndOnlyTitleCount
          }
        })
      }
    }
    else{
      oldCount=0
    }
  }
}

    setInterval(function() {
     
     
    if(allAlertsAndTickers===1){
      app.models.tradingview_alerts.count({where:{and:[{and:[{title:{"neq":" "}},{ticker:{"neq":" "}}]},{and:[{title:{"neq":null}},{ticker:{"neq":null}}]}]},order:"time desc"},function(errAllNewCount,resultAllCount){
       
        if(errAllNewCount){
          console.log("error in count with all titles and tickers "+errAllNewCount)
          newAllCount=1
        }
        else{
          if(!resultAllCount){
            console.log("Something went wrong in all titles and tickers count")
            newAllCount=2
          }
          else{
           
            newAllCount=resultAllCount
           
          }
        }
      })
     ////console.log("all, new count "+newAllCount)
     console.log("all, old count "+oldCount)
    
      if(newAllCount>oldCount){
        app.models.tradingview_alerts.find({where:{and:[{and:[{title:{"neq":" "}},{ticker:{"neq":" "}}]},{and:[{title:{"neq":null}},{ticker:{"neq":null}}]}]},order:"time desc",limit:newAllCount-oldCount},function(errAll,resAll){
          if(errAll){
            console.log(errAll+" All tickers and titles")
           
          }
          else{
            if(resAll){
                
                newAlertValue="Hi, you have some new alerts "
                resAll.forEach((k,i)=>{
                  newAlertValue+=k.title+','
                  reqTitle1=k.title
                  reqTicker1=k.ticker
                })
                alertValue=newAlertValue.slice(0, -1)
              console.log(alertValue+" all titles and tickers with new alerts")
              generalChannel.send(alertValue)
              alertsChannel.send(alertValue)
              newPost={
                id:1,
                reqTitle:reqTitle1,
                reqTicker:reqTicker1
              }
              sendPostRequest(newPost);
            }
          }
        })
        oldCount=newAllCount
      }
      else{
       alertValue="Hi, your alerts are up to date"
        console.log("Hi, your all alerts are up to date")
       alertsChannel.send(alertValue)
       generalChannel.send(alertValue)
       if((reqTitle1!=='' &&reqTitle1!==null )&& (reqTicker1!==''&& reqTicker1!==null)){
         console.log(reqTitle1,reqTicker1)
        newPost={
          id:1,
          reqTitle:reqTitle1,
          reqTicker:reqTicker1
        }
       }
       else{
        newPost={
          id:1,
          reqTitle:'XY',
          reqTicker:'MNO'
        }
       }
       
       sendPostRequest(newPost);
    
    }
    }
    else{
      if(allAlertsAndSpecificTickers!==null){
        onlyTicker=onlyPrimaryTicker.slice(0, -1)
        if(SpecificAlertsAndAllTickers!==null){
          onlyTitle=onlyPrimaryTitle.slice(0, -1)
          if(SpecificAlertsAndTickers!==null){
            secondaryTitle=primaryTitle.slice(0, -1)
            secondaryTicker=primaryTicker.slice(0, -1)
            app.models.tradingview_alerts.count({where:{or:[{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]},{and:[{and:[{title:{"neq":" "}},{title:{"neq":null}}]},onlyTicker]},{and:[{or:[secondaryTitle]},{or:[secondaryTicker]}]}]}},function(errSpecCount,resSpecCount){
              if(errSpecCount){
                console.log(errSpecCount+" error in count of specific ")
                console.log("error in specific count")
                newSpecCount=0
              }
              else{
                if(!resSpecCount){
                  console.log("something went wrong in specific count")
                  newSpecCount=0
                }
                else{
                  console.log(resSpecCount+" count of all specific alerts and tickers")
                  newSpecCount=resSpecCount
                }
              }
            })
           console.log("specific, new count"+newSpecCount)
           console.log("specific, old count"+oldCount)
            if(newSpecCount>oldCount){
              app.models.tradingview_alerts.find({where:{or:[{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]},{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]},{and:[{or:[secondaryTitle]},{or:[secondaryTicker]}]}]},order:"time desc",limit:newSpecCount-oldCount},function(err,res){
                if(err){
                  console.log(err+"error and all other conditions with alert values")
                  console.log("error in conditions")
                }
                else{
                  if(res){
                      newAlertValue="Hi, you have some new alerts "
                      res.forEach((k,i)=>{
                        newAlertValue+=k.title+','
                        reqTitle1=k.title
                        reqTicker1=k.ticker
                      })
                      specAlertValue=newAlertValue.slice(0, -1)
                    console.log(specAlertValue+" alerts for all other conditions")
                    generalChannel.send(specAlertValue)
                    alertsChannel.send(alertValue)
                    newPost={
                      id:1,
                      reqTitle:reqTitle1,
                      reqTicker:reqTicker1
                    }
                    sendPostRequest(newPost);
                  }
                }
              })
              oldCount=newSpecCount
            }
            else{
              specAlertValue="Hi, your alerts are up to date"
              console.log("Hi, your spec alerts are up to date")
              generalChannel.send(specAlertValue)
              alertsChannel.send(alertValue)
              if((reqTitle1!=="" ||reqTitle1!==null )&& (reqTicker1!==""|| reqTicker1!==null)){
                console.log(reqTitle1,reqTicker1)
               newPost={
                 id:1,
                 reqTitle:reqTitle1,
                 reqTicker:reqTicker1
               }
              }
              else{
               newPost={
                 id:1,
                 reqTitle:'XY',
                 reqTicker:'MNO'
               }
              }
              sendPostRequest(newPost);
            }
          }
          else{
            app.models.tradingview_alerts.count({where:{or:[{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]},{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]}]}},function(erronlytTitleOnlytTickerresCount,resonlytTitleOnlytTickerresCount){
              if(erronlytTitleOnlytTickerresCount){
                console.log(erronlytTitleOnlytTickerresCount+" case 3 alert count err ")
                oldCount=0
              }
              else{
                console.log(resonlytTitleOnlytTickerresCount+" case 3 alert count res")
                newSpecCount=resonlytTitleOnlytTickerresCount
              }
            })
            console.log("specific, new count"+newSpecCount)
            console.log("specific, old count"+oldCount)
             if(newSpecCount>oldCount){
               app.models.tradingview_alerts.find({where:{or:[{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]},{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]}]},order:"time desc",limit:newSpecCount-oldCount},function(erronlytTitleOnlytTickerres,resonlytTitleOnlytTickerres){
                 if(erronlytTitleOnlytTickerres){
                   console.log(erronlytTitleOnlytTickerres+"case 3 alert  err")
                 }
                 else{
                   if(resonlytTitleOnlytTickerres){
                      
                       newAlertValue="Hi, you have some new alerts "
                       resonlytTitleOnlytTickerres.forEach((k,i)=>{
                         newAlertValue+=k.title+','
                         reqTitle1=k.title
                         reqTicker1=k.ticker
                       })
                       specAlertValue=newAlertValue.slice(0, -1)
                     console.log(specAlertValue+" alerts for all other conditions")
                     generalChannel.send(specAlertValue)
                     alertsChannel.send(alertValue)
                     newPost={
                      id:1,
                      reqTitle:reqTitle1,
                      reqTicker:reqTicker1
                    }
                    sendPostRequest(newPost);
                   }
                 }
               })
               oldCount=newSpecCount
              }
              else{
                specAlertValue="Hi, your alerts are up to date"
                console.log("Hi, your spec alerts are up to date")
                generalChannel.send(specAlertValue)
                alertsChannel.send(alertValue)
                if((reqTitle1!=="" ||reqTitle1!==null )&& (reqTicker1!==""|| reqTicker1!==null)){
                 newPost={
                   id:1,
                   reqTitle:reqTitle1,
                   reqTicker:reqTicker1
                 }
                }
                else{
                 newPost={
                   id:1,
                   reqTitle:'XY',
                   reqTicker:'MNO'
                 }
                }
                sendPostRequest(newPost);
              }
          }
        }
        else{
          if(SpecificAlertsAndTickers!==null){
            secondaryTitle=primaryTitle.slice(0, -1)
            secondaryTicker=primaryTicker.slice(0, -1)
            app.models.tradingview_alerts.count({where:{or:[{and:[{and:[{title:{"neq":" "}},{title:{"neq":null}}]},onlyTicker]},{and:[{or:[secondaryTitle]},{or:[secondaryTicker]}]}]}},function(errSpecalertCount,resSpecalertCount){
              if(errSpecalertCount){
                console.log(errSpecalertCount+" case 4 alert count err ")
                newSpecCount=0
              }
              else{
                  console.log(resSpecalertCount+" case 4 alert count err ")
                  newSpecCount=resSpecalertCount
                }
            })
            if(newSpecCount>oldCount){
              app.models.tradingview_alerts.find({where:{or:[{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]},{and:[{or:[secondaryTitle]},{or:[secondaryTicker]}]}]},order:"time desc",limit:newSpecCount-oldCount},function(errSpecalertRes,SpecalertRes){
                if(errSpecalertRes){
                  console.log(errSpecalertRes+"case 5 alert count err")
                }
                else{
                  if(SpecalertRes){
                      //alertValue="Hi, you have new alerts "+res[0].title
                      newAlertValue="Hi, you have some new alerts "
                      SpecalertRes.forEach((k,i)=>{
                        newAlertValue+=k.title+','
                        reqTitle1=k.title
                         reqTicker1=k.ticker
                      })
                      specAlertValue=newAlertValue.slice(0, -1)
                    console.log(specAlertValue+" case 5 alert count res")
                    generalChannel.send(specAlertValue)
                    alertsChannel.send(alertValue)
                    newPost={
                      id:1,
                      reqTitle:reqTitle1,
                      reqTicker:reqTicker1
                    }
                    sendPostRequest(newPost);
                  }
                }
              })
              oldCount=newSpecCount
            }
            else{
              specAlertValue="Hi, your alerts are up to date"
              console.log("Hi, your spec alerts are up to date")
              generalChannel.send(specAlertValue)
              alertsChannel.send(alertValue)
              if((reqTitle1!=="" ||reqTitle1!==null )&& (reqTicker1!==""|| reqTicker1!==null)){
                newPost={
                  id:1,
                  reqTitle:reqTitle1,
                  reqTicker:reqTicker1
                }
               }
               else{
                newPost={
                  id:1,
                  reqTitle:'XY',
                  reqTicker:'MNO'
                }
               }
               sendPostRequest(newPost);
            }
          }
          else{
            app.models.tradingview_alerts.count({where:{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]},function(errOnlytTickerAlertCount,resOnlytTickerAlertCount){
              if(errOnlytTickerAlertCount){
                console.log(errOnlytTickerAlertCount+" case 6 alert count err ")
                newSpecCount=0
              }
              else{
                console.log(resOnlytTickerAlertCount+" case 6 alert count res")
                newSpecCount=resOnlytTickerAlertCount
              }
            }
          })
          if(newSpecCount>oldCount){
            app.models.tradingview_alerts.find({where:{and:[{title:{"neq":" "}},{and:[{title:{"neq":null}}]},onlyTicker]},order:"time desc",limit:newSpecCount-oldCount},function(errOnlytTickerAlert,OnlytTickerAlertRes){
              if(errOnlytTickerAlert){
                console.log(errOnlytTickerAlert+"case 6 alert  err")
              }
              else{
                if(OnlytTickerAlertRes){
                    //alertValue="Hi, you have new alerts "+res[0].title
                    newAlertValue="Hi, you have some new alerts "
                    OnlytTickerAlertRes.forEach((k,i)=>{
                      newAlertValue+=k.title+','
                      reqTitle1=k.title
                      reqTicker1=k.ticker
                    })
                    specAlertValue=newAlertValue.slice(0, -1)
                  console.log(specAlertValue+" alerts for all other conditions")
                  generalChannel.send(specAlertValue)
                  alertsChannel.send(alertValue)
                  newPost={
                    id:1,
                    reqTitle:reqTitle1,
                    reqTicker:reqTicker1
                  }
                  sendPostRequest(newPost);
                }
              }
            })
            oldCount=newSpecCount
          }
          else{
            specAlertValue="Hi, your alerts are up to date"
            console.log("Hi, your spec alerts are up to date")
            generalChannel.send(specAlertValue)
            alertsChannel.send(alertValue)
            if((reqTitle1!=="" ||reqTitle1!==null )&& (reqTicker1!==""|| reqTicker1!==null)){
              newPost={
                id:1,
                reqTitle:reqTitle1,
                reqTicker:reqTicker1
              }
             }
             else{
              newPost={
                id:1,
                reqTitle:'XY',
                reqTicker:'MNO'
              }
             }
             sendPostRequest(newPost);
          }
          }
        }
      }
      else{
        if(SpecificAlertsAndAllTickers!==null){
          onlyTitle=onlyPrimaryTitle.slice(0, -1)
          if(SpecificAlertsAndTickers!==null){
            secondaryTitle=primaryTitle.slice(0, -1)
            secondaryTicker=primaryTicker.slice(0, -1)
            app.models.tradingview_alerts.count({where:{or:[{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]},{and:[{or:[secondaryTitle]},{or:[secondaryTicker]}]}]}},function(errOnlyTickerAndOnlyTitleAlertCount,resOnlyTickerAndOnlyTitleAlertCount){
              if(errOnlyTickerAndOnlyTitleAlertCount){
                console.log(errOnlyTickerAndOnlyTitleAlertCount+" case 6 alert count err ")
                newSpecCount=0
              }
              else{
                  console.log(resOnlyTickerAndOnlyTitleAlertCount+" case 6 alert count res")
                  newSpecCount=resOnlyTickerAndOnlyTitleAlertCount
              }
            })
            if(newSpecCount>oldCount){
              app.models.tradingview_alerts.find({where:{or:[{and:[{ticker:{"neq":" "}},{and:[{ticker:{"neq":null}}]},onlyTitle]},{and:[{or:[secondaryTitle]},{or:[secondaryTicker]}]}]},order:"time desc",limit:newSpecCount-oldCount},function(errOnlyTickerAndOnlyTitleAlert,resOnlyTickerAndOnlyTitleAlertRes){
                if(errOnlyTickerAndOnlyTitleAlert){
                  console.log(errOnlyTickerAndOnlyTitleAlert+"case 6 alert res err")
                }
                else{
                  if(resOnlyTickerAndOnlyTitleAlertRes){
                      //alertValue="Hi, you have new alerts "+res[0].title
                      newAlertValue="Hi, you have some new alerts "
                      resOnlyTickerAndOnlyTitleAlertRes.forEach((k,i)=>{
                        newAlertValue+=k.title+','
                        reqTitle1=k.title
                        reqTicker1=k.ticker
                      })
                      specAlertValue=newAlertValue.slice(0, -1)
                    console.log(specAlertValue+" case 6 alert  res")
                    generalChannel.send(specAlertValue)
                    alertsChannel.send(alertValue)
                    newPost={
                      id:1,
                      reqTitle:reqTitle1,
                      reqTicker:reqTicker1
                    }
                    sendPostRequest(newPost);
                  }
                }
              })
              oldCount=newSpecCount
            }
            else{
              specAlertValue="Hi, your alerts are up to date"
              console.log("Hi, your spec alerts are up to date")
              generalChannel.send(specAlertValue)
              alertsChannel.send(alertValue)
              if((reqTitle1!=="" ||reqTitle1!==null )&& (reqTicker1!==""|| reqTicker1!==null)){
                newPost={
                  id:1,
                  reqTitle:reqTitle1,
                  reqTicker:reqTicker1
                }
               }
               else{
                newPost={
                  id:1,
                  reqTitle:'XY',
                  reqTicker:'MNO'
                }
               }
               sendPostRequest(newPost);
            }
          }
          else{
            app.models.tradingview_alerts.count({where:{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]}},function(errAllTickerAndOnlyTitleAlertCount,resAllTickerAndOnlyTitleAlertCount){
              if(errAllTickerAndOnlyTitleAlertCount){
                console.log(errAllTickerAndOnlyTitleAlertCount+" case 7 alert count err ")
                newSpecCount=0
              }
              else{
                  console.log(resAllTickerAndOnlyTitleAlertCount+" case 7 alert count res")
                  newSpecCount=resAllTickerAndOnlyTitleAlertCount
              }
            })
            if(newSpecCount>oldCount){
              app.models.tradingview_alerts.find({where:{and:[onlyTitle,{and:[{ticker:{"neq":" "}},{ticker:{"neq":null}}]}]},order:"time desc",limit:newSpecCount-oldCount},function(errAllTickerAndOnlyTitleAlert,resAllTickerAndOnlyTitleAlert){
                if(errAllTickerAndOnlyTitleAlert){
                  console.log(errAllTickerAndOnlyTitleAlert+"case 6 alert res err")
                }
                else{
                  if(resAllTickerAndOnlyTitleAlert){
                      //alertValue="Hi, you have new alerts "+res[0].title
                      newAlertValue="Hi, you have some new alerts "
                      resAllTickerAndOnlyTitleAlert.forEach((k,i)=>{
                        newAlertValue+=k.title+','
                        reqTitle1=k.title
                        reqTicker1=k.ticker
                      })
                      specAlertValue=newAlertValue.slice(0, -1)
                    console.log(specAlertValue+" case 6 alert  res")
                    generalChannel.send(specAlertValue)
                    alertsChannel.send(alertValue)
                    newPost={
                      id:1,
                      reqTitle:reqTitle1,
                      reqTicker:reqTicker1
                    }
                    sendPostRequest(newPost);
                  }
                }
              })
              oldCount=newSpecCount
            }
            else{
              specAlertValue="Hi, your alerts are up to date"
              console.log("Hi, your spec alerts are up to date")
              generalChannel.send(specAlertValue)
              alertsChannel.send(alertValue)
              if((reqTitle1!==" " ||reqTitle1!==null) && (reqTicker1!==" "||reqTicker1!==null)){
                newPost={
                  id:1,
                  reqTitle:reqTitle1,
                  reqTicker:reqTicker1
                }
               }
               else{
                newPost={
                  id:1,
                  reqTitle:'XY',
                  reqTicker:'MNO'
                }
               }
               sendPostRequest(newPost);
            }
          }
        }
        else{
          specAlertValue="Hi, your alerts are up to date"
            console.log("Hi, your spec alerts are up to date")
            generalChannel.send(specAlertValue)
            alertsChannel.send(alertValue)
            if((reqTitle1!=="" ||reqTitle1!==null )&& (reqTicker1!==""|| reqTicker1!==null)){
              newPost={
                id:1,
                reqTitle:reqTitle1,
                reqTicker:reqTicker1
              }
             }
             else{
              newPost={
                id:1,
                reqTitle:'XY',
                reqTicker:'MNO'
              }
             }
             sendPostRequest(newPost);
        }
      }
    }
        //generalChannel.send(alertValue)
    }, checkthe_interval);

  })
client.login("OTQ3OTE1OTc1OTcyNTA3NzE4.Yh0NjA.geJKP-D07fO9yiCFTrAPPq5PnR4")
app.start = function () { 
    app.use(function (req, response, next) {
      // // console.log('in cors');
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Credentials", "true");
      response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      next();
    });
  
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
  };
 
  // Bootstrap the application, configure models, datasources and middleware.
  // Sub-apps like REST API are mounted via boot scripts.
  boot(app, __dirname, function (err) {
    if (err) throw err;
  
    // start the server if `$ node server.js`
    if (require.main === module)
      app.start();
    });


