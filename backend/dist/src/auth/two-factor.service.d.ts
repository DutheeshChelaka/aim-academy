export declare class TwoFactorService {
    generateSecret(userName: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    verifyToken(token: string, secret: string): boolean;
    generateBackupCodes(): string[];
}
