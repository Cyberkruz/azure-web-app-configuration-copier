require('shelljs/global');
var args = require('minimist')(process.argv.slice(2));

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


console.log('--------------------------------------------------');
console.log('Begin copying appSettings');
console.log('--------------------------------------------------');

var sourceSettings = execJsonCommand(args.sourceSlot, 
  `azure site appsetting list "${args.sourceApp}" --subscription "${args.sourceSubscription}"`);
var destSettings = execJsonCommand(args.destSlot,
  `azure site appsetting list "${args.destApp}" --subscription "${args.destSubscription}"`);


console.log('--------------------------------------------------');
console.log('Begin processing appSettings');
console.log('--------------------------------------------------');

for(var x = 0; x < sourceSettings.length; ++x) {
  var src = sourceSettings[x];

  if(args.ignore && args.ignore === src.name) {
    console.log(`Skipping: "${src.name}"`);
    continue;
  }

  console.log(`Processing: "${src.name}"`);

  if(findByName(destSettings, src.name)) {
    console.log(`Found existing "${src.name}" in destination. Deleting.`);
    execCommand(args.destSlot, 
      `azure site appsetting delete "${src.name}" "${args.destApp}" --quiet --subscription "${args.destSubscription}"`);
  }

  console.log(`Adding: "${src.name}" to destination.`)

  execCommand(args.destSlot,
    `azure site appsetting add "${src.name}="\"${src.value}\""" "${args.destApp}" --subscription "${args.destSubscription}"`);
}

console.log('--------------------------------------------------');
console.log('Begin copying connectionStrings');
console.log('--------------------------------------------------');

var sourceConnections = execJsonCommand(args.sourceSlot, 
  `azure site connectionstring list "${args.sourceApp}" --subscription "${args.sourceSubscription}"`);
var destConnections = execJsonCommand(args.destSlot,
  `azure site connectionstring list "${args.destApp}" --subscription "${args.destSubscription}"`);


console.log('--------------------------------------------------');
console.log('Begin processing connectionStrings');
console.log('--------------------------------------------------');

for(var x = 0; x < sourceConnections.length; ++x) {
  var src = sourceConnections[x];

  if(args.ignore && args.ignore === src.name) {
    console.log(`Skipping: "${src.name}"`);
    continue;
  }

  console.log(`Processing: "${src.name}"`);

  if(findByName(destConnections, src.name)) {
    console.log(`Found existing "${src.name}" in destination. Deleting.`);
    execCommand(args.destSlot, 
      `azure site connectionstring delete "${src.name}" "${args.destApp}" --quiet --subscription "${args.destSubscription}"`);
  }

  console.log(`Adding: "${src.name}" to destination.`);
  var type = parseDbType(src.type);
  console.log("The string is: " + `${type}`);

  execCommand(args.destSlot,
    `azure site connectionstring add "${src.name}" "${src.connectionString}" "${type}" "${args.destApp}" --subscription "${args.destSubscription}"`);
}


console.log('--------------------------------------------------');
console.log();
console.log(`appSettings and connectionStrings have been synced from ${args.sourceApp} to ${args.destApp}.`);


function findByName(collection, name) {
  for(var x = 0; x < collection.length; ++x) {
    if(collection[x].name && collection[x].name === name) {
      return true;
    }    
  }
  return false;
}

function execJsonCommand(slot, command) {
  if(slot) {
    command += ` --slot "${args.sourceSlot}"`;
  }
  command += ` --json`;
  return JSON.parse(exec(command).output);
}

function execCommand(slot, command) {
  if(slot) {
    command += ` --slot "${args.sourceSlot}"`;
  }
  exec(command);
}

function parseDbType(db) {
  switch(db) {
    default:
      return "Custom";
  }
}