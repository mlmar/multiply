const DEV = false;

const LOCAL_SERVER = 'http://192.168.0.89:3300';
const DEPLOYED_SERVER = 'https://multiply-auth.vercel.app';

export const SERVER_URL = DEV ? LOCAL_SERVER : DEPLOYED_SERVER;