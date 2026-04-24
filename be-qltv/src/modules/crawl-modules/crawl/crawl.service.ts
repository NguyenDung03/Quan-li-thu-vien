import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';
import { CrawlUrlDto, CrawlResponseDto } from './dto/crawl.dto';

@Injectable()
export class CrawlService {
  private readonly crawl4aiUrl: string;
  private readonly uploadDir: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {
    this.crawl4aiUrl = this.configService.get<string>(
      'CRAWL4AI_URL',
      'http://localhost:11235',
    );

    this.uploadDir = path.join(process.cwd(), 'uploads');
  }

  async crawl(crawlDto: CrawlUrlDto): Promise<CrawlResponseDto> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.crawl4aiUrl + '/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: crawlDto.urls,
          priority: crawlDto.priority ?? 10,

          browser_config: {
            browser_type: 'undetected',
            headless: true,
            extra_args: [
              '--disable-blink-features=AutomationControlled',
              '--disable-web-security',
            ],
          },
        }),
      });

      if (!response.ok) {
        throw new HttpException(
          `Crawl4AI API error: ${response.status} ${response.statusText}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = (await response.json()) as Record<string, unknown>;

      if (data && typeof data === 'object' && 'results' in data) {
        const results = data.results as Array<{
          url: string;
          markdown: { fit_markdown?: string; raw_markdown?: string } | string;
          fit_markdown?: string;
          tables: Array<{ data: unknown[] }>;
        }>;
        if (results && results.length > 0) {
          const resultItem = results[0];

          let markdownContent = '';
          if (
            typeof resultItem.markdown === 'object' &&
            resultItem.markdown !== null
          ) {
            markdownContent =
              resultItem.markdown.fit_markdown ||
              resultItem.markdown.raw_markdown ||
              '';
          } else if (typeof resultItem.markdown === 'string') {
            markdownContent = resultItem.markdown;
          }

          if (!markdownContent && resultItem.fit_markdown) {
            markdownContent =
              typeof resultItem.fit_markdown === 'string'
                ? resultItem.fit_markdown
                : String(resultItem.fit_markdown);
          }

          let contentToSave = markdownContent;
          if (resultItem.tables && resultItem.tables.length > 0) {
            const tablesContent = this.formatTablesAsMarkdown(
              resultItem.tables,
            );
            contentToSave = markdownContent + '\n\n' + tablesContent;
          }

          if (contentToSave && contentToSave.trim()) {
            await this.processAndQueueMarkdown(contentToSave, resultItem.url);
          }
        }
      }

      const endTime = Date.now();

      return {
        status: 'success',
        data,
        time: endTime - startTime,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      throw new HttpException(
        `Failed to connect to Crawl4AI: ${errorMessage}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async checkHealth(): Promise<{ status: string; service: string }> {
    try {
      const response = await fetch(this.crawl4aiUrl + '/monitor/health', {
        method: 'GET',
      });

      if (response.ok) {
        return {
          status: 'connected',
          service: 'Crawl4AI',
        };
      }

      return {
        status: 'unhealthy',
        service: 'Crawl4AI',
      };
    } catch {
      return {
        status: 'unreachable',
        service: 'Crawl4AI',
      };
    }
  }

  async getTaskResult(taskId: string): Promise<any> {
    try {
      const response = await fetch(`${this.crawl4aiUrl}/task/${taskId}`);

      if (!response.ok) {
        throw new HttpException(
          'Lỗi khi lấy kết quả Task',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = (await response.json()) as Record<string, unknown>;

      if (data && typeof data === 'object' && 'results' in data) {
        const results = data.results as Array<{
          url: string;
          markdown: { fit_markdown?: string; raw_markdown?: string } | string;
          fit_markdown?: string;
          tables: Array<{ data: unknown[] }>;
        }>;
        if (results && results.length > 0) {
          const resultItem = results[0];

          let markdownContent = '';
          if (
            typeof resultItem.markdown === 'object' &&
            resultItem.markdown !== null
          ) {
            markdownContent =
              resultItem.markdown.fit_markdown ||
              resultItem.markdown.raw_markdown ||
              '';
          } else if (typeof resultItem.markdown === 'string') {
            markdownContent = resultItem.markdown;
          }

          if (!markdownContent && resultItem.fit_markdown) {
            markdownContent =
              typeof resultItem.fit_markdown === 'string'
                ? resultItem.fit_markdown
                : String(resultItem.fit_markdown);
          }

          let contentToSave = markdownContent;
          if (resultItem.tables && resultItem.tables.length > 0) {
            const tablesContent = this.formatTablesAsMarkdown(
              resultItem.tables,
            );
            contentToSave = markdownContent + '\n\n' + tablesContent;
          }

          if (contentToSave && contentToSave.trim()) {
            await this.processAndQueueMarkdown(contentToSave, resultItem.url);
          }
        }
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      throw new HttpException(
        `Không thể kết nối lấy Task: ${errorMessage}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async processAndQueueMarkdown(
    markdownContent: string,
    sourceUrl: string,
  ): Promise<{ message: string; file: string }> {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const fileName = `doc_${Date.now()}.md`;
    const filePath = path.join(this.uploadDir, fileName);
    fs.writeFileSync(filePath, markdownContent, 'utf8');

    this.rabbitClient.emit('upload_file_to_google', {
      filePath,
      sourceUrl,
    });

    return {
      message: 'Đã cào thành công và đưa vào hàng đợi xử lý ngầm!',
      file: fileName,
    };
  }

  private formatTablesAsMarkdown(tables: Array<{ data: unknown[] }>): string {
    if (!tables || tables.length === 0) {
      return '';
    }

    let output = '## Các bảng dữ liệu được trích xuất\n\n';

    tables.forEach((table, index) => {
      if (table.data && table.data.length > 0) {
        output += `### Bảng ${index + 1}\n\n`;

        if (Array.isArray(table.data)) {
          if (
            table.data.length > 0 &&
            typeof table.data[0] === 'object' &&
            !Array.isArray(table.data[0])
          ) {
            const headers = Object.keys(
              table.data[0] as Record<string, unknown>,
            );

            output += '| ' + headers.join(' | ') + ' |\n';

            output += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

            for (const row of table.data) {
              const rowObj = row as Record<string, unknown>;
              output +=
                '| ' +
                headers.map((h) => String(rowObj[h] ?? '')).join(' | ') +
                ' |\n';
            }
          } else if (table.data.length > 0 && Array.isArray(table.data[0])) {
            for (const row of table.data) {
              output += '| ' + (row as unknown[]).join(' | ') + ' |\n';
            }
          }
        }

        output += '\n';
      }
    });

    return output;
  }
}
