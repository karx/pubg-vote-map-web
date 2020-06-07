let current_ladder = {
  "playerNumber": 8,
  "mode": "time", //time or count
  "per_vote_sec": 30, //incase mode is time
  // "vote_cutoff": 100,//incase mode is count
  "current_set": 0,
  "rooms": [
    // {with set Index, ...}

  ],

  "is_live": true
};

let players = [

];


let votesArray = {

}
var ID = (function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return (
    "_" +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
})();
var client = new Paho.Client(
  "wss://api.akriya.co.in:8084/mqtt",
  `clientId-pubg-map-vote-spec-${ID}`
);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({ onSuccess: onConnect });

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe("laddervote/master");
  client.subscribe(`laddervote/${ID}/connection_ack`);
  client.subscribe(`laddervote/vote`);
  let message = new Paho.Message("Spec Server");
  message.destinationName = "hoenn/presence";
  client.send(message);
  initLadder();
  
  
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:" + message.payloadString);
  console.log("The Topic:" + message.topic);
  let stubs = message.topic.split("/");
  if (stubs[0] === `laddervote` && stubs[1] === `vote`) {
    try {
      addVote(message.payloadString);
    } catch (error) {

    }
  } else if (message.topic === `laddervote/master`) {

  }
}

async function addVote(voteVal) {
  // current_ladder.rooms[playerData.room].currentPlayers.push(playerData);

  if (votesArray[voteVal]) {
    votesArray[voteVal].votes++;
  } else {
    console.log(`Unknown Vote handler rcvd ${voteVal}`);
  }

  console.log(current_ladder);
  //   updateMapBasedOnCounts();
}


function updateMapBasedOnCounts() {
  requestAnimationFrame(updateMapBasedOnCounts);

  let locations = Object.keys(votesArray);
  locations.forEach(loc => {
    let playerRef = votesArray[loc];
    let playerIndex = playerRef.playerIndex;
    let roomIndexOfPlayer = players[playerIndex].roomIndex;
    // moved here to optimize DOM updates. We have now, here in mem, what indivisual elements to update. I didn't want to implement a Queue for this

    current_ladder.room[roomIndexOfPlayer].currentPlayers[loc].votes = playerRef.votes;
    let roomToUpdate = current_ladder.room[roomIndexOfPlayer];
    let playerToUpdate = current_ladder.room[roomIndexOfPlayer].currentPlayers[loc];

  });


}

function getRaduisFromCount(count) {
  return count + 15;
}

// updateMapBasedOnCounts();

function generateRooms() {
  let playerNumber = current_ladder.playerNumber;
  let roomSize = current_ladder.roomSize || 2;

  let rooms = [];

  console.log('creating Fresh Rooms');
  //create Rooms and add in global 
  let total_number_of_sets = 0;
  let playerLeft_temp = playerNumber;

  let total_room_count = 0;
  while (playerLeft_temp > 0) {
    console.log('in whiele');
    if (playerLeft_temp == 1) {
      playerLeft_temp--;
    } else {
      console.log(`Set = ${total_number_of_sets}`);
      for (let roomIndex = 0; roomIndex * roomSize < playerLeft_temp; roomIndex++) {

        let new_room = {
          setIndex: total_number_of_sets,
          roomIndex: roomIndex,
          playerCount: roomSize,
          currentPlayers: {},
          winningRoomIndex: total_room_count + Math.ceil(playerLeft_temp/roomSize) - Math.ceil(roomIndex/roomSize)
        }
        total_room_count++;
        rooms.push(new_room);
      }

      playerLeft_temp = Math.ceil(playerLeft_temp / roomSize);
      total_number_of_sets++;
    }
  }
  console.log(rooms);
  current_ladder.rooms = rooms;
  current_ladder.total_room_count = total_room_count;
}
function initPlayerDataAndAssignRoom() {
  let playerNumber = current_ladder.playerNumber;
  let roomSize = current_ladder.roomSize || 2;

  console.log(`roomSize = ${roomSize}`);
  if (!!current_ladder.rooms || current_ladder.rooms.length == 0) {
    generateRooms();  //should not cause bugs, but flagging just in Case. RED
  }
  // init Player Data and assign room
  for (let index = 0; index < playerNumber; index++) {
    let playerData = players[index] || {};
    playerData.name = playerData.name || `Player - ${index}`;
    playerData.room = parseInt(index / roomSize);
    playerData.votes = playerData.votes || 0;
    playerVoteHandle = playerData.playerVoteHandle || playerData.name;

    console.log(playerData);
    current_ladder.rooms[playerData.room].currentPlayers[playerData.playerVoteHandle] = playerData;
    playerData[index] = playerData;

    votesArray[playerData.playerVoteHandle] = {
      playerIndex: index,
      votes: playerData.votes
    }
  }


}

function initLadder() {
  try{
    initPlayerDataAndAssignRoom();
    console.log(current_ladder);
  } catch (e) {
    console.log(e)
  }
}