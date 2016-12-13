# botkit-storage-dynamodb

A DynamoDB storage module for Botkit.

## Usage

A DynamoDB table is required:

*Name:* _botkit_
*Primary partition (hash) key:* type _(String)_
*Primary sort (range) key:* id _(String)_

Require `botkit-storage-dynamodb` and pass it a config with the _dynamoRegion_, _dynamoAccessKey_ and _dynamoAccessSecret_ options set. If your table is *_not_* named 'botkit', then you'll need to pass in the name of your table in the _dynamoTable_ option. Then pass the returned storage when creating your Botkit controller. Botkit will do the rest.

Make sure everything you store has an `id` property, that's what you'll use to look it up later.

```
var Botkit = require('botkit'),
    dynamoStorage = require('botkit-storage-dynamodb')({
      dynamoRegion: 'us-west-2',
      dynamoAccessKey: process.env.DYNAMODB_KEY
      dynamoAccessSecret: process.env.DYNAMODB_SECRET }),
    controller = Botkit.slackbot({
        storage: dynamoStorage
    });
```

```
// then you can use the Botkit storage api, make sure you have an id property
var beans = {id: 'cool', beans: ['pinto', 'garbanzo']};
controller.storage.teams.save(beans);
beans = controller.storage.teams.get('cool');
```

Note: The _type_ field/key is stored automatically with the object based on the type of storage being called. For example, in the code above, the record will have _type: teams_. If you call users or channels storage, the type will be set to either _users_ or _channels_. This approach allows for one DynamoDB table, partitioned by storage type.
