const fs = require('fs');
const path = require('path');
const { BedrockPortal, Joinability, Modules } = require('bedrock-portal');

// Use Railway persistent storage path
// In Railway, you might mount a volume to /data
const STORAGE_PATH = path.join('/data', 'friends.json');

const loadFriends = () => {
  if (fs.existsSync(STORAGE_PATH)) {
    return JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf-8'));
  }
  return [];
};

const saveFriends = (friends) => {
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(friends, null, 2));
};

const main = async () => {
  const portal = new BedrockPortal({
    ip: 'donutsmp.net',
    port: 19132,
    joinability: Joinability.FriendsOfFriends,
    sessionName: 'loresmp'
  });

  // Load previously saved friends
  const savedFriends = loadFriends();
  console.log('Loaded friends from storage:', savedFriends);

  portal.use(Modules.AutoFriendAdd, {
    inviteOnAdd: true,
    conditionToMeet: (player) => player.presenceState === 'Online',
    checkInterval: 30000,
    addInterval: 2000,
    removeInterval: 2000,
    onFriendAdded: (player) => {
      console.log(`Added friend: ${player.username}`);
      savedFriends.push(player.username);
      saveFriends(savedFriends);
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

main();
