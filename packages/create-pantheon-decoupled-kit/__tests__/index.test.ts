// import like this so we can vi.spyOn
import * as bin from '../src/index';
const { parseArgs, main } = bin;
import { decoupledKitTestGenerators } from './testGenerators/generators/index';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as nodePlop from 'node-plop';
import { helpMenu } from '../src/utils/helpMenu';
import pkg from '../package.json' assert { type: 'json' };

vi.mock('node-plop');
vi.mock('inquirer');

afterEach(() => {
	vi.restoreAllMocks();
});

describe('parseArgs()', () => {
	it('should parse args from the command line', () => {
		process.argv = [
			'node',
			'bin.js',
			'sample',
			'test',
			'--input',
			'test input',
			'--outDir',
			`${process.cwd()}/temp`,
			'--message',
			'test message',
			'--choice',
			'one',
			'--choice2',
			'four',
		];

		const parsedArgs = parseArgs();

		expect(parsedArgs._).toEqual(['sample', 'test']);
		expect(parsedArgs.input).toEqual('test input');
		expect(parsedArgs.outDir).toEqual(`${process.cwd()}/temp`);
		expect(parsedArgs.message).toEqual('test message');
		expect(parsedArgs.choice).toEqual('one');
		expect(parsedArgs.choice2).toEqual('four');
	});
});

describe('setGenerators()', () => {
	it('should set all generators passed into it', async () => {
		const setGeneratorSpy = vi.spyOn(bin, 'setGenerators');
		const plop = await bin.setGenerators(decoupledKitTestGenerators);

		expect(setGeneratorSpy).toHaveBeenCalledOnce();
		expect(plop.setGenerator).toHaveBeenCalledTimes(2);
		expect(plop.setActionType).toHaveBeenCalledTimes(3);
		expect(plop).toHaveProperty('setPlopfilePath');
		expect(plop).toHaveProperty('getGenerator');
		expect(plop.getGeneratorList()).toEqual([
			{ name: 'test-add' },
			{ name: 'test-append' },
		]);
	});
});

describe('main()', () => {
	beforeEach((context) => {
		context.parseSpy = vi.spyOn(bin, 'parseArgs');
		context.mainSpy = vi.spyOn(bin, 'main');
		context.promptSpy = vi.spyOn(inquirer, 'prompt');
		context.logSpy = vi.spyOn(console, 'log');
		context.errorSpy = vi.spyOn(console, 'error');
		context.plopSpy = vi.spyOn(nodePlop, 'default');
	});
	it('should accept any number of positional arguments as generators to run', async ({
		parseSpy,
		mainSpy,
		promptSpy,
	}) => {
		process.argv = ['node', 'bin.js', 'test-add', 'test-append'];

		await bin.main(
			bin.parseArgs(process.argv.slice(2)),
			decoupledKitTestGenerators,
		);

		expect(parseSpy).toBeCalled;
		expect(parseSpy).toBeCalledWith(process.argv.slice(2));
		expect(mainSpy).toHaveBeenLastCalledWith(
			{
				_: ['test-add', 'test-append'],
				force: false,
				silent: false,
				help: false,
				h: false,
				version: false,
				v: false,
			},
			decoupledKitTestGenerators,
		);
		expect(promptSpy).toHaveBeenCalledTimes(2);
	});

	it('should ask for user input if there is no valid generator to run', async ({
		logSpy,
		promptSpy,
	}) => {
		process.argv = ['node', 'bin.js', 'not-valid-generator-name'];

		// inquirer is mocked so we know the type is wrong.
		//@ts-ignore
		inquirer.prompt.mockImplementationOnce(() => ({
			generators: ['test-add'],
		}));

		await main(parseArgs(), decoupledKitTestGenerators);

		expect(logSpy).toHaveBeenLastCalledWith(
			chalk.yellow('No generator found with name not-valid-generator-name.'),
		);
		// We expect 2 calls, the first prompts with the list of available generators
		// the second runs the generator prompts
		expect(promptSpy).toHaveBeenCalledTimes(2);
	});
	it('should exit with a message if no valid generators are selected', async ({
		logSpy,
		errorSpy,
		promptSpy,
	}) => {
		process.argv = ['node', 'bin.js', 'not-valid-generator-name'];

		await main(parseArgs(), decoupledKitTestGenerators);

		expect(logSpy).toHaveBeenLastCalledWith(
			chalk.yellow('No generator found with name not-valid-generator-name.'),
		);
		expect(errorSpy).toHaveBeenLastCalledWith(
			chalk.red(
				'No generators were selected. Use positional arguments or choose from the prompt.',
			),
		);
		expect(promptSpy).toHaveBeenCalledTimes(1);
	});

	it('should log changes', async ({ logSpy, plopSpy }) => {
		process.argv = ['node', 'bin.js', 'test-add'];
		vi.mocked(nodePlop.default).mockReturnValueOnce({
			//@ts-ignore
			setPlopfilePath: vi.fn(),
			getPlopfilePath: vi.fn(),
			setPartial: vi.fn(),
			getGenerator: vi.fn().mockImplementation(() => ({
				runActions: vi.fn().mockReturnValue({
					changes: [{ type: 'add', path: '/test' }],
					failures: [],
				}),
			})),
			setActionType: vi.fn(),
			setGenerator: vi.fn(),
			getGeneratorList: vi
				.fn()
				.mockImplementation(() => [
					{ name: 'test-add' },
					{ name: 'test-append' },
				]),
			setHelper: vi.fn(),
		});

		await main(parseArgs(), decoupledKitTestGenerators);

		expect(logSpy).toHaveBeenLastCalledWith(
			chalk.green('add'),
			chalk.cyan('/test'),
		);
		expect(plopSpy).toHaveBeenCalledTimes(1);
	});

	it('should log failures', async ({ errorSpy }) => {
		vi.mocked(nodePlop.default).mockReturnValueOnce({
			//@ts-ignore
			setPlopfilePath: vi.fn(),
			getPlopfilePath: vi.fn(),
			setPartial: vi.fn(),
			getGenerator: vi.fn().mockImplementation(() => ({
				runActions: vi.fn().mockReturnValue({
					changes: [],
					failures: [
						{
							error: `File already exists\n  -> /test/test.js`,
						},
					],
				}),
			})),
			setActionType: vi.fn(),
			setGenerator: vi.fn(),
			getGeneratorList: vi
				.fn()
				.mockImplementation(() => [
					{ name: 'test-add' },
					{ name: 'test-append' },
				]),
			setHelper: vi.fn(),
		});
		await main(parseArgs(), decoupledKitTestGenerators);
		expect(errorSpy).toHaveBeenLastCalledWith(
			chalk.red(`File already exists\n  -> /test/test.js`),
		);
	});

	it('should not console.log if "silent" arg is true', async ({ logSpy }) => {
		process.argv = ['node', 'bin.js', 'test-add', '--silent'];

		await main(parseArgs(), decoupledKitTestGenerators);

		expect(logSpy).toHaveBeenCalledTimes(0);
	});

	it('should show the help menu if --help or -h is in the args', async ({
		logSpy,
	}) => {
		// --help
		process.argv = ['node', 'bin.js', '--help'];

		await main(parseArgs(), decoupledKitTestGenerators);

		expect(logSpy).toHaveBeenLastCalledWith(helpMenu);

		// -h
		process.argv = ['node', 'bin.js', '-h'];

		await main(parseArgs(), decoupledKitTestGenerators);

		expect(logSpy).toHaveBeenLastCalledWith(helpMenu);
	});

	it('should show the version if --version or -v is in the args', async ({
		logSpy,
	}) => {
		// --version
		process.argv = ['node', 'bin.js', '--version'];

		await main(parseArgs(), decoupledKitTestGenerators);

		expect(logSpy).toHaveBeenLastCalledWith(`v${pkg.version}`);

		// -v
		process.argv = ['node', 'bin.js', '-v'];

		await main(parseArgs(), decoupledKitTestGenerators);

		expect(logSpy).toHaveBeenLastCalledWith(`v${pkg.version}`);
	});
});
