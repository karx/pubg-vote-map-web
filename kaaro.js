
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

  async function addVote(voteVal) {
      if(votesArray[voteVal]) {
          votesArray[voteVal].votes++;
      }
      updateMapBasedOnCounts();
  }


  function updateMapBasedOnCounts() {
    //   requestAnimationFrame(updateMapBasedOnCounts);

      let locations = Object.keys(votesArray);
      locations.forEach(loc => {
          console.log(loc + ' : ' + votesArray[loc].votes);
        let marker = document.getElementById(loc);
        let vote_count = votesArray[loc].votes;
        let vote_count_color_cap = vote_count > 255 ? 255 : vote_count;
            marker.style.height = `${(vote_count)}px`;
            marker.style.width = `${(vote_count)}px`;
            marker.style.backgroundColor = `rgba(${vote_count_color_cap}, ${255 - vote_count_color_cap}, 20, 0.7)`;
      })
      
  }

//   updateMapBasedOnCounts();