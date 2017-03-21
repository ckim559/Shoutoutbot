"use strict";

let nforce = require('nforce'),

    SF_CLIENT_ID = process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
    SF_USER_NAME = process.env.SF_USER_NAME,
    SF_PASSWORD = process.env.SF_PASSWORD,

  org = nforce.createConnection({
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



let createCase = newCase => {

    return new Promise((resolve, reject) => {
        let c = nforce.createSObject('Case');
        c.set('subject', newCase.subject);
        c.set('description', newCase.description);
        c.set('status', 'New');
		c.set('Resource_Assignment_Due_Date__c', newCase.date)
		c.set('Project_Scope__c', newCase.scope)
		c.set('Submitted_By__c', newCase.name)
		c.set('Project_Target_Start_Date__c', newCase.start)
		c.set('Project_Target_Live_Date__c', newCase.live)
		c.set('Estimated_Hours__c', newCase.hours)
		c.set('Submitter_Email__c', newCase.email)
		c.set('Account_Manager__c', newCase.AM)
		c.set('Project_Manager__c', newCase.PJM)
		c.set('Advisory_Services__c', newCase.AS)
		c.set('Solutions_Engineer__c', newCase.SE)
		c.set('RecordTypeId', '012600000005OU0')
		

        org.insert({sobject: c}, err => {
            if (err) {
                console.error(err);
                reject("An error occurred while creating a case");
            } else {
                resolve(c);
            }
        });
    });

};

let findmyopencases = email => {

    return new Promise((resolve, reject) => {
         let q = "SELECT Id, CaseNumber, Subject, Estimated_Hours__c, Submitted_By__c, Project_Target_Start_Date__c, Project_Target_Live_Date__c, Description, Resource_Assignment_Due_Date__c, Status,Project_Scope__c, AM_Req__c, AS_Req__c, PJM_Req__c, SE_Req__c FROM Case WHERE Submitter_Email__c LIKE '%" + email + "%' AND RecordTypeId = '012600000005OU0' AND Status <> 'Closed' ORDER BY Resource_Assignment_Due_Date__c ASC LIMIT 20";
        org.query({query: q}, (err, resp) => {
            if (err) {
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
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findshoutoutweek = week => {

    return new Promise((resolve, reject) => {
         let q = "SELECT ID, Name FROM Shoutout_Week__c WHERE Open_Voting__c = TRUE LIMIT 1";
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
exports.findshoutoutweek = findshoutoutweek;
exports.createShoutout = createShoutout;
exports.createVote = createVote;
