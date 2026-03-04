declare module 'qrcode';
declare module 'miaoda-sc-plugin';
declare module 'video-react';

declare namespace Express {
    interface Request {
        user?: {
            id: string;
            username: string;
            role: string;
        };
    }
}
