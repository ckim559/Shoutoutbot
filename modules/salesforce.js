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

let findAccount = name => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Phone, Account_Owner__c , Type , BillingStreet, BillingCity, BillingState FROM Account WHERE Name LIKE '%" + name + "%' LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.log(err);
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};


let findAccount2 = name => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Phone, Account_Owner__c  , Type, BillingStreet, BillingCity, BillingState FROM Account WHERE Account_Owner__c LIKE '%" + name + "%' LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.log(err);
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};


let findAccount3 = (owner, name) => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Phone, Account_Owner__c  , Type, BillingStreet, BillingCity, BillingState FROM Account WHERE Account_Owner__c LIKE '%" + owner + "%' AND Name LIKE '%" + name + "%' LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.log(err);
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findAccount4 = (owner, name, type) => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Phone, Account_Owner__c  , Type, BillingStreet, BillingCity, BillingState FROM Account WHERE Account_Owner__c LIKE '%" + owner + "%' AND Name LIKE '%" + name + "%' AND Type LIKE '"+ type + "' LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.log(err);
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findContact = name => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Account_Name_API__c, Name, title, Phone, MobilePhone, Email FROM Contact WHERE Name LIKE '%" + name + "%' LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findContact2 = name => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Account_Name_API__c, Name, title, Phone, MobilePhone, Email FROM Contact WHERE Account_Name_API__c LIKE '%" + name + "%' LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findContact3 = (account, name) => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Account_Name_API__c, Name, Phone, title, MobilePhone, Email FROM Contact WHERE Account_Name_API__c LIKE '%" + account + "%' AND Name LIKE '%" + name + "%' LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findOpportunity = name => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Amount, Opportunity_Record_Type__c, Opp_Type__c, Opportunity_Owner__c, Opp_Account_Name_API__c, Probability, StageName, CloseDate FROM Opportunity WHERE Name LIKE '%" + name + "%' AND (NOT Opportunity_Record_Type__c LIKE 'Services Project Request%') ORDER BY Probability DESC LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findOpportunity2 = name => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Amount, Opportunity_Record_Type__c, Opp_Type__c, Opportunity_Owner__c, Opp_Account_Name_API__c, Probability, StageName, CloseDate FROM Opportunity WHERE Opportunity_Owner__c LIKE '%" + name + "%' AND (NOT Opportunity_Record_Type__c LIKE 'Services Project Request%') ORDER BY Probability DESC LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findOpportunity3 = name => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Amount, Opportunity_Record_Type__c, Opp_Type__c, Opportunity_Owner__c, Opp_Account_Name_API__c, Probability, StageName, CloseDate FROM Opportunity WHERE Opp_Account_Name_API__c LIKE '%" + name + "%' AND (NOT Opportunity_Record_Type__c LIKE 'Services Project Request%') ORDER BY Probability DESC LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findOpportunity4 = (owner, name, stage, recordt) => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Amount, Opportunity_Record_Type__c, Opp_Type__c, Opp_Stage__c, Opportunity_Owner__c, Opp_Account_Name_API__c, Probability, StageName, CloseDate FROM Opportunity WHERE Opportunity_Owner__c LIKE '%" + owner + "%' AND Opp_Stage__c LIKE '%" + stage + "%' AND Opp_Account_Name_API__c LIKE '%" + name + "%' AND Opportunity_Record_Type__c LIKE '" + recordt + "' AND (NOT Opportunity_Record_Type__c LIKE 'Services Project Request%') ORDER BY Probability DESC LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findOpportunity5 = (type, owner, name, stage, recordt) => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Amount, Opportunity_Record_Type__c, Opp_Type__c, Opp_Stage__c, Opportunity_Owner__c, Opp_Account_Name_API__c, Probability, StageName, CloseDate FROM Opportunity WHERE Opp_Type__c LIKE '" + type + "%' AND Opportunity_Owner__c LIKE '%" + owner + "%' AND Opp_Stage__c LIKE '%" + stage + "%' AND Opp_Account_Name_API__c LIKE '%" + name + "%' AND Opportunity_Record_Type__c LIKE '" + recordt + "' AND (NOT Opportunity_Record_Type__c LIKE 'Services Project Request%') ORDER BY Probability DESC LIMIT 10";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let getTopOpportunities = count => {

    count = count || 15;

    return new Promise((resolve, reject) => {
        var q = "SELECT Id, Name, Amount, Probability, StageName, CloseDate FROM Opportunity WHERE isClosed=false ORDER BY amount DESC LIMIT " + count;
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.error(err);
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let createContact = contact => {

    return new Promise((resolve, reject) => {
        let c = nforce.createSObject('Contact');
        c.set('firstName', contact.firstName);
        c.set('lastName', contact.lastName);
        c.set('title', contact.title);
        c.set('phone', contact.phone);
        org.insert({sobject: c}, (err, resp) => {
            if (err) {
                console.error(err);
                reject("An error occurred while creating a contact");
            } else {
                resolve(c);
            }
        });
    });

};

let createCase = newCase => {

    return new Promise((resolve, reject) => {
        let c = nforce.createSObject('Case');
        c.set('subject', newCase.subject);
        c.set('description', newCase.description);
        c.set('origin', 'Slack');
        c.set('status', 'New');

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

login();

exports.org = org;
exports.findAccount = findAccount;
exports.findAccount2 = findAccount2;
exports.findAccount3 = findAccount3;
exports.findAccount4 = findAccount4;
exports.findContact = findContact;
exports.findContact2 = findContact2;
exports.findContact3 = findContact3;
exports.findOpportunity = findOpportunity;
exports.findOpportunity2 = findOpportunity2;
exports.findOpportunity3 = findOpportunity3;
exports.findOpportunity4 = findOpportunity4;
exports.findOpportunity5 = findOpportunity5;
exports.getTopOpportunities = getTopOpportunities;
exports.createContact = createContact;
exports.createCase = createCase;
