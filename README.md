# azure-web-app-configuration-copier

A tool to copy appSettings and connection strings between Azure Web Apps.

The original is [here](https://github.com/ritterim/azure-web-app-configuration-copier). I've modified the source to check before deletes as well as have more configuration options.

## Usage

- Install [Node.js](https://nodejs.org) *(if not already installed)*.
- `npm install -g azure-cli`
- `azure login`
- `git clone ...`
- `cd azure-web-app-configuration-copier`
- `npm install`
- `node main.js --sourceApp MySourceApp --destApp MyDestinationApp --subscription "My Subscription"`

## Parameters
- --sourceSlot: the source slot
- --destSlot: the destination slot
- --ignore: app setting to ignore
- --sourceApp: the name of the source application
- --destApp: the name of the destination application
- --sourceSubscription: the name of the source subscription
- --destinationSubscription: the name of the destination subscription
- --subscription: will be used for the source and dest subscriptions 

# License

[MIT](/LICENSE)
