"use strict";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

"use strict";

let nforce = require('nforce'),

    SF_CLIENT_ID = process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
    SF_USER_NAME = process.env.SF_USER_NAME,
    SF_PASSWORD = process.env.SF_PASSWORD,


    org = nforce.createConnection({
		environment: 'sandbox',
        clientId: SF_CLIENT_ID,
        clientSecret: SF_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/oauth/_callback',
        mode: 'single',
        autoRefresh: true
    });
	
	
let login = () => {

    org.authenticate({username: SF_USER_NAME, password: SF_PASSWORD}, err => {
        if (err) {
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
        }
    });

};


login();

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

controller.hears(['Destroyself'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `Goodbye`
    });
	bot.destroy()
});

controller.hears(['shoutout'], 'direct_message,direct_mention,mention', (bot, message) => {
    
	let person,
		reason,
		shoutoutfinal;
		
	bot.api.users.info({user: message.user}, function(err, info){
	let slackId = info.user.id		
	
	let askWho = (response, convo) => {

        convo.ask("*Who is this shoutout for?*", (response, convo) => {
            person = response.text;
			
			if(person.toUpperCase() == '')
			{
				bot.reply(message, {
				text: `Please enter a name`
				});
				askWho(response, convo);
				convo.next();
			}
			else
			{
				askReason(response, convo);
				convo.next();
			}	
			
        });
	
    }; 
	
	let askReason = (response, convo) => {

        convo.ask("*What awesome thing is this shoutout for?*", (response, convo) => {
            reason = response.text;
			
			askFinal(response, convo);
			convo.next();
			
        });

    };
	
	let askFinal = (response, convo) => {

        convo.ask("*Please confirm or cancel the shoutout below:*" + "\n" + "1. Confirm" + "\n" + "2. Cancel" + "\n" + `Shoutout to *` + person + `* for: *` + reason + '*', (response, convo) => {
            
			shoutoutfinal = response.text;
			
			if(shoutoutfinal.toUpperCase() == 'CONFIRM' || shoutoutfinal.toUpperCase() == '1. CONFIRM' || shoutoutfinal == '1' || shoutoutfinal == '1.')
				{	
			
			let q = "SELECT ID, Name FROM Shoutout_Week__c WHERE Active__c = TRUE LIMIT 1";

				org.query({ query: q }, function(err, resp){

				if(!err && resp.records) {

				var acc = resp.records[0];
				let id = acc.get('ID');
			
				salesforce.createShoutout({person: person, reason: reason, id: id, slackId: slackId})
                .then(Services_Shoutout__c => {
                    bot.reply(message, {
                       text: "Your shoutout has been submitted!"
                    });
                    convo.next();
                })
                .catch(error => {
                    bot.reply(message, error);
                    convo.next();
                });
				}
				});
				}
			else if(shoutoutfinal.toUpperCase() == 'CANCEL' || shoutoutfinal.toUpperCase() == '2. CANCEL' || shoutoutfinal == '2' || shoutoutfinal == '2.')
				{
				bot.reply(message, {
				text: `Submission cancelled!`
				});
				convo.next();
				}
			else
				{
				bot.reply(message, {
				text: `Please enter a valid response`
				});
				askFinal(response, convo);
				convo.next();
				}
			
        });

    };

	bot.reply(message, "OK, I can help you with that!" + "\n");
    bot.startConversation(message, askWho);	
});	
});


controller.hears(['vote'], 'direct_message,direct_mention,mention', (bot, message) => {
	
	let vote,
		votefinal,
		id,
		name,
		person,
		reason;
		
	
	bot.api.users.info({user: message.user}, function(err, info){
	let slackId = info.user.id		
	
	let askVote = (response, convo) => {

    convo.ask("*Which shoutout # would you like to vote for?* (Please note that you can only vote once per week)", (response, convo) => {
            
	vote = response.text;
	
		let q = "SELECT ID FROM Shoutout_Vote__c WHERE Services_Shoutout__r.Shoutout_Week__r.Open_Voting__c = TRUE AND Slack_ID__c = '"+ slackId + "' LIMIT 1";

			org.query({ query: q }, function(err, resp){
			let acc = resp.records[0];
	
		if(acc == null)
		{
			if(isNaN(vote) || vote == '0')
				{	
					bot.reply(message, " Invalid format, please enter a valid number");
					askVote(response, convo);
					convo.next();
				}				
						
			else
				{

					let q = "SELECT ID, Name, Reason__c, Recipient_Name__c FROM Services_Shoutout__c WHERE Shoutout_Week__r.Open_Voting__c = TRUE AND Request_Number__c = " + vote + " LIMIT 1";

						org.query({ query: q }, function(err, resp){
						var acc = resp.records[0];

						if(acc != null) {

						
						id = acc.get('ID');
						name = acc.get('Name');
						person = acc.get('Recipient_Name__c');
						reason = acc.get('Reason__c');
						
						askVoteFinal(response, convo);
						convo.next();
						
						}
						else{
							bot.reply(message, "Number not found, please try again");
							askVote(response, convo);
							convo.next();
							
						}
						});
					
				}
		}
		else
		{
			bot.reply(message, "Your vote has already been cast this week");
			convo.next();
		}
		});
	});
	}
	
	let askVoteFinal = (response, convo) => {

        convo.ask("*Please confirm or cancel your vote below:*" + "\n" + "1. Confirm" + "\n" + "2. Cancel" + "\n" + `Shoutout to *` + person + `* for: *` + reason + '*', (response, convo) => {
            
			votefinal = response.text;
			
			if(votefinal.toUpperCase() == 'CONFIRM' || votefinal.toUpperCase() == '1. CONFIRM' || votefinal == '1' || votefinal == '1.')
				{	
				
				salesforce.createVote({id: id, slackId: slackId})
                .then(_case => {
                    bot.reply(message, {
                       text: "Your vote has been recorded!"
                    });
                    convo.next();
                })
                .catch(error => {
                    bot.reply(message, error);
                    convo.next();
                });
				
				}
				
			else if(votefinal.toUpperCase() == 'CANCEL' || votefinal.toUpperCase() == '2. CANCEL' || votefinal == '2' || votefinal == '2.')
				{
				bot.reply(message, {
				text: `Submission cancelled!`
				});
				convo.next();
				}
				
			else
				{
				bot.reply(message, {
				text: `Please enter a valid response`
				});
				askVoteFinal(response, convo);
				convo.next();
				}
			
		});
	}
	
	let shouts
	
	let q = "SELECT ID FROM Services_Shoutout__c WHERE Shoutout_Week__r.Open_Voting__c = TRUE LIMIT 1";

			org.query({ query: q }, function(err, resp){
			let ac2 = resp.records[0];
	
	if(ac2 == null)
	{
		bot.reply(message, "*No shoutouts were submitted last week!*");
	}
	else{
		
    salesforce.findshoutouts(shouts)
        .then(shoutouts => bot.reply(message, {
            attachments: formatter.formatShoutouts(shoutouts)
        }))
        .catch(error => bot.reply(message, error));
	
	bot.reply(message, "*Here are last week's shoutouts: *");
	
		
	setTimeout(function(){bot.startConversation(message, askVote);}, 500);	
	}
	});
	});
});


controller.hears(['(.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
	
	bot.api.users.info({user: message.user}, function(err, info){
	let first = info.user.profile.first_name
	let last = info.user.profile.last_name
	
    bot.reply(message, {
        text: `Hi ` + first + `, I'm ShoutOutBot! \n - To submit a shoutout, type "shoutout". \n - To vote on last week's shoutouts, type "vote".`
    });
});

});
