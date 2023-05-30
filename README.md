# Krinati-Assaignment
RESTful API that matches users based on hobbies. Calculates compatibility scores, includes caching layer for faster response. Dockerized architecture using Node.js, Express, Redis. Clone, install dependencies, start Redis server, and launch the backend server.


 Step 1: Set up the Node.js project and install dependencies

Create a new directory for your project and navigate into it.
Initialize a new Node.js project using the following command:

npm init -y


Install the required dependencies: Express, Redis, and any other necessary packages:

npm install express redis

Step 2: Create the Express server and define the API endpoint

Create a new file called app.js and open it in a code editor.
Import the necessary modules:

//code

const express = require('express');
const redis = require('redis');
const app = express();
const client = redis.createClient();


STEP 3 : Define the API endpoint for getting potential matches:
//code
app.get('/match/:userId', (req, res) => {
  const userId = req.params.userId;

  // Fetch user hobbies from the database or any other data source
  // For simplicity, we'll use a static user data array
  const userData = [
    {
      id: 1,
      name: 'Meet',
      hobbies: ['Music', 'Chess', 'Drawing']
    },
    // Add other users here...
  ];

  const user = userData.find((user) => user.id === parseInt(userId));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Fetch potential matches from Redis cache or calculate them if not available
  client.get(`matches:${userId}`, (err, cachedMatches) => {
    if (err) {
      console.error('Error retrieving matches from cache:', err);
    }

    if (cachedMatches) {
      const matches = JSON.parse(cachedMatches);
      return res.json(matches);
    }

    // Calculate matches based on user hobbies (example algorithm)
    const matches = userData
      .filter((u) => u.id !== user.id)
      .map((u) => {
        const commonHobbies = u.hobbies.filter((hobby) =>
          user.hobbies.includes(hobby)
        );
        return {
          id: u.id,
          name: u.name,
          hobbies: u.hobbies,
          compatibility: commonHobbies.length
        };
      })
      .sort((a, b) => b.compatibility - a.compatibility);

    // Store matches in Redis cache for future requests
    client.setex(`matches:${userId}`, 3600, JSON.stringify(matches));

    res.json(matches);
  });
});

Step 3: Set up the Redis server

Install Redis on your system if you haven't already. You can follow the instructions provided on the Redis website: https://redis.io/download
Start the Redis server using the default configuration.

Step 4: Start the Express server

Add the following code at the end of the app.js file to start the server:
//code
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

Test the API

Run the Node.js application using the following command:

node app.js

Open a web browser or use an API testing tool like Postman.
Make a GET request to http://localhost:3000/match/{user_id} where {user_id} is the ID
