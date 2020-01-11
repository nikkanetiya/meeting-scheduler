import { initEnv } from '../config';
initEnv();

import Firestore from '@google-cloud/firestore';
export default new Firestore();
