//Importing modules
const express = require('express');
const redis = require('redis');
const app = express();
const client = redis.createClient();
//API
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
//To start the server  
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
