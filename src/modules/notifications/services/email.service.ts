import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    // Cấu hình cho Gmail (có thể thay đổi theo nhà cung cấp email khác)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER') || 'your-email@gmail.com',
        pass: this.configService.get('EMAIL_PASSWORD') || 'your-app-password',
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email service connection failed:', error);
      } else {
        this.logger.log('Email service is ready to send emails');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Nếu không có email credentials, chỉ log để test
      if (!this.configService.get<string>('EMAIL_USER')) {
        this.logger.log(`📧 [TEST MODE] Email would be sent to: ${options.to}`);
        this.logger.log(`📧 [TEST MODE] Subject: ${options.subject}`);
        this.logger.log(`📧 [TEST MODE] Content: ${options.text?.substring(0, 100) || 'No content'}...`);
        return true; // Giả lập gửi thành công
      }

      const mailOptions = {
        from: `"QLTime" <${this.configService.get('EMAIL_USER')}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendTaskReminderEmail(email: string, tasks: any[]): Promise<boolean> {
    const subject = `QLTime - Nhắc nhở: ${tasks.length} công việc sắp hết hạn`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔔 Nhắc nhở từ QLTime</h2>
        <p>Bạn có <strong>${tasks.length}</strong> công việc sắp hết hạn:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${tasks.map(task => `
            <div style="border-left: 4px solid #ef4444; padding: 10px; margin: 10px 0; background: white;">
              <h3 style="margin: 0; color: #1f2937;">${task.title}</h3>
              <p style="margin: 5px 0; color: #6b7280;">
                📅 Hết hạn: ${new Date(task.dueDate).toLocaleDateString('vi-VN')}
              </p>
              ${task.description ? `<p style="margin: 5px 0; color: #6b7280;">${task.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
        
        <p>
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/tasks" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Xem tất cả công việc
          </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af;">
          Email này được gửi từ QLTime. 
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/unsubscribe?token={{unsubscribeToken}}" 
             style="color: #6b7280;">Hủy đăng ký</a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `QLTime - Bạn có ${tasks.length} công việc sắp hết hạn. Truy cập ${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/tasks để xem chi tiết.`
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const subject = 'Chào mừng bạn đến với QLTime!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎉 Chào mừng ${name}!</h2>
        <p>Cảm ơn bạn đã đăng ký nhận thông báo từ QLTime.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Bạn sẽ nhận được:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
            <li>Thông báo công việc sắp hết hạn</li>
            <li>Tóm tắt tiến độ công việc</li>
            <li>Gợi ý tối ưu hóa thời gian</li>
          </ul>
        </div>
        
        <p>
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Bắt đầu sử dụng QLTime
          </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af;">
          Email này được gửi từ QLTime. 
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/unsubscribe?token={{unsubscribeToken}}" 
             style="color: #6b7280;">Hủy đăng ký</a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `Chào mừng ${name} đến với QLTime! Truy cập ${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'} để bắt đầu.`
    });
  }

  async sendWelcomeEmailPublic(email: string, name: string, unsubscribeToken: string): Promise<boolean> {
    const subject = 'Chào mừng bạn đến với QLTime - Đăng ký thành công!';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎉 Chào mừng ${name}!</h2>
        <p>Cảm ơn bạn đã đăng ký nhận thông báo từ QLTime.</p>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Bạn sẽ nhận được thông báo về:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
            <li>📅 Công việc sắp hết hạn</li>
            <li>⏰ Nhắc nhở quan trọng</li>
            <li>📊 Cập nhật tiến độ</li>
          </ul>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;">
            <strong>💡 Mẹo:</strong> Để nhận được thông báo đầy đủ nhất, hãy tạo tài khoản và thêm các công việc của bạn vào QLTime!
          </p>
        </div>

        <p style="text-align: center;">
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}"
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px;">
            Khám phá QLTime
          </a>
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/register"
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px;">
            Tạo tài khoản miễn phí
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          Email này được gửi từ QLTime.
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/unsubscribe?token=${unsubscribeToken}"
             style="color: #6b7280;">Hủy đăng ký</a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `Chào mừng ${name} đến với QLTime! Bạn đã đăng ký nhận thông báo thành công. Truy cập ${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'} để khám phá.`
    });
  }

  async sendTaskReminderEmailPublic(email: string, name: string, tasks: any[], unsubscribeToken: string): Promise<boolean> {
    const subject = `QLTime - Nhắc nhở: ${tasks.length} công việc sắp hết hạn`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔔 Nhắc nhở từ QLTime</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Bạn có <strong>${tasks.length}</strong> công việc sắp hết hạn:</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${tasks.map(task => {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const hoursLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
            const urgencyColor = hoursLeft <= 4 ? '#ef4444' : hoursLeft <= 24 ? '#f59e0b' : '#10b981';

            return `
            <div style="border-left: 4px solid ${urgencyColor}; padding: 15px; margin: 15px 0; background: white; border-radius: 4px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937;">${task.title}</h3>
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                📅 Hết hạn: ${dueDate.toLocaleDateString('vi-VN')} lúc ${dueDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                ${hoursLeft > 0 ? `(còn ${hoursLeft} giờ)` : '⚠️ ĐÃ QUÁ HẠN'}
              </p>
              ${task.description ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">${task.description}</p>` : ''}
              ${task.priority ? `<span style="background: ${task.priority === 'high' ? '#fecaca' : task.priority === 'medium' ? '#fed7aa' : '#d1fae5'}; color: ${task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#ea580c' : '#059669'}; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                ${task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
              </span>` : ''}
            </div>
          `}).join('')}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/tasks"
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
            📋 Xem tất cả công việc
          </a>
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/login"
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
            🚀 Đăng nhập QLTime
          </a>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>💡 Mẹo:</strong> Đăng nhập vào QLTime để quản lý công việc hiệu quả hơn và nhận thông báo chi tiết!
          </p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          Email này được gửi từ QLTime.
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/unsubscribe?token=${unsubscribeToken}"
             style="color: #6b7280;">Hủy đăng ký</a>
        </p>
      </div>
    `;

    const textContent = `
QLTime - Nhắc nhở: ${tasks.length} công việc sắp hết hạn

Xin chào ${name},

Bạn có ${tasks.length} công việc sắp hết hạn:

${tasks.map(task => {
  const dueDate = new Date(task.dueDate);
  return `- ${task.title}\n  Hết hạn: ${dueDate.toLocaleDateString('vi-VN')} lúc ${dueDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}).join('\n\n')}

Truy cập ${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/tasks để xem chi tiết.

Hủy đăng ký: ${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/unsubscribe?token=${unsubscribeToken}
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: textContent.trim()
    });
  }
}
