import React from 'react';
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import envConfig from '../config';
// import * as fs from 'fs';
// import * as path from 'path';
import OTPEmail from '../../../emails/otp';
// const optTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), 'utf-8');

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  async sendOTP(payload: { email: string; code: string }) {
    return await this.resend.emails.send({
      from: 'Nome <onboarding@resend.dev>',
      to: ['leminhduc6402@gmail.com'],
      subject: 'Mã OTP',
      react: <OTPEmail otpCode={payload.code} title="Mã xác thực OTP" />,
      // html: optTemplate.replaceAll('{{code}}', payload.code),
    });
  }
}
