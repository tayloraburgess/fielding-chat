# db

Wrapper functions for Mongoose MongoDB queries, specific to this API.



* * *

### db.connect() 

Connects to database 'dbName'. 
Runs callback with an error if connection fails.



### db.disconnect() 

Disconnects from existing MongoDB connection. 
Runs callback with an error if disconnect fails.



### db.drop() 

Drops all documents from currently connected database.
If drop fails, runs callback with an error.



### db.getUsers() 

Gets all User documents from database.
If it fails to get them, runs callback with an error.



### db.getUserById() 

Gets a User from the database with the input '_id' property.
If it fails to get the User, runs callback with an error.



### db.getUserByName() 

Get a User from the database with the input 'name' property.
If it fails to get the User, runs callback with an error.
If there is more than one User with that name (shouldn't be based on
createUser() functionality), puts an array of Users in the callback.



### db.createUser() 

Creates a new User in the database with the input 'name' property.
First checks to make sure no other Users with that name exist using getUsers().
If it fails to create the new User, runs callback with an error.
If the User is created, returns the user in the callback.



### db.updateUserName() 

Updates the 'name' property of the User with the input '_id'.
First checks to make sure the User exists.
Then checks to make sure the 'name' property isn't already taken by another user.
If it fails to update the User, or the User doesn't exist, runs callback with an error.
If the User is updated, returns a Mongoose response object.



### db.removeUserFromLog() 

Removes the user with the input '_id' property from the Log with input '_id'.
First checks to make sure the User exists.
Then checks to make sure the Log exists.
If the Log or the User doesn't exist, runs callback with an error.



### db.removeUserFromAllLogs() 

Removes the User with the input '_id' property from all Logs.
First checks to make sure the User exists.
Then pulls all Users with the input '_id' from all 'user_ids' Log properties in the database.
If User doesn't exist, or the update fails, runs callback with an error.



### db.deleteUserMessages() 

Deletes all Messages associated with the user with the input '_id' property.
First checks to make sure the User exists.
Then deletes all messages with the input User '_id' in their 'user_id' property.
If User doesn't exist, or the update fails, runs callback with an error.



### db.deleteUser() 

Deletes a User with the input '_id' property.
First checks to make sure the User exists.
Then deletes all messages associated with the User, and removes the User from all Logs containing it.
If User doesn't exist, or any stage of removal fails, runs callback with an error.



### db.getMessages() 

Gets all Message documents from database.
If it fails to get them, runs callback with an error.



### db.getMessageById() 

Gets a Message from the database with the input '_id' property.
If it fails to get the Message, runs callback with an error.



### db.getMessageByRefId() 

Get a Message from the database with the input 'ref_id' property.
If it fails to get the Message, runs callback with an error.



### db.createMessage() 

Creates a new Message in the database with the input 'user_id' and 'name' properties.
First creates a new 'ref_id' but incrementing the one most recently added to the database.
If it fails to create the new Message, runs callback with an error.
If the Message is created, returns the Message in the callback.



### db.updateMessageText() 

Updates the 'text' property of the Message with the input '_id'.
First checks to make sure the Message exists.
If it fails to update the Message, or the Message doesn't exist, runs callback with an error.
If the Message is updated, returns a Mongoose response object.



### db.updateMessageUser() 

Updates the 'user_id' property of the Message with the input '_id'.
First checks to make sure the Message exists.
Then checks to make sure the input User exists.
If it fails to update the Message, or the Message or User doesn't exist, runs callback with an error.
If the Message is updated, returns a Mongoose response object.



### db.removeMessageFromLog() 

Removes the Message with the input '_id' property from the Log with input '_id'.
First checks to make sure the Message exists.
Then checks to make sure the Log exists.
If the Log or the Message doesn't exist, runs callback with an error.



### db.removeMessageFromAllLogs() 

Removes the Message (or Messages) with the input '_id' (or '_id's) property from all Logs.
Pulls the message/messages with the input '_id'(s) from all 'message_ids' Log properties in the database.
If the update fails, runs callback with an error.



### db.deleteMessage() 

Deletes a Message with the input '_id' property.
First checks to make sure the Message exists.
Then removes the Message from all Logs associated with it.
If Message doesn't exist, or any stage of removal fails, runs callback with an error.



### db.createLog() 

Creates a new Log in the database with the input 'user_ids' and 'message_ids' properties.
If it fails to create the new Log, runs callback with an error.
If a Log of the same input name already exists, it puts the existing Log in the callback.
If the Log is created, returns the Log in the callback.



### db.getLogs() 

Gets all Log documents from database.
If it fails to get them, runs callback with an error.



### db.getLogById() 

Gets a Log from the database with the input '_id' property.
If it fails to get the Log, runs callback with an error.



### db.getLogByName() 

Get a Log from the database with the input 'name' property.
If it fails to get the Message, runs callback with an error.
If there is more than one Log with that name (shouldn't be based on
createLog() functionality), puts an array of Logs in the callback.



### db.updateLogName() 

Updates the 'name' property of the Log with the input '_id'.
First checks to make sure the Log exists.
Then checks to make sure an existing Log doesn't have the same 'name' property.
If it fails to update the Log, or the Log doesn't exist, runs callback with an error.
If the Log is updated, returns a Mongoose response object.



### db.updateLogUsers() 

Updates the 'user_ids' property of the Log with the input '_id'.
First checks to make sure the Log exists.
If it fails to update the Log, or the Log doesn't exist, runs callback with an error.
If the Log is updated, returns a Mongoose response object.



### db.updateLogMessages() 

Updates the 'message_ids' property of the Log with the input '_id'.
First checks to make sure the Log exists.
If it fails to update the Log, or the Log doesn't exist, runs callback with an error.
If the Log is updated, returns a Mongoose response object.



### db.deleteLog() 

Deletes a Log with the input '_id' property.
First checks to make sure the Log exists.
If Log doesn't exist, or the removal fails, runs callback with an error.




* * *










