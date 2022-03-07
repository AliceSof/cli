import * as mockFs from 'mock-fs';

import {
  DCTL_EXIT_CODES,
  DriftctlGenDriftIgnoreOptions,
  parseDescribeFlags,
  parseGenDriftIgnoreFlags,
  translateExitCode,
} from '../../../../../src/lib/iac/drift';
import envPaths from 'env-paths';
import { EXIT_CODES } from '../../../../../src/cli/exit-codes';

const paths = envPaths('snyk');

describe('driftctl integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockFs.restore();
  });

  it('describe: default arguments are correct', () => {
    const args = parseDescribeFlags({});
    expect(args).toEqual([
      'scan',
      '--no-version-check',
      '--config-dir',
      paths.cache,
      '--to',
      'aws+tf',
    ]);
  });

  it('gen-driftignore: default arguments are correct', () => {
    const args = parseGenDriftIgnoreFlags({});
    expect(args).toEqual(['gen-driftignore', '--no-version-check']);
  });

  it('describe: passing options generate correct arguments', () => {
    const args = parseDescribeFlags({
      'config-dir': 'confdir',
      'tf-lockfile': 'tflockfile',
      'tf-provider-version': 'tfproviderversion',
      'tfc-endpoint': 'tfcendpoint',
      'tfc-token': 'tfctoken',
      deep: true,
      driftignore: 'driftignore',
      filter: 'filter',
      from: 'from',
      headers: 'headers',
      quiet: true,
      strict: true,
      to: 'to',
      json: true,
      'json-file-output': 'jsonfileoutput',
      html: true,
      'html-file-output': 'htmlfileoutput',
      'only-managed': true,
      'only-unmanaged': true,
    });
    expect(args).toEqual([
      'scan',
      '--no-version-check',
      '--quiet',
      '--filter',
      'filter',
      '--output',
      'json://stdout',
      '--output',
      'json://jsonfileoutput',
      '--output',
      'html://stdout',
      '--output',
      'html://htmlfileoutput',
      '--headers',
      'headers',
      '--tfc-token',
      'tfctoken',
      '--tfc-endpoint',
      'tfcendpoint',
      '--tf-provider-version',
      'tfproviderversion',
      '--strict',
      '--deep',
      '--only-managed',
      '--only-unmanaged',
      '--driftignore',
      'driftignore',
      '--tf-lockfile',
      'tflockfile',
      '--config-dir',
      'confdir',
      '--from',
      'from',
      '--to',
      'to',
    ]);
  });

  it('describe: from arguments is a coma separated list', () => {
    const args = parseDescribeFlags({ from: 'path1,path2,path3' });
    expect(args).toEqual([
      'scan',
      '--no-version-check',
      '--config-dir',
      paths.cache,
      '--from',
      'path1',
      '--from',
      'path2',
      '--from',
      'path3',
      '--to',
      'aws+tf',
    ]);
  });

  it('gen-driftignore: passing options generate correct arguments', () => {
    const args = parseGenDriftIgnoreFlags({
      'exclude-changed': true,
      'exclude-missing': true,
      'exclude-unmanaged': true,
      input: 'analysis.json',
      output: '/dev/stdout',
      org: 'testing-org', // Ensure that this should not be translated to args
    } as DriftctlGenDriftIgnoreOptions);
    expect(args).toEqual([
      'gen-driftignore',
      '--no-version-check',
      '--input',
      'analysis.json',
      '--output',
      '/dev/stdout',
      '--exclude-changed',
      '--exclude-missing',
      '--exclude-unmanaged',
    ]);
  });

  it('run driftctl: exit code is translated', () => {
    expect(translateExitCode(DCTL_EXIT_CODES.EXIT_IN_SYNC)).toEqual(0);
    expect(translateExitCode(DCTL_EXIT_CODES.EXIT_NOT_IN_SYNC)).toEqual(
      EXIT_CODES.VULNS_FOUND,
    );
    expect(translateExitCode(DCTL_EXIT_CODES.EXIT_ERROR)).toEqual(
      EXIT_CODES.ERROR,
    );
    expect(translateExitCode(42)).toEqual(EXIT_CODES.ERROR);
  });
});