# meeting-scheduler

Meeting Scheduler Demo App with Express, Cloud Firestore and Vue.js

# Command Reference

`npm start` : Start in prod mode

`npm run dev` : Start in dev mode

`npm run test`: Run tests

# API Reference

#### Add Event

```javascript
curl --location --request POST 'http://localhost:3000/events' \
--header 'Content-Type: application/json' \
--data-raw '{
	"startTime": "2020-01-14T00:00:01+05:30",
	"duration": 30
}'
```

#### List Events

```javascript
curl --location --request GET 'http://localhost:3000/events?from=2020-01-13&to=2020-01-13'
```

#### Add Slots

```javascript
curl --location --request POST 'http://localhost:3000/events/availability' \
--header 'Content-Type: application/json' \
--data-raw '{
	"start": "2020-01-13T11:30:00+05:30",
	"end":"2020-01-13T20:59:00+05:30",
	"duration": 30
}'
```

#### List Available Slots

```javascript
curl --location --request GET 'http://localhost:3000/events/availability?date=2020-01-14'
```
