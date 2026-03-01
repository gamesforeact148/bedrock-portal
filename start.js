// bedrock-portal-railway.js
const fs = require('fs');
const path = require('path');
const { BedrockPortal, Joinability, Modules } = require('bedrock-portal');

// Automatically detect Railway persistent volume
// Railway exposes the mount under /var/lib/containers/railwayapp/bind-mounts
const railwayVolumeRoot = '/var/lib/containers/railwayapp/bind-mounts';
let mountedVolume = null;

// Pick the first volume folder if multiple exist
if (fs.existsSync(railwayVolumeRoot)) {
  const dirs = fs.readdirSync(railwayVolumeRoot, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(railwayVolumeRoot, d.name));
  if (dirs.length > 0) {
    const volumeDirs = fs.readdirSync(dirs[0], { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.startsWith('vol_'))
      .map(d => path.join(dirs[0], d.name));
    if (volumeDirs.length > 0) {
      mountedVolume = volumeDirs[0];
    }
  }
}

if (!mountedVolume) {
  console.error('Persistent volume not found! Exiting.');
  process.exit(1);
}

console.log('Using persistent volume:', mountedVolume);

// Paths for storage
const FRIENDS_PATH = path.join(mountedVolume, 'friends.json');
const MSA_TOKEN_PATH = path.join(mountedVolume, 'msa.json');

// Load friends list
const loadFriends = () => {
  if (fs.existsSync(FRIENDS_PATH)) {
    return JSON.parse(fs.readFileSync(FRIENDS_PATH, 'utf-8'));
  }
  return [];
};

// Save friends list
const saveFriends = (friends) => {
  fs.writeFileSync(FRIENDS_PATH, JSON.stringify(friends, null, 2));
};

const main = async () => {
  const portal = new BedrockPortal({
    ip: 'donutsmp.net',
    port: 19132,
    joinability: Joinability.FriendsOfFriends,
    sessionName: 'loresmp',
    msaTokenPath: MSA_TOKEN_PATH // <-- Save MSA token in persistent volume
  });

  // Load friends from storage
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

main();
