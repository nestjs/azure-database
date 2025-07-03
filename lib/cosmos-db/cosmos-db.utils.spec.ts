import { getuserAgentSuffix } from './cosmos-db.utils';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Mock fs/promises
jest.mock('fs/promises');
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe('cosmos-db.utils', () => {
  describe('getuserAgentSuffix', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return user agent with package info when package.json exists', async () => {
      const mockPackageJson = {
        name: '@nestjs/azure-database',
        version: '4.0.0',
      };

      mockReadFile.mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await getuserAgentSuffix();

      expect(mockReadFile).toHaveBeenCalledWith(join(__dirname, '..', '..', 'package.json'), 'utf8');
      expect(result).toBe(
        `node.js/${process.version} (${process.platform}; ${process.arch}) ${mockPackageJson.name}/${mockPackageJson.version}`,
      );
    });

    it('should return fallback user agent when package.json cannot be read', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const result = await getuserAgentSuffix();

      expect(mockReadFile).toHaveBeenCalledWith(join(__dirname, '..', '..', 'package.json'), 'utf8');
      expect(result).toBe(`node.js/${process.version} (${process.platform}; ${process.arch}) @nestjs/azure-database/0.0.0`);
    });

    it('should return fallback user agent when package.json is invalid JSON', async () => {
      mockReadFile.mockResolvedValue('invalid json content');

      const result = await getuserAgentSuffix();

      expect(mockReadFile).toHaveBeenCalledWith(join(__dirname, '..', '..', 'package.json'), 'utf8');
      expect(result).toBe(`node.js/${process.version} (${process.platform}; ${process.arch})`);
    });

    it('should return fallback user agent when package.json has missing properties', async () => {
      const mockPackageJson = {
        name: '@nestjs/azure-database',
        // version is missing
      };

      mockReadFile.mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await getuserAgentSuffix();

      expect(result).toBe(`node.js/${process.version} (${process.platform}; ${process.arch})`);
    });
  });
});
