import Firestore from '@google-cloud/firestore';
import moment from 'moment';
export const jsonResponse = (data, statusCode = 200, message = 'OK') => {
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
  if (obj.time && obj.time instanceof Firestore.Timestamp)
    obj.time = moment(new Date(obj.time._seconds * 1000)).format();
  return obj;
};

const transform = data => {
  if (Array.isArray(data)) {
    return data.map(row => transformObj(row));
  }
  return transformObj(data);
};
