import { IsString, IsNotEmpty, Length } from 'class-validator';

export class Enable2FADto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string; // 6-digit TOTP code
}

export class Verify2FADto {
  @IsString()
  @IsNotEmpty()
  tempToken: string; // Temporary token from first login step

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  totpCode: string; // 6-digit TOTP code
}