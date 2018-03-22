const io = require('socket.io')();

const foodMap = {};

io.on('connection', (client) => {
    client.on('newConnection', () => {
        console.log("New connection established!");
        client.emit('latestFoodMap', JSON.stringify(foodMap));
    });

    client.on('newFoodSuggestion', (suggestion) => {
        console.log("Suggestion added: " + suggestion);

        foodMap[suggestion] = foodMap[suggestion] || [];

        if (!foodMap[suggestion].includes(client.id)) {
          foodMap[suggestion] = [ ...foodMap[suggestion], client.id];
        } else {
          console.log('suggestion ignored, user already voted for this suggestion');
          io.to(client.id).emit('alreadyVotedForSuggestion', suggestion);
        }

        io.emit('foodSuggestionAdded', { 
            votes: foodMap[suggestion].length,
            food: suggestion,
        });
    });

    client.on('voteFoodSuggestion', (suggestion) => {
        console.log('Vote for ' + suggestion);

        if (!foodMap[suggestion].includes(client.id)) {
          foodMap[suggestion] = [ ...foodMap[suggestion], client.id];
        } else {
          console.log('vote ignored, duplicate vote');
          io.to(client.id).emit('duplicateVoteIgnored', suggestion);
        }

        io.emit('foodSuggestionUpdated', {
          votes: foodMap[suggestion].length,
          food: suggestion,
        });
    });
});

const port = 8000;
io.listen(port);
console.log("Listening on port ", port);