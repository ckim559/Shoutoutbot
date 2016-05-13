"use strict";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

let Botkit = require('botkit'),
    formatter = require('./modules/slack-formatter'),
    salesforce = require('./modules/salesforce'),

    controller = Botkit.slackbot(),

    bot = controller.spawn({
        token: SLACK_BOT_TOKEN
    });

bot.startRTM(err => {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});

controller.hears(['help', "'help'"], 'direct_message,direct_mention,mention', (bot, message) => {
	
   let help;
	
   let askHelp = (response, convo) => {
        convo.ask("Help Categories:" + "\n" + "1. Accounts" + "\n" + "2. Opportunities" + "\n" + "3. Contacts", (response, convo) => {
		help = response.text; 
   
   if(help.toUpperCase() == 'ACCOUNTS'|| help.toUpperCase() == '1. ACCOUNTS' || help == '1' || help == '1.')
	{
		bot.reply(message, {
        text: `Account Requests:
	- To search for an account you can ask me things like "Search account Freewheel" or "#A Freewheel"
	- To search for an account by owner, ask me "Search accounts owned by Jeff Smith or "#AO Jeff Smith"
	- For advanced search type "Account Search" or "#AS"`
		});
		convo.next();
	}
	else if(help.toUpperCase() == 'OPPORTUNITIES'|| help.toUpperCase() == '2. OPPORTUNITIES' || help == '2' || help == '2.')
	{
		bot.reply(message, {
		text: `Opportunity Requests:
	- To search for an opportunity you can ask me things like "Search opportunity NBC" or "#O NBC"
	- To search for an opportunity by owner, ask me "Search opportunities owned by Jeff Smith" or "#OO Jeff Smith"
	- For advanced search type "Opportunity Search" or "#OS"`
		});
		convo.next();
	} 
	else if(help.toUpperCase() == 'CONTACTS'|| help.toUpperCase() == '3. CONTACTS' || help == '3' || help == '3.')
	{
		bot.reply(message, {
		text: `Contact Requests:
	- To search for a contact you can ask me things like "Search contact Lisa Smith" or "#C Lisa Smith"
	- To search for a contact in an account, ask me "Search contacts in account Twitter" or "#CO Twitter"
	- For advanced search type "Contact Search" or "#CS"`
		});
		convo.next();
	}
	else
	{
		bot.reply(message, "Sorry that is not a valid option. Please try again.");
					askHelp(response, convo);
					convo.next();
	}
   });
   };
   bot.startConversation(message, askHelp);
 
});

controller.hears(['hello', 'hi', 'hey', 'greetings'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `Hello, I'm Salesforce bot! I help with various Salesforce requests. To learn more please type 'help'.`
    });
});

controller.hears(['Account Search', '#Accounts', '#Account', '#as'], 'direct_message,direct_mention,mention', (bot, message) => {

  let name,
	  type,
	  owner;

   let askName = (response, convo) => {

        convo.ask("What is the Account Name? (or enter '%' for all accounts)", (response, convo) => {
		if(name == '%' || name == "'%'")
		{
			name = '%'
		}
		else
		{
			name = response.text; 
		}
		askType(response, convo);
		convo.next();
		});

   };
   
   let askType = (response, convo) => {

        convo.ask("What is the Account Type?:" + "\n" + "1. All" + "\n" + "2. Prospect" + "\n" + "3. Client" + "\n" + "4. Former Client", (response, convo) => {
		type = response.text; 
		if(type.toUpperCase() == 'ALL' || type.toUpperCase() == '1. ALL' || type == '1' || type == '1.' || type == '%')
			{
				type = '%'; 
				askOwner(response, convo);
				convo.next();
			}
		else if(type.toUpperCase() == 'PROSPECT' || type.toUpperCase() == '2. PROSPECT' || type == '2' || type == '2.')
			{
				type = 'Prospect';
				askOwner(response, convo);
				convo.next();
			}
		else if(type.toUpperCase() == 'CLIENT' || type.toUpperCase() == '3. CLIENT' || type == '3' || type == '3.')
			{
				type = 'Client';
				askOwner(response, convo);
				convo.next();
			}
		else if(type.toUpperCase() == 'FORMER CLIENT' || type.toUpperCase() == '4. FORMER CLIENT' || type == '4' || type == '4.')
			{
				type = 'Former Client';
				askOwner(response, convo);
				convo.next();
			}	
		else 
			{
				bot.reply(message, "Sorry that is not a valid option. Please try again.");
				askType(response, convo);
				convo.next();
			};	
		});

   };
  
   
   let askOwner = (response, convo) => {
	   convo.ask("Who is the Account Owner? (or enter '%' for all owners)", (response, convo) => {
		   owner = response.text;
		   
		   if(owner == '%' || owner == "'%'")
			{
			owner = '%'; 
			}
		else {
		 owner = response.text;
			};	
			if(type == '%')
			{
				salesforce.findAccount3(owner, name)
				.then(accounts => bot.reply(message, {
				text: "Here are the matching accounts I found:",
				attachments: formatter.formatAccounts(accounts)
				}));
			}
			else
				{
				salesforce.findAccount4(owner, name, type)
				.then(accounts => bot.reply(message, {
				text: "Here are the matching accounts I found:",
				attachments: formatter.formatAccounts(accounts)
				}));
				}
			convo.next();
	   });	

	};		

 bot.reply(message, "OK, I can help you with that!");
 bot.startConversation(message, askName);	
 
});

controller.hears(['Contact Search', '#Contacts', '#Contact', '#cs'], 'direct_message,direct_mention,mention', (bot, message) => {

  let name,
	  account;

   let askName = (response, convo) => {

        convo.ask("What is the contact's name? (or enter '%' for all contacts)", (response, convo) => {
		if(name == '%' || name == "'%'")
		{
			name = '%'
		}
		else
		{
			name = response.text; 
		}
		askAccount(response, convo);
		convo.next();
		});

   };
   
   let askAccount = (response, convo) => {
	   convo.ask("What is the account name? (or enter '%' for all accounts)", (response, convo) => {
		   account = response.text;
		   
		   if(account == '%' || account == "'%'")
			{
				account = '%'; 
			}
			else 
			{
				account = response.text;
			};	
			

			salesforce.findContact3(account, name)
			.then(contacts => bot.reply(message, {
			text: "Here are the matching contacts I found:",
			attachments: formatter.formatContacts(contacts)
			}));
			
	
			convo.next();
	   });	

	};		

 bot.reply(message, "OK, I can help you with that!");
 bot.startConversation(message, askName);	
 
});

controller.hears(['Opportunity Search', '#Opportunity', '#Opportunities', '#os'], 'direct_message,direct_mention,mention', (bot, message) => {

  let name,
	  owner,
	  stage,
	  type,
	  recordt;

   let askName = (response, convo) => {

        convo.ask("What is the Account Name?  (or enter '%' for all accounts)", (response, convo) => {
		name = response.text; 
		 if(name == '%' || name == "'%'")
			{
			name = '%'; 
			}
		else {
		 owner = response.text;
			};	
		askOwner(response, convo);
		convo.next();
		});

   };
   
   let askOwner = (response, convo) => {
	   convo.ask("Who is the Opportunity Owner? (or enter '%' for all owners)", (response, convo) => {
		   owner = response.text;
		   
		   if(owner == '%' || owner == "'%'")
			{
			owner = '%'; 
			}
		else {
		 owner = response.text;
			};	
			askRT(response, convo);
			convo.next();
	   });	

	};

   let askRT = (response, convo) => {
	   convo.ask("Which Opportunity Record Type?:" + "\n" + "1. All" + "\n" + "2. Advisory Services" + "\n" + "3. FourFronts" + "\n" + "4. Partner" + "\n" + "5. Technology" + "\n" + "6. Training"", (response, convo) => {
		   recordt = response.text;
		   
		   if(recordt.toUpperCase() == 'ALL' || recordt.toUpperCase() == '1. ALL' || recordt == '1' || recordt == '1.' || recordt == '%')
		   {
			   recordt = '%';
			   askStage(response, convo);
			   convo.next();
		   }
		   else if (recordt.toUpperCase() == 'ADVISORYSERVICES'  || recordt.toUpperCase() == 'ADVISORY SERVICES' || recordt.toUpperCase() == '2. ADVISORY SERVICES' || recordt.toUpperCase() == 'AS' || recordt == '2' || recordt == '2.')
		   {
			   recordt = 'Advisory Services';
			   askStage(response, convo);
			   convo.next();
		   }
		    else if (recordt.toUpperCase() == 'FourFronts' || recordt.toUpperCase() == '3. FourFronts' || recordt.toUpperCase() == 'FF' || recordt == '3' || recordt == '3.')
		   {
			   recordt = 'FourFronts';
			   askStage(response, convo);
			   convo.next();
		   }
		    else if (recordt.toUpperCase() == 'PARTNER' || recordt.toUpperCase() == '4. PARTNER' || recordt == '4' || recordt == '4.')
		   {
			   recordt = 'Partner';
			   askStage(response, convo);
			   convo.next();
		   }
		    else if (recordt.toUpperCase() == 'TECHNOLOGY' || recordt.toUpperCase() == '5. TECHNOLOGY' || recordt.toUpperCase() == 'TECH' || recordt == '5' || recordt == '5.')
		   {
			   recordt = 'Technology';
			   askStage(response, convo);
			   convo.next();
		   }
		    else if (recordt.toUpperCase() == 'TRAINING' || recordt.toUpperCase() == '6. TRAINING' || recordt == '6' || recordt == '6.')
		   {
			   recordt = 'Training';
			   askStage(response, convo);
			   convo.next();
		   }
		   else
			{
			bot.reply(message, "Sorry that is not a valid option. Please try again.");				
			askRT(response, convo);
			convo.next();
			}
	   });
   };	
   
   let askStage = (response, convo) => {
	   convo.ask("Which Opportunity Stage Status?:" + "\n" + "1. All" + "\n" + "2. Closed Won" + "\n" + "3. Open", (response, convo) => {
		   stage = response.text;
		   
		   if(stage.toUpperCase() == 'ALL' || stage.toUpperCase() == '1. ALL' || stage == '1' || stage == '1.' || stage == '%')
		   {
			   stage = '%';
			   askType(response, convo);
			   convo.next();
		   }
		   else if (stage.toUpperCase() == 'CLOSED WON' || stage.toUpperCase() == '2. CLOSED WON' || stage == '2' || stage == '2.')
		   {
			   stage = 'Closed Won';
			   askType(response, convo);
			   convo.next();
		   }
		    else if (stage.toUpperCase() == 'OPEN' || stage.toUpperCase() == '3. OPEN' || stage == '3' || stage == '3.')
		   {
			   stage = 'Open';
			   askType(response, convo);
			   convo.next();
		   }
		   else
			{
			bot.reply(message, "Sorry that is not a valid option. Please try again.");				
			askStage(response, convo);
			convo.next();
			}
	   });
   };	
	
	let askType = (response, convo) => {
	   convo.ask("Which Opportunity Type?:" + "\n" + "1. All" + "\n" + "2. New" + "\n" + "3. Renewal" + "\n" + "4. Add On", (response, convo) => {
		   type = response.text;
				if(type.toUpperCase() == 'ALL' || type.toUpperCase() == '1. ALL' || type == '1' || type == '1.' || type == '%')
				{
					type = '%';
				}
				else if(type.toUpperCase() == 'NEW' || type.toUpperCase() == '2. NEW' || type == '2' || type == '2.')
				{
					type = 'New';
				}
				else if(type.toUpperCase() == 'RENEWAL' || type.toUpperCase() == '3. RENEWAL' || type == '3' || type == '3.')
				{
					type = 'Renewal';
				}
				else if(type.toUpperCase() == 'ADD ON' || type.toUpperCase() == '4. ADD ON' || type == '4' || type == '4.')
				{
					type = 'Add On';
				}
				else
				{
					bot.reply(message, "Sorry that is not a valid option. Please try again.");
					askType(response, convo);
					convo.next();
				}
			if(type == '%' || type == 'New' || type == 'Renewal' || type == 'Add On')
			{
				salesforce.findOpportunity4(type, owner, name, stage, recordt)
				.then(opportunities => bot.reply(message, {
				text: "Here are the matching opportunities I found:" ,
				attachments: formatter.formatOpportunities(opportunities)
				}));
				convo.next();
			}
		

		});
	};

 bot.reply(message, "OK, I can help you with that!");
 bot.startConversation(message, askName);	
 
});

controller.hears(['Destroyself'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `Goodbye`
    });
	bot.destroy()
});


controller.hears(['search account (.*)', 'search (.*) in accounts', '#a (.*)', 'find account (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findAccount(name)
        .then(accounts => bot.reply(message, {
            text: "I found these accounts matching  '" + name + "':",
            attachments: formatter.formatAccounts(accounts)
        }))
        .catch(error => bot.reply(message, error));
});

controller.hears(['search accounts owned by (.*)', 'find accounts owned by (.*)', '#ao (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findAccount2(name)
        .then(accounts => bot.reply(message, {
            text: "I found these accounts owned by  '" + name + "':",
            attachments: formatter.formatAccounts(accounts)
        }))
        .catch(error => bot.reply(message, error));
});


controller.hears(['search contact (.*)', 'find contact (.*)', '#c (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findContact(name)
        .then(contacts => bot.reply(message, {
            text: "I found these contacts matching  '" + name + "':",
            attachments: formatter.formatContacts(contacts)
        }))
        .catch(error => bot.reply(message, error));
});


controller.hears(['search contacts in Account (.*)', 'find contacts in Account (.*)', '#co (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findContact2(name)
        .then(contacts => bot.reply(message, {
            text: "I found these contacts in Account '" + name + "':",
            attachments: formatter.formatContacts(contacts)
        }))
        .catch(error => bot.reply(message, error));
});


controller.hears(['top (.*) deals', 'top (.*) opportunities'], 'direct_message,direct_mention,mention', (bot, message) => {
    let count = message.match[1];
    salesforce.getTopOpportunities(count)
        .then(opportunities => bot.reply(message, {
            text: "Here are your top " + count + " opportunities:",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));
});

controller.hears(['search opportunity (.*)', 'find opportunity (.*)', '#o (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let name = message.match[1];
    salesforce.findOpportunity(name)
        .then(opportunities => bot.reply(message, {
            text: "I found these opportunities matching  '" + name + "':",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));

});

controller.hears(['search opportunities owned by (.*)', '#oo (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let name = message.match[1];
    salesforce.findOpportunity2(name)
        .then(opportunities => bot.reply(message, {
            text: "I found these opportunities owned by  '" + name + "':",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));

});

controller.hears(['search opportunities in account (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let name = message.match[1];
    salesforce.findOpportunity3(name)
        .then(opportunities => bot.reply(message, {
            text: "I found these opportunities in account  '" + name + "':",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));

});

controller.hears(['(.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `I'm sorry, I didn't understand that. To learn how to make Salesforce requests please type 'help'.`
    });
});


//controller.hears(['create case', 'new case'], 'direct_message,direct_mention,mention', (bot, message) => {

 //   let subject,
  //      description;

 //  let askSubject = (response, convo) => {

    //    convo.ask("What's the subject?", (response, convo) => {
   //         subject = response.text;
   //         askDescription(response, convo);
   //         convo.next();
   //     });

  //  };

  //  let askDescription = (response, convo) => {

    //    convo.ask('Enter a description for the case', (response, convo) => {
    //        description = response.text;
    //        salesforce.createCase({subject: subject, description: description})
    //            .then(_case => {
      //              bot.reply(message, {
      //                 text: "I created the case:",
      //                  attachments: formatter.formatCase(_case)
       //             });
        //            convo.next();
       //         })
       //         .catch(error => {
         //           bot.reply(message, error);
          //          convo.next();
       //         });
        //});

//};

  // bot.reply(message, "OK, I can help you with that!");
  //  bot.startConversation(message, askSubject);

// });

// controller.hears(['create contact', 'new contact'], 'direct_message,direct_mention,mention', (bot, message) => {

   // let firstName,
   //     lastName,
   //     title,
   //     phone;

 //   let askFirstName = (response, convo) => {

   //     convo.ask("What's the first name?", (response, convo) => {
    //        firstName = response.text;
   //         askLastName(response, convo);
    //        convo.next();
    //    });

//    };

   // let askLastName = (response, convo) => {

     //   convo.ask("What's the last name?", (response, convo) => {
     //       lastName = response.text;
      //      askTitle(response, convo);
        //    convo.next();
   //    });

 //   };

 //   let askTitle = (response, convo) => {

   //     convo.ask("What's the title?", (response, convo) => {
  //          title = response.text;
    //        askPhone(response, convo);
   //         convo.next();
    //    });

  //  };

    // let askPhone = (response, convo) => {

      //  convo.ask("What's the phone number?", (response, convo) => {
      //      phone = response.text;
       //     salesforce.createContact({firstName: firstName, lastName: lastName, title: title, phone: phone})
       //         .then(contact => {
       //             bot.reply(message, {
      //                  text: "I created the contact:",
       //                 attachments: formatter.formatContact(contact)
      //              });
       //             convo.next();
       //         })
       //         .catch(error => {
       //            bot.reply(message, error);
    //                convo.next();
     //           });
    //    });

  //  };

 //   bot.reply(message, "OK, I can help you with that!");
  //  bot.startConversation(message, askFirstName);

// });
