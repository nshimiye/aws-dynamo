# aws-dynamo
Managing records saved in Dynamodb

# Scenario
I want to save scheduling information
```javascript
{
  recurrence: string,
  time: string,
  timeZone: string,
  mediumType: enum, // SLACK, GMAIL, ...
  meta: json // ex: { channelId, slackBotId, slackBotName }
}
```


# Goal
Create node package that exposes a `DynamodbService` along with CRUD methods.
