const Firestore = require('@google-cloud/firestore');
const moment = require('moment');
const jsonResponse = (data, statusCode = 200, message = 'OK') => {
  return {
    statusCode,
    message,
    data: data ? transform(data) : undefined
  };
};

const transformObj = obj => {
  if (obj.startTime && obj.startTime instanceof Firestore.Timestamp)
    obj.startTime = moment(new Date(obj.startTime._seconds * 1000)).format();
  if (obj.endTime && obj.endTime instanceof Firestore.Timestamp)
    obj.endTime = moment(new Date(obj.endTime._seconds * 1000)).format();

  // return new object to ensure key ordering
  return {
    id: obj.id,
    startTime: obj.startTime,
    endTime: obj.endTime,
    duration: obj.duration,
    minutes: obj.minutes
  };
};

const transform = data => {
  if (Array.isArray(data)) {
    return data.map(row => transformObj(row));
  }
  return transformObj(data);
};

const getMinutesArray = (start, end) => {
  let minutes = [],
    n = start;
  while (n <= end) {
    minutes.push(n);
    n++;
  }
  return minutes;
};

const toChunks = (arr, chunkSize = 10) => {
  var result = [];
  for (var i = 0, len = arr.length; i < len; i += chunkSize)
    result.push(arr.slice(i, i + chunkSize));
  return result;
};

const createEventPayload = data => {
  const startTime = new Date(data.startTime);
  startTime.setSeconds(0);
  const endTime = new Date(startTime.getTime() + data.duration * 60 * 1000 - 1);

  delete data.duration;
  const startMinutesSinceMidnight =
    startTime.getHours() * 60 + startTime.getMinutes();
  const endMinutesSinceMidnight =
    endTime.getHours() * 60 + endTime.getMinutes();

  minutes = getMinutesArray(startMinutesSinceMidnight, endMinutesSinceMidnight);

  return { startTime, endTime, minutes };
};

module.exports = {
  jsonResponse,
  transform,
  getMinutesArray,
  toChunks,
  createEventPayload
};
