import dotenv from 'dotenv';
export const initEnv = () => {
  dotenv.config();
  process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS.replace(
    /__dir__/i,
    `${process.cwd()}`
  );
};
