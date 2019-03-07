require('shelljs/global');
var args = require('minimist')(process.argv.slice(2));
var _ = require('lodash');

if (!which('azure')) {
  console.log('This script requires the Microsoft Azure Xplat-CLI.');
  exit(1);
}

if (!args.sourceApp) {
  console.log('Please provide a sourceApp parameter with the name of the Azure Web App.');
  exit(1);
}

if (!args.destApp) {
  console.log('Please provide a destApp parameter with the name of the Azure Web App.');
  exit(1);
}

if(!args.subscription && !args.sourceSubscription && !args.destSubscription) {
  args.subscription = JSON.parse(exec(`azure account show --json`).output)[0].name;
}

if(!args.subscription) {
    if (!args.sourceSubscription) {
      console.log('Please provide a sourceSubscription parameter.');
      exit(1);
    }
    if (!args.destSubscription) {
      console.log('Please provide a destSubscription parameter.');
      exit(1);
    }
} else {
    args.sourceSubscription = args.subscription;
    args.destSubscription = args.subscription;
}

/*
  Get the source and destination settings
*/
var sourceSettings = execJsonCommand(args.sourceSlot, 
  `azure site appsetting list "${args.sourceApp}" --subscription "${args.sourceSubscription}"`);
var destSettings = execJsonCommand(args.destSlot,
  `azure site appsetting list "${args.destApp}" --subscription "${args.destSubscription}"`);

/*
  Check the difference
*/

_.each(sourceSettings, function(item) {
	var res = _.find(destSettings, item);
  if(!res) {
  	console.log('!!!!!!!!! missing or invalid key: ' + item.name);
  }
});

function execJsonCommand(slot, command) {
  if(slot) {
    command += ` --slot "${args.sourceSlot}"`;
  }
  command += ` --json`;
  return JSON.parse(exec(command).output);
}
