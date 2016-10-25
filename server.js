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
	
    bot.api.users.info({user: message.user}, function(err, info){
	let first = info.user.profile.first_name
	
	
	bot.reply(message, {
        text: `Hello ` + first + `, I'm Resourcingbot! \n To create a resource request in Salesforce, please type "Create Case". \n To search for cases type "Find my open cases", "Find my closed cases" or "Find case number 1234"`
    });
	});
});



controller.hears(['Destroyself'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `Goodbye`
    });
	bot.destroy()
});

controller.hears(['test'], 'direct_message,direct_mention,mention', (bot, message) => {
     bot.reply(message, {
        text: `Goodbye \n hello`
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

controller.hears(['find case number (.*)', 'case number (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let casenumber = message.match[1];
    salesforce.findcasenumber(casenumber)
        .then(cases => bot.reply(message, {
            text: "I found this case matching number '" + casenumber + "':",
            attachments: formatter.formatClosedCases(cases)
        }))
        .catch(error => bot.reply(message, error));

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
		hours,
		start,
		live,
		PJM,
		PJM2,
		AM,
		AM2,
		SE,
		SE2,
		AS,
		AS2,
		edit,
		finalize,
		complete,
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
				if(complete == '1')
				{
					askFinalize(response, convo);
					convo.next();
				}
				else
				{
					askDate(response, convo);
					convo.next();
				}
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
			else if(moment(date).isAfter(start, 'day') && complete == '1')
			{
				bot.reply(message, {
				text: "Assignment due date value must be before the Projected Project Start Date (" + start + "), please try again"
				});
				askDate(response, convo);
				convo.next();
			}
			else
			{
				if(complete == '1')
				{
					askFinalize(response, convo);
					convo.next();
				}
				else
				{
					askStart(response, convo);
					convo.next();
				}
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
	
	let askStart = (response, convo) => {

        convo.ask("*What is the project target start date?* (Please format the date as YYYY-MM-DD)", (response, convo) => {
            start = response.text;
			var today = moment();
			var re = /^\d{4}-\d{2}-\d{2}$/
			
			if(start.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
	
	if(moment(start, "YYYY-MM-DD").isValid())
		{
		if(re.test(start))
		{
			if(moment(start).isSame(today, 'day') || moment(start).isBefore(today, 'day') )
			{
				bot.reply(message, {
				text: "Date value must be in the future, please try again"
				});
				askStart(response, convo);
				convo.next();
			}
			else if(moment(start).isBefore(date, 'day'))
			{
				bot.reply(message, {
				text: "Target Start Date value must be after the Assignment Due Date (" + date + ") , please try again"
				});
				askStart(response, convo);
				convo.next();
			}
			else if(complete == '1' && moment(start).isAfter(live, 'day'))
			{
				bot.reply(message, {
				text: "Target Start Date value must be before the Project Live Date (" + live + ") , please try again"
				});
				askStart(response, convo);
				convo.next();
			}
			else
			{
				if(complete == '1')
				{
					askFinalize(response, convo);
					convo.next();
				}
				else
				{
					askLive(response, convo);
					convo.next();
				}
			}
			}
		else
		{
			bot.reply(message, {
			text: `Invalid date format, please try again`
			});
			askStart(response, convo);
			convo.next();
		}	
		}
	else
	{
		bot.reply(message, {
		text: `Invalid date format, please try again`
		});
		askStart(response, convo);
		convo.next();
		}
        }
		});
    }; 
	

	let askLive = (response, convo) => {

        convo.ask("*What is the project target live date?* (Please format the date as YYYY-MM-DD)", (response, convo) => {
            live = response.text;
			var today = moment();
			var re = /^\d{4}-\d{2}-\d{2}$/
			
			if(live.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
	
	if(moment(live, "YYYY-MM-DD").isValid())
		{
		if(re.test(live))
		{
			if(moment(live).isSame(today, 'day') || moment(live).isBefore(today, 'day') )
			{
				bot.reply(message, {
				text: "Date value must be in the future, please try again"
				});
				askLive(response, convo);
				convo.next();
			}
			else if(moment(live).isBefore(start, 'day'))
			{
				bot.reply(message, {
				text: "Target Live Date value must be after the Target Start Date (" + start + ") , please try again"
				});
				askLive(response, convo);
				convo.next();
			}
			else
			{
				if(complete == '1')
				{
					askFinalize(response, convo);
					convo.next();
				}
				else
				{
					askHours(response, convo);
					convo.next();
				}
			}
		}
		else
		{
			bot.reply(message, {
			text: `Invalid date format, please try again`
			});
			askLive(response, convo);
			convo.next();
		}	
		}
		else
		{
			bot.reply(message, {
				text: `Invalid date format, please try again`
			});
				askLive(response, convo);
				convo.next();
		}
            }
		});
    }; 
	
	
	
    let askHours = (response, convo) => {
		
		convo.ask("*What is the estimated amount of hours for this project?* (Please enter numerical values only)", (response, convo) => {
            hours = response.text;
			
			if(hours.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
				if(isNaN(hours))
				{
				   bot.reply(message, "Invalid format, please enter a valid number");
 				   askHours(response, convo);
				   convo.next();	
				}
				else
				{
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
						askPJM(response, convo);
						convo.next();
					}
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
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
						askAM(response, convo);
						convo.next();
					}
				}
				else if(PJM.toUpperCase() == 'NO' || PJM.toUpperCase() == '2. NO' || PJM == '2' || PJM == '2.')
				{
					PJM = 'false';
					PJM2 = 'No';
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
						askAM(response, convo);
						convo.next();
					}
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
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
					askSE(response, convo);
					convo.next();
					}
				}
				else if(AM.toUpperCase() == 'NO' || AM.toUpperCase() == '2. NO' || AM == '2' || AM == '2.')
				{
					AM = 'false';
					AM2 = 'No';
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
					askSE(response, convo);
					convo.next();
					}
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
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
					askAS(response, convo);
					convo.next();
					}
				}
				else if(SE.toUpperCase() == 'NO' || SE.toUpperCase() == '2. NO' || SE == '2' || SE == '2.')
				{
					SE = 'false';
					SE2 = 'No';
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
					askAS(response, convo);
					convo.next();
					}
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

						if(complete == '1')
						{	
						askFinalize(response, convo);
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
						if(complete == '1')
						{	
						askFinalize(response, convo);
						convo.next();
						}
						else
						{
						askScope(response, convo);
						convo.next();
						}
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
				if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
						askDescription(response, convo);
						convo.next();
					}
			
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
				askFinalize(response, convo);
				convo.next();
			}	
        });

	};
	
	let askFinalize = (response, convo) => {
		
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
                    "title": "Project Target Start Date:",
                    "value": start,
                    "short": true
                },
				{
                    "title": "Project Target Live Date:",
                    "value": live,
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
                    "title": "Estimated hours:",
                    "value": hours,
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
		convo.ask('Please type *CONFIRM* to create the case, type *EDIT* to edit the case or type *CANCEL* to cancel submission', (response, convo) => {
		
            finalize = response.text;
			
			if(finalize.toUpperCase() == '!CANCEL' || finalize.toUpperCase() =="'!CANCEL'" || finalize.toUpperCase() == "CANCEL" )
			{
				askRetry(response, convo);
				convo.next();
			}
			else if(finalize.toUpperCase() == 'EDIT')
			{
				complete = '1';
				askEdit(response, convo);
				convo.next();
			}
			
			else if(finalize.toUpperCase() == 'CONFIRM')
			{	
				salesforce.createCase({subject: subject, start: start, live: live, hours: hours, description: description, scope: scope, name: name, email: email, PJM: PJM, AM: AM, SE: SE, AS: AS, date: date})
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
	
	let askEdit = (response, convo) => {
			convo.ask(`*Which field would you like to edit?* \n 1. Subject \n 2. Assignment Due Date \n 3. Project Target Start Date \n 4. Project Target Live Date \n 5. Project Scope \n 6. Project Description \n 7. Estimated Hours \n 8. Project Manager Required? \n 9. Account Manager Required? \n 10. Solutions Engineer Required? \n 11. Advisory Services Required? \n 12. Cancel Edit`, (response, convo) => {
			edit = response.text;	
			
			if(edit.toUpperCase() == 'SUBJECT' || edit.toUpperCase() == '1. SUBJECT' || edit == '1' || edit == '1.')
			{
				askSubject(response, convo);
				convo.next();	
			}
			else if(edit.toUpperCase() == 'Assignment Due Date' || edit.toUpperCase() == '2. Assignment Due Date' || edit == '2' || edit == '2.')
			{
				askDate(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'Project Target Start Date' || edit.toUpperCase() == '3. Project Target Start Date' || edit == '3' || edit == '3.')
			{
				askStart(response, convo);
				convo.next();
				
			}
			else if(edit.toUpperCase() == 'Project Target Live Date' || edit.toUpperCase() == '4. Project Target Live Date' || edit == '4' || edit == '4.')
			{
				askLive(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'Project Scope' || edit.toUpperCase() == '5. Project Scope' || edit == '5' || edit == '5.')
			{
				askScope(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'Project Description' || edit.toUpperCase() == '6. Project Description' || edit == '6' || edit == '6.')
			{
				askDescription(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'Estimated Hours' || edit.toUpperCase() == '7. Estimated Hours' || edit == '7' || edit == '7.')
			{
				askHours(response, convo);
				convo.next();
				
			}
			else if(edit.toUpperCase() == 'Project Manager Required?' || edit.toUpperCase() == '8. Project Manager Required?' || edit == '8' || edit == '8.')
			{
				askPJM(response, convo);
				convo.next();
				
			}
			else if(edit.toUpperCase() == 'Account Manager Required?' || edit.toUpperCase() == '9. Account Manager Required?' || edit == '9' || edit == '9.')
			{
				askAM(response, convo);
				convo.next();	
			}
			else if(edit.toUpperCase() == 'Solutions Engineer Required?' || edit.toUpperCase() == '10. Solutions Engineer Required?' || edit == '10' || edit == '10.')
			{
				askSE(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'Advisory Services Required?' || edit.toUpperCase() == '11. Advisory Services Required?' || edit == '11' || edit == '11.')
			{
				askAS(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'Cancel Edit' || edit.toUpperCase() == '12. Cancel Edit' || edit == '12' || edit == '12.')
			{
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
					bot.reply(message, "OK, I can help you with that!" + "\n"  + "*Please note:* You can cancel at any time by typing *_!cancel_*" + "\n");
					complete = '0';
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
	complete = '0';
    bot.startConversation(message, askSubject);
	
	})
 });



controller.hears(['(.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `I'm sorry, I didn't understand that. \n To create a resource request in Salesforce, please type "Create Case". \n To search for cases type "Find my open cases" or "Find my closed cases""`
    });
});
