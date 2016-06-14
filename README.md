# azure-web-app-configuration-copier

A tool to copy appSettings and connection strings between Azure Web Apps.

## Usage

- Install [Node.js](https://nodejs.org) *(if not already installed)*.
- `npm install -g azure-cli`
- `azure login`
- `git clone ...`
- `cd azure-web-app-configuration-copier`
- `npm install`
- `node main.js --sourceApp MySourceApp --destApp MyDestinationApp --subscription "My Subscription"`

## Parameters
- --slot: the destination slot
- --sourceApp: the name of the source application
- --destApp: the name of the destination application
- --sourceSubscription: the name of the source subscription
- --destinationSubscription: the name of the destination subscription
- --subscription: will be used for the source and dest subscriptions 

# License

[MIT](/LICENSE)
