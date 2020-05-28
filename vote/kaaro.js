
let votesArray = {
    "prison": {
        votes: 0
    },
    "military": {
        votes: 0
    },
    "school": {
        votes: 0
    },
    "mylta": {
        votes: 0
    },
    "george": {
        votes: 0
    }
}
var ID = (function() {
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
    "ws://api.akriya.co.in:8083/mqtt",
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
    client.subscribe("pubgmapv/master");
    client.subscribe(`pubgmapv/${ID}/connection_ack`);
    client.subscribe(`pubgmapv/vote`);
    let message = new Paho.Message("Spec Server");
    message.destinationName = "hoenn/presence";
    client.send(message);
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
    if (stubs[0] === `pubgmapv` && stubs[1] === `vote`) {
        try {
            addVote(message.payloadString);
        } catch (error) {
            
        }
    } else if (message.topic === `pubgmapv/master`) {

    }
  }

  
  function voteCastTo(loc) {
    let message = new Paho.Message(loc);
    message.destinationName = "pubgmapv/vote";
    client.send(message);
    updateUItoThanks();  
  }
  function updateUItoThanks() {
    document.getElementById('map').style.display = 'none';
    document.getElementById('thanks-for-voting').style.display = 'block';
  }

  function attachEventListeners() {
    let locations = Object.keys(votesArray);
      locations.forEach(loc => {
        let marker = document.getElementById(loc);
        marker.addEventListener('click', () => {
          voteCastTo(loc);
        })
      });

  }

  attachEventListeners();
//   updateMapBasedOnCounts();
