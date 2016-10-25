"use strict";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

let Botkit = require('botkit'),
    formatter = require('./modules/slack-formatter'),
    salesforce = require('./modules/salesforce'),
	moment = require('moment'),
    controller = Botkit.slackbot(),

    bot = controller.spawn({
        token: SLACK_BOT_TOKEN
    });

bot.startRTM(err => {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});



controller.hears(['hello', 'hi', 'hey', 'greetings', 'help'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `Hello, I'm Resourcingbot! \n To create a resource request in Salesforce, please type "Create Case". \n To search for cases type "Find my open cases" or "Find my closed cases"`
    });
});



controller.hears(['Find my open cases'], 'direct_message,direct_mention,mention', (bot, message) => {
	
	bot.api.users.info({user: message.user}, function(err, info){
    let email = info.user.profile.email
	let name = info.user.profile.first_name + " " + info.user.profile.last_name
	
    salesforce.findmyopencases(email)
        .then(cases => bot.reply(message, {
            text: "I found these open cases created by " + name + ":",
            attachments: formatter.formatOpenCases(cases)
        }))
        .catch(error => bot.reply(message, error));
	})	

});

controller.hears(['Find my closed cases'], 'direct_message,direct_mention,mention', (bot, message) => {
	
	bot.api.users.info({user: message.user}, function(err, info){
    let email = info.user.profile.email
	let name = info.user.profile.first_name + " " + info.user.profile.last_name
	
    salesforce.findmyclosedcases(email)
        .then(cases => bot.reply(message, {
            text: "I found these closed cases created by " + name + ":",
            attachments: formatter.formatClosedCases(cases)
        }))
        .catch(error => bot.reply(message, error));
	})	

});



controller.hears(['create case', 'new case'], 'direct_message,direct_mention,mention', (bot, message) => {

    let subject,
		scope,
        description,
		date,
		PJM,
		PJM2,
		AM,
		AM2,
		SE,
		SE2,
		AS,
		AS2,
		finalize,
		retry;
		
		moment().format();
		
	bot.api.users.info({user: message.user}, function(err, info){
    let email = info.user.profile.email
	let name = info.user.profile.first_name + " " + info.user.profile.last_name
	
  

   let askSubject = (response, convo) => {

        convo.ask("*What is the subject?*", (response, convo) => {
            subject = response.text;
			
			if(subject.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
				askDate(response, convo);
				convo.next();
			}	
			
        });

    }; 
	
	let askDate = (response, convo) => {

        convo.ask("*When are the assignments due?* (Please format the date as YYYY-MM-DD)", (response, convo) => {
            date = response.text;
			var today = moment();
			var re = /^\d{4}-\d{2}-\d{2}$/
			
			if(date.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
	
	if(moment(date, "YYYY-MM-DD").isValid())
		{
		if(re.test(date))
		{
			if(moment(date).isSame(today, 'day') || moment(date).isBefore(today, 'day') )
			{
				bot.reply(message, {
				text: "Date value must be in the future, please try again"
				});
				askDate(response, convo);
				convo.next();
			}
			else
			{
				askPJM(response, convo);
				convo.next();
			}
			}
			else
			{
				bot.reply(message, {
				text: `Invalid date format, please try again`
			});
				askDate(response, convo);
				convo.next();
			}	
		}
		else
		{
			bot.reply(message, {
				text: `Invalid date format, please try again`
			});
				askDate(response, convo);
				convo.next();
		}
            }
		});
    }; 
	
    let askPJM = (response, convo) => {
		

        convo.ask("*Does the project require a Project Manager?*"+ "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
            PJM = response.text;
			if(PJM.toUpperCase() == 'YES' || PJM.toUpperCase() == '1. YES' || PJM == '1' || PJM == '1.')
				{
					PJM = 'true';
					PJM2 = 'Yes';
					askAM(response, convo);
					convo.next();
				}
				else if(PJM.toUpperCase() == 'NO' || PJM.toUpperCase() == '2. NO' || PJM == '2' || PJM == '2.')
				{
					PJM = 'false';
					PJM2 = 'No';
					askAM(response, convo);
					convo.next();
				}
				else if(PJM.toUpperCase() == "'!CANCEL'" || PJM.toUpperCase() == '!CANCEL')
				{
					askRetry(response, convo);
					convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askPJM(response, convo);
					convo.next();	
				}
        });

    };
	
	    let askAM = (response, convo) => {
		

        convo.ask("*Does the project require an Account Manager?*"+ "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
            AM = response.text;
			if(AM.toUpperCase() == 'YES' || AM.toUpperCase() == '1. YES' || AM == '1' || AM == '1.')
				{
					AM = 'true';
					AM2 = 'Yes';
					askSE(response, convo);
					convo.next();
				}
				else if(AM.toUpperCase() == 'NO' || AM.toUpperCase() == '2. NO' || AM == '2' || AM == '2.')
				{
					AM = 'false';
					AM2 = 'No';
					askSE(response, convo);
					convo.next();
				}
				else if(AM.toUpperCase() == "'!CANCEL'" || AM.toUpperCase() == '!CANCEL')
				{
					askRetry(response, convo);
					convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askAM(response, convo);
					convo.next();	
				}
        });

    };
	
	   let askSE = (response, convo) => {

        convo.ask("*Does the project require a Solutions Engineer?*"+ "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
            SE = response.text;
			if(SE.toUpperCase() == 'YES' || SE.toUpperCase() == '1. YES' || SE == '1' || SE == '1.')
				{
					SE = 'true';
					SE2 = 'Yes';
					askAS(response, convo);
					convo.next();
				}
				else if(SE.toUpperCase() == 'NO' || SE.toUpperCase() == '2. NO' || SE == '2' || SE == '2.')
				{
					SE = 'false';
					SE2 = 'No';
					askAS(response, convo);
					convo.next();
				}
				else if(SE.toUpperCase() == "'!CANCEL'" || SE.toUpperCase() == '!CANCEL')
				{
					askRetry(response, convo);
					convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askSE(response, convo);
					convo.next();	
				}
			});

		};
		
	let askAS = (response, convo) => {

        convo.ask("*Does the project require Advisory Services support?*"+ "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
            AS = response.text;
			    
				
				if(AS.toUpperCase() == 'YES' || AS.toUpperCase() == '1. YES' || AS == '1' || AS == '1.')
				{
					AS = 'true';
					AS2 = 'Yes';
					
					if(PJM2 == 'No' && AM2 == 'No'&& SE2 == 'No'&& AS2 == 'No')
				    { 
					 bot.reply(message, "At least one assignment type is required to create a case");
					 askPJM(response, convo);
					 convo.next();
				    }
					else
					{
					askScope(response, convo);
					convo.next();
					}
				}
				else if(AS.toUpperCase() == 'NO' || AS.toUpperCase() == '2. NO' || AS == '2' || AS == '2.')
				{
					AS = 'false';
					AS2 = 'No';
					
					if(PJM2 == 'No' && AM2 == 'No'&& SE2 == 'No'&& AS2 == 'No')
				    { 
					 bot.reply(message, "At least one assignment type is required to create a case");
					 askPJM(response, convo);
					 convo.next();
				    }
					else
					{
					 askScope(response, convo);
					 convo.next();
					}
				}
				else if(AS.toUpperCase() == "'!CANCEL'" || AS.toUpperCase() == '!CANCEL')
				{
					askRetry(response, convo);
					convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askAS(response, convo);
					convo.next();	
				}
			});

		};	

    let askScope = (response, convo) => {

        convo.ask("*What is the project's scope?* (Please define responsibilities by resource role)", (response, convo) => {
            scope = response.text;
			
			if(scope.toUpperCase() == '!CANCEL' || scope.toUpperCase() =="'!CANCEL'" )
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
				askDescription(response, convo);
				convo.next();
			
			}
			});

    };
	
	
    let askDescription = (response, convo) => {

        convo.ask("*Enter a description for the case*", (response, convo) => {
            description = response.text;
			
			if(description.toUpperCase() == '!CANCEL' || description.toUpperCase() == "CANCEL" )
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
				bot.reply(message, {
				"attachments": [
				{
					"fallback": "Confirmation of submission",
					"color": "#36a64f",
					"pretext": "Please review case details below:",
					"fields": [
                {
                    "title": "Case Subject:",
                    "value": subject,
                    "short": true
                },
				{
                    "title": "Assignment Due Date:",
                    "value": date,
                    "short": true
                },
				{
                    "title": "Project Scope:",
                    "value": scope,
                    "short": false
                },
				{
                    "title": "Project Description:",
                    "value": description,
                    "short": false
                },
				{
                    "title": "Project Manager Required?",
                    "value": PJM2,
                    "short": true
                },
				{
                    "title": "Account Manager Required?",
                    "value": AM2,
                    "short": true
                },
				{
                    "title": "Solutions Engineer Required?",
                    "value": SE2,
                    "short": true
                },
				{
                    "title": "Advisory Services Required?",
                    "value": AS2,
                    "short": true
                }
            ],
          
        }
    ]
    });
				askFinalize(response, convo);
				convo.next();
			}	
        });

	};
	
	let askFinalize = (response, convo) => {
		
		//convo.ask("*Please review case details below:*" + "\n" + "\n" + "*Subject:* " + subject + "\n" + "\n" + "*Due Date:* " + date + "\n" + "\n" +"*Project Scope:* " + scope + "\n" + "\n" + "*Description:* " + description + "\n" + "\n" + "*Project Manager Required?:* " + PJM2 + "\n" + "*Account Manager Required?:* " + AM2 + "\n" + "*Solutions Engineer Required?:* " + SE2 + "\n" + "*Advisory Services Required?:* " + AS2 + "\n" + "\n" + 'Please type *CONFIRM* to create the case or type *CANCEL* to cancel submission', (response, convo) => {
			
		convo.ask('Please type *CONFIRM* to create the case or type *CANCEL* to cancel submission', (response, convo) => {
		
		
		
            finalize = response.text;
			
			if(finalize.toUpperCase() == '!CANCEL' || finalize.toUpperCase() =="'!CANCEL'" || finalize.toUpperCase() == "CANCEL" )
			{
				askRetry(response, convo);
				convo.next();
			}
			else if(finalize.toUpperCase() == 'CONFIRM')
			{	
				salesforce.createCase({subject: subject, description: description, scope: scope, name: name, email: email, PJM: PJM, AM: AM, SE: SE, AS: AS, date: date})
                .then(_case => {
                    bot.reply(message, {
                       text: "Your resourcing case has been generated:",
                        attachments: formatter.formatCase(_case)
                    });
                    convo.next();
                })
                .catch(error => {
                    bot.reply(message, error);
                    convo.next();
                });
			}
			else
			{
				bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				askFinalize(response, convo);
				convo.next();	
			}
		});

	};	
			
			
	let askRetry = (response, convo) => {
		
			convo.ask('Case creation cancelled.' + "\n" + "\n" + '*Would you like to create another resource case?*' + "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
			retry = response.text;	
			if(retry.toUpperCase() == 'YES' || retry.toUpperCase() == '1. YES' || retry == '1' || retry == '1.')
				{
					askSubject(response, convo);
					convo.next();
				}
				else if(retry.toUpperCase() == 'NO' || retry.toUpperCase() == '2. NO' || retry == '2' || retry == '2.')
				{
				   bot.reply(message, "Goodbye");
				   convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askRetry(response, convo);
				   convo.next();	
				}
				
			});

		};	
		

    bot.reply(message, "OK, I can help you with that!" + "\n"  + "*Please note:* You can cancel at any time by typing *_!cancel_*" + "\n");
    bot.startConversation(message, askSubject);
	
	})
 });



controller.hears(['(.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `I'm sorry, I didn't understand that. \n To create a resource request in Salesforce, please type "Create Case". \n To search for cases type "Find my open cases" or "Find my closed cases""`
    });
});
