const { BedrockPortal, Joinability, Modules } = require('bedrock-portal');

const main = async () => {
  const portal = new BedrockPortal({
    ip: 'donutsmp.net',
    port: 19132,
    joinability: Joinability.FriendsOfFriends,
    sessionName: 'loresmp' // <-- Custom world name
  });

  portal.use(Modules.AutoFriendAdd, {
    inviteOnAdd: true,
    conditionToMeet: (player) => player.presenceState === 'Online',
    checkInterval: 30000,
    addInterval: 2000,
    removeInterval: 2000
  });

  await portal.start();
  console.log('Portal started! Your friends will see "My Awesome World".');
};

main();
