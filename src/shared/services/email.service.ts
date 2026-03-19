import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import envConfig from '../config';

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
      html: `<strong>${payload.code}</strong>`,
    });
  }
}
