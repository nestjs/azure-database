import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { Logger } from '@nestjs/common';

export class AzuriteTable {
  private readonly logger = new Logger(this.constructor.name);

  private server: ChildProcessWithoutNullStreams;

  private started = false;
  private tableHost: string;
  private connectionString: string;

  constructor(private readonly port: number = 10101) {}

  public getConnectionString() {
    return this.connectionString;
  }

  public isStarted() {
    return this.started;
  }

  public async start() {
    this.server = spawn('azurite-table', ['--inMemoryPersistence', '--tablePort', this.port.toString()], {
      // Suppress DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
    });

    this.server.on('error', this.logger.error.bind(this.logger));
    this.server.on('warning', this.logger.warn.bind(this.logger));
    this.server.on('message', this.logger.log.bind(this.logger));

    await new Promise<void>((resolve, reject) => {
      this.server.stdout.on('data', (data: Buffer) => {
        if (data.toString().includes(`Azurite Table service successfully started on `)) {
          this.started = true;
          const matches = data.toString().match(/Azurite Table service successfully started on (?<host>[\d.:]+)/);
          if (matches && matches.groups) {
            this.tableHost = matches.groups['host'];
            resolve();
          } else {
            reject('Host cannot be determined');
          }
        }
      });

      this.server.stderr.on('data', (data: Buffer) => {
        this.logger.error(data.toString());
        if (!this.started) reject(data.toString());
      });
    });

    this.logger.log('Server listening');

    /**
     * https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string#configure-a-connection-string-for-azurite
     * The emulator supports a single fixed account and a well-known authentication key for Shared Key authentication.
     * This account and key are the only Shared Key credentials permitted for use with the emulator.
     *
     * They are:
     * Account name: devstoreaccount1
     * Account key: Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==
     */
    this.connectionString = `DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://${this.tableHost}/devstoreaccount1;`;
    process.env.AZURE_STORAGE_CONNECTION_STRING = this.connectionString;
  }

  public stop() {
    // Unsubscribe from listeners to avoid open handles
    this.server.off('error', this.logger.error.bind(this.logger));
    this.server.off('warning', this.logger.warn.bind(this.logger));
    this.server.off('message', this.logger.log.bind(this.logger));
    this.server.stdout.removeAllListeners();
    this.server.stderr.removeAllListeners();

    // Attempt to gracefully terminate the server
    this.server.kill();

    this.logger.log('Azurite server terminated:', this.server.killed);

    this.started = false;
  }
}
