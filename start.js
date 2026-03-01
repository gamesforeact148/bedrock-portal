// bedrock-portal-railway.js
const fs = require('fs');
const path = require('path');
const { BedrockPortal, Joinability, Modules } = require('bedrock-portal');

// Fixed persistent volume path
const VOLUME_PATH = '/data'; // Make sure your Railway volume is mounted here
const FRIENDS_PATH = path.join(VOLUME_PATH, 'friends.json');
const MSA_TOKEN_PATH = path.join(VOLUME_PATH, 'msa.json');

// Load friends from persistent storage
const loadFriends = () => {
  if (fs.existsSync(FRIENDS_PATH)) {
    return JSON.parse(fs.readFileSync(FRIENDS_PATH, 'utf-8'));
  }
  return [];
};

// Save friends to persistent storage
const saveFriends = (friends) => {
  fs.writeFileSync(FRIENDS_PATH, JSON.stringify(friends, null, 2));
};

const main = async () => {
  // Initialize the portal
  const portal = new BedrockPortal({
    ip: '191.96.231.10',
    port: 12596,
    joinability: Joinability.FriendsOfFriends,
    sessionName: 'loresmp',
    msaTokenPath: MSA_TOKEN_PATH // <-- Save Microsoft/Xbox token here
  });

  // Load previously saved friends
  const savedFriends = loadFriends();
  console.log('Loaded friends from storage:', savedFriends);

  // Configure AutoFriendAdd module
  portal.use(Modules.AutoFriendAdd, {
    inviteOnAdd: true,
    conditionToMeet: (player) => player.presenceState === 'Online',
    checkInterval: 30000,
    addInterval: 2000,
    removeInterval: 2000,
    onFriendAdded: (player) => {
      console.log(`Added friend: ${player.username}`);
      if (!savedFriends.includes(player.username)) {
        savedFriends.push(player.username);
        saveFriends(savedFriends);
      }
    },
    onFriendRemoved: (player) => {
      console.log(`Removed friend: ${player.username}`);
      const index = savedFriends.indexOf(player.username);
      if (index > -1) {
        savedFriends.splice(index, 1);
        saveFriends(savedFriends);
      }
    }
  });

  await portal.start();
  console.log('Portal started! Your friends will see "My Awesome World".');
};

// Run the bot
main().catch(err => {
  console.error('Error starting the portal:', err);
});
