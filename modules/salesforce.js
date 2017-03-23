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

let createShoutout = newShoutout => {

    return new Promise((resolve, reject) => {
		
        let c = nforce.createSObject('Services_Shoutout__c');
        c.set('Recipient_Name__c', newShoutout.person);
		c.set('Reason__c', newShoutout.reason);
		c.set('Shoutout_Week__c', newShoutout.id);
		c.set('ID__c', newShoutout.slackId);
		
        org.insert({sobject: c}, err => {
            if (err) {
                console.error(err);
                reject("An error occurred while creating a Shoutout");
            } else {
                resolve(c);
            }
        });
    });

};

let createVote = newVote => {

    return new Promise((resolve, reject) => {
		
        let c = nforce.createSObject('Shoutout_Vote__c');
		c.set('Services_Shoutout__c', newVote.id);
		c.set('Slack_ID__c', newVote.slackId);
		
        org.insert({sobject: c}, err => {
            if (err) {
                console.error(err);
                reject("An error occurred while casting your vote.");
            } else {
                resolve(c);
            }
        });
    });

};


let findshoutouts = shouts => {

    return new Promise((resolve, reject) => {
         let q = "SELECT Reason__c, Request_Number__c, Shoutout__c, Recipient_Name__c FROM Services_Shoutout__c WHERE Shoutout_Week__r.Open_Voting__c = TRUE ORDER BY Name ASC";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred. Fix yo code!");
            } 		
			else {
                resolve(resp.records);
            }
        });
    });

};


login();

exports.org = org;
exports.findshoutouts = findshoutouts;
exports.createShoutout = createShoutout;
exports.createVote = createVote;
