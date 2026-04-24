import 'reflect-metadata';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// Nạp biến môi trường từ .env ở thư mục gốc
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Quét Entity bằng đường dẫn tương đối để tránh lỗi Alias
  entities: [path.join(process.cwd(), 'src/modules/**/*.entity{.ts,.js}')],
  migrations: [path.join(process.cwd(), 'src/migrations/*{.ts,.js}')],
  synchronize: false,
});
