//"use strict";

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
        caseRecordType = 'a',
        rtName = 'Undefined',
        state = 'not created';
    
    if(params[2]){ 
        let recordType = params[2].trim(),
            q = "SELECT id,name FROM RecordType Where Name like '%" + recordType + "%' LIMIT 1";
            
        force.query(oauthObj, q)
                .then(data =>{
                   var rTypes = JSON.parse(data).records;
                   if(rTypes && rTypes.length>0){
                            caseRecordType = rTypes[0].Id;
                            rtName = rTypes[0].Name;
                            state = 'created';
                    }    
                else{
                    caseRecordType = '';
                    }
                }).catch((error)=>{
                if(error.code == 401){
                    caseRecordType = '';
                    state = 'not created error: 401';
                }
                else{
                    caseRecordType = '';
                    state = 'not created error: undefined';
                }
            });
        }
    
    var caseJson =   {
            subject: subject,
            description: rtName,
            origin: "Slack",
            status: "New",
            RecordTypeId: caseRecordType
        }

    force.create(oauthObj, "Case",caseJson)
        .then(data => {
            let fields = [];
            fields.push({title: "Subject", value: subject, short:false});
            fields.push({title: "Description", value: description, short:false});
            fields.push({title: "Record Type id", value: caseRecordType, short:false});
            fields.push({title: "Record Type", value: rtName, short:false});
            fields.push({title: "state", value: state, short:false});
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
