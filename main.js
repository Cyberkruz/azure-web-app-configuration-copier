require('shelljs/global');
var args = require('minimist')(process.argv.slice(2));

// Note: The slot setting is not handled.

if (!which('azure')) {
  console.log('This script requires the Microsoft Azure Xplat-CLI.');
  exit(1);
}

console.log(args);

if (!args.sourceApp) {
  console.log('Please provide a sourceApp parameter with the name of the Azure Web App.');
  exit(1);
}

if (!args.destApp) {
  console.log('Please provide a destApp parameter with the name of the Azure Web App.');
  exit(1);
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
console.log('Change to Source Subscription');
console.log('--------------------------------------------------');

exec(`azure account set "${args.sourceSubscription}"`);

console.log('--------------------------------------------------');
console.log('Begin copying appSettings');
console.log('--------------------------------------------------');


var appSettings = JSON.parse(exec(`azure site appsetting list "${args.sourceApp}" --subscription "${args.sourceSubscription}" --json`).output);

console.log('--------------------------------------------------');
console.log('Change to Dest Subscription');
console.log('--------------------------------------------------');

exec(`azure account set "${args.destSubscription}"`);

appSettings.forEach(x => {
  console.log(`Processing: "${x.name}"`);

  // Do we **need** to delete before adding?
  // Unsure if it will simply create a duplicate or replace.
  exec(`azure site appsetting delete "${x.name}" "${args.destApp}" --quiet --subscription "${args.destSubscription}"`);

  // Unsure if these nested quotes will cause a problem
  // If it does, we may need to not allow spaces in appSetting keys
  // or figure something else out.
  if(!args.slot) {
      exec(`azure site appsetting add "${x.name}="\"${x.value}\""" "${args.destApp}" --subscription "${args.destSubscription}"`);
  } else {
      exec(`azure site appsetting add "${x.name}="\"${x.value}\""" "${args.destApp}" --subscription "${args.destSubscription}" --slot "${args.slot}"`);
  }
});

console.log('--------------------------------------------------');
console.log('Change to Source Subscription');
console.log('--------------------------------------------------');

exec(`azure account set "${args.sourceSubscription}"`);

console.log('--------------------------------------------------');
console.log('Begin copying connectionStrings');
console.log('--------------------------------------------------');

var connectionStrings = JSON.parse(exec(`azure site connectionstring list "${args.sourceApp}" --subscription "${args.sourceSubscription}" --json`).output);

console.log('--------------------------------------------------');
console.log('Change to Dest Subscription');
console.log('--------------------------------------------------');

exec(`azure account set "${args.destSubscription}"`);

connectionStrings.forEach(x => {
  console.log(`Processing: "${x.name}"`);

  // Do we **need** to delete before adding?
  // Unsure if it will simply create a duplicate or replace.
  exec(`azure site connectionstring delete "${x.name}" "${args.destApp}" --quiet --subscription "${args.destSubscription}"`);

  // Hopefully just setting "Custom" here is OK.
  // The integers returned by `list` don't seem to match the expectations of `add`.
  if(!args.slot) {
      exec(`azure site connectionstring add "${x.name}" "${x.connectionString}" "Custom" "${args.destApp}" --subscription "${args.destSubscription}"`);
  } else {
      exec(`azure site connectionstring add "${x.name}" "${x.connectionString}" "Custom" "${args.destApp}" --subscription "${args.destSubscription}" --slot "${args.slot}"`);
  }
});

console.log('--------------------------------------------------');
console.log();
console.log(`appSettings and connectionStrings have been synced from ${args.sourceApp} to ${args.destApp}.`);
