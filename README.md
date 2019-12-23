# s2s

A simple Node.js application that acts as a Slash Command message broker between Slack and Salesforce.

Follow the instructions below to deploy your own instance of the application:

### Step 1: Create a Connected App

If you haven't already done so, follow the steps below to create a Salesforce connected app:

1. In Salesforce Setup, type **Apps** in the quick find box, and click the **Apps** link

1. In the **Connected Apps** section, click **New**, and define the Connected App as follows:

    - Connected App Name: MyConnectedApp (or any name you want)
    - API Name: MyConnectedApp
    - Contact Email: enter your email address
    - Enabled OAuth Settings: Checked
    - Callback URL: https://myapp.herokuapp.com/oauthcallback (You'll change this later)
    - Selected OAuth Scopes: Full Access (full)
    - Click **Save**

### Step 2: Deploy the Slash Commands

1. Make sure you are logged in to the [Heroku Dashboard](https://dashboard.heroku.com/), you can use your own one if you have or the twilo one.
If you are using your own heroku dashboard you must create an app, for the rest of the guide we will use "mynewapp" as the name of
the app but you can name it as you want

2. Connect your Heroku dashboard with GitHub:
    - Go to the "deploy" tab on the Dashboard and login on the GitHub on the deployment methods (the source code will be provided by this means)
    - Then go to the "Manual Deploy" menu, choose the master branch and deploy it to teh app.
    
3. Fill in the config variables as described.

    - Go to the "Settings" navigation tab and click on "Reveal Config Vars"
    - Create one and name it: **SF_CLIENT_ID**, enter the Consumer Key of your Salesforce Connected App
    - Create other one: **SF_CLIENT_SECRET**, enter the Consumer Secret of your Salesforce Connected App
    - Create other one: **SLACK_CASE_TOKEN** blank for now.
    - create other one: **SF_LOGIN_URL**, enter https://test.salesforce.com if you are using the app from a sandbox otherwise use https://login.salesforce.com (if you are using this app in a sandbox enviroment and later you will use it in a production enviroment make sure of change the config var)

1. Once your app is deployed, go back to the Connected App in Salesforce, and change the OAuth callback URL: Use the URL of your actuall Heroku app, followd by /oauthcallback. For example: https://mynewapp.herokuapp.com/oauthcallback

### Step 3: Create the Slash Commands in Slack

1. In a browser, go to the custom integration page for your Slack team. For example ```https://YOUR_TEAM_NAME.slack.com/apps/manage/custom-integration```. Replace ```YOUR_TEAM_NAME``` with your actual team name.

1. Click **Create New App**, give it a name and choose the workspace

2. Once you've created the app go to the left menu and search **Slash Command**, click on "Create New Command"

    - Command: /case
    - Request URL: the URL of the app you deployed on Heroku followed by /case. For example: ```https://your-heroku-app.herokuapp.com/case```
    -  Give it a description
    - Usage Hint : [subject; description]
    - Click on "Save"
    - Copy the **Verification Token** you can find it on the basic information menu, open another browser tab, login to the Heroku Dashboard, and set the Heroku **SLACK_CASE_TOKEN** config           variable to the value of that token (**Setting>Reveal Config Vars**)
    
    Click **Save Integration**.
   
