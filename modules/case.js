"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    CASE_TOKEN = process.env.SLACK_CASE_TOKEN;

exports.execute = (req, res) => {

    if (req.body.token != CASE_TOKEN) {
        res.send("Invalid token");
        return;
    }

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        params = req.body.text.split(";"),
        subject = params[0],
        description = params[1],
        recordType = params[2],
        q = "SELECT id,name FROM RecordType Where Name like '%" + recordType + "%'",
        caseRecordType;
       
    force.query(oauthObj, q)
            .then(data =>{
                let rTypes = JSON.parse(data).records;
                if(rTypes && rTypes.length>0){
                    rTypes.forEach((rType) => {
                        caseRecordType = rType.Id;
                    });
                }    
            else{
                caseRecordType = 'no records';
                }
            }).catch((error)=>{
            if(error.code == 401){
                caseRecordType = 'b';
            }
            else{
                caseRecordType = 'c';
            }
        });

    force.create(oauthObj, "Case",
        {
            subject: subject,
            description: description,
            origin: "Slack",
            status: "New"
           // RecordTypeId: ""
        })
        .then(data => {
            let fields = [];
            fields.push({title: "Subject", value: subject, short:false});
            fields.push({title: "Description", value: description, short:false});
            fields.push({title: "Record Type", value: caseRecordType, short:false});
            fields.push({title: "Record Type", value: recordType, short:false});
            fields.push({title: "Open in Salesforce:", value: oauthObj.instance_url + "/" + data.id, short:false});
           
            let message = {
                text: "A new case has been created:",
                attachments: [
                    {color: "#F2CF5B", fields: fields}
                ]
            };
            res.json(message);
        })
        .catch((error) => {
            if (error.code == 401) {
                res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);

            } else {
                res.send("An error has occurred");
            }
        });

};
