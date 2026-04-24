import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { UserRole } from '../enums/user-role.enum';

export type UserInfo = {
  email: string;
  userName: string;
  role: UserRole;
};

export type SendResetPasswordEmailParams = {
  userInfo: UserInfo;
  token: string;
};

export type SendBorrowRecordCreatedEmailParams = {
  email: string;
  fullName: string;
  bookTitle?: string;
  borrowDate: Date;
  dueDate: Date;
};

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly schoolName = 'Trường Trung Học Phổ Thông Hoài Đức A';
  private readonly schoolAddress = 'Hà Nội, Việt Nam';

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('NODEMAILER_USER'),
        pass: this.configService.get<string>('NODEMAILER_PASSWORD'),
      },
    });
  }

  async sendResetPasswordEmail(payload: SendResetPasswordEmailParams) {
    const { userInfo, token } = payload;

    const frontendUrl =
      userInfo.role === UserRole.ADMIN
        ? this.configService.get<string>('FRONTEND_ADMIN')
        : this.configService.get<string>('FRONTEND_CUSTOMER');

    const resetPasswordUrl = `${frontendUrl}/reset-password?token=${token}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .email-header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .email-header p {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
        }
        .email-body {
            padding: 40px 30px;
        }
        .greeting {
            color: #333333;
            font-size: 16px;
            margin-bottom: 24px;
        }
        .greeting strong {
            color: #1e3a5f;
        }
        .message {
            color: #555555;
            font-size: 15px;
            margin-bottom: 24px;
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .reset-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #2d5a87 0%, #1e3a5f 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(45, 90, 135, 0.4);
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px;
            border-radius: 4px;
            margin-top: 24px;
        }
        .warning p {
            color: #856404;
            font-size: 14px;
            margin: 0;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e0e0e0, transparent);
            margin: 24px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 24px 30px;
            text-align: center;
        }
        .footer p {
            color: #888888;
            font-size: 13px;
            margin-bottom: 8px;
        }
        .footer .school-name {
            color: #1e3a5f;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>📚 ${this.schoolName}</h1>
            <p>Hệ thống Quản lý Thư viện</p>
        </div>

        <div class="email-body">
            <p class="greeting">Xin chào <strong>${userInfo.userName}</strong>,</p>

            <p class="message">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại hệ thống quản lý thư viện trường ${this.schoolName}.
            </p>

            <p class="message">
                Nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:
            </p>

            <div class="button-container">
                <a href="${resetPasswordUrl}" class="reset-button">Đặt lại mật khẩu</a>
            </div>

            <div class="warning">
                <p>⚠️ <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </div>

            <div class="divider"></div>

            <p class="message" style="font-size: 13px; color: #888888;">
                Nếu nút trên không hoạt động, bạn có thể sao chép và dán link sau vào trình duyệt:<br>
                <span style="color: #2d5a87; word-break: break-all;">${resetPasswordUrl}</span>
            </p>
        </div>

        <div class="footer">
            <p class="school-name">${this.schoolName}</p>
            <p>${this.schoolAddress}</p>
            <p style="margin-top: 12px; font-size: 11px; color: #aaaaaa;">
                © ${new Date().getFullYear()} - Hệ thống Quản lý Thư viện
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: this.configService.get<string>('NODEMAILER_USER'),
      to: userInfo.email,
      subject: '📚 Đặt lại mật khẩu - Hệ thống Quản lý Thư viện',
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(
        '🔍 ~ sendResetPasswordEmail ~ src/common/services/email.service.ts:53 ~ error:',
        error,
      );
      throw new InternalServerErrorException(
        'Không thể gửi email reset password!',
      );
    }
  }

  async sendBorrowRecordCreatedEmail(
    payload: SendBorrowRecordCreatedEmailParams,
  ) {
    const { email, fullName, bookTitle, borrowDate, dueDate } = payload;
    const borrowDateLabel = borrowDate.toLocaleDateString('vi-VN');
    const dueDateLabel = dueDate.toLocaleDateString('vi-VN');

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phiếu mượn đã được tạo</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f5f7fa; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; padding: 24px;">
    <h2 style="margin-top: 0; color: #1e3a5f;">Thông báo phiếu mượn mới</h2>
    <p>Xin chào <strong>${fullName}</strong>,</p>
    <p>Bạn vừa được tạo một phiếu mượn mới trong hệ thống thư viện.</p>
    <ul>
      <li><strong>Sách:</strong> ${bookTitle || 'Không xác định'}</li>
      <li><strong>Ngày mượn:</strong> ${borrowDateLabel}</li>
      <li><strong>Hạn trả:</strong> ${dueDateLabel}</li>
    </ul>
    <p>Vui lòng theo dõi phiếu mượn trong trang cá nhân để tránh quá hạn.</p>
    <p style="margin-bottom: 0; color: #666;">${this.schoolName}</p>
  </div>
</body>
</html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('NODEMAILER_USER'),
        to: email,
        subject: '📚 Thông báo tạo phiếu mượn thành công',
        html: htmlContent,
      });
    } catch (error) {
      console.log(
        '🔍 ~ sendBorrowRecordCreatedEmail ~ src/common/services/email.service.ts ~ error:',
        error,
      );
      throw new InternalServerErrorException(
        'Không thể gửi email thông báo phiếu mượn!',
      );
    }
  }
}
