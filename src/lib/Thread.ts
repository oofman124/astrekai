export interface RBXThread<TArgs extends Array<unknown>> {
	name: string;
	stepEvent: RBXScriptSignal;
	connection: RBXScriptConnection;
	completed: boolean;
	lastStepTime: number;
	rate: number;
	alive: boolean;
	enabled: boolean;
	stepFunction: (...args: TArgs) => void;

	step(...args: TArgs): void;
	setEnabled(state: boolean): void;
	destroy(): void;
}

export class Thread<TArgs extends Array<unknown>> implements RBXThread<TArgs> {
	public static threads = new Array<RBXThread<Array<unknown>>>();

	public name: string;
	public stepEvent: RBXScriptSignal;
	public connection: RBXScriptConnection;
	public completed: boolean = true;
	public lastStepTime = time();
	public rate: number;
	public alive: boolean = true;
	public enabled: boolean = true;
	public stepFunction: (...args: TArgs) => void;

	private constructor(
		name: string,
		rate: number,
		stepEvent: RBXScriptSignal,
		stepFunction: (...args: TArgs) => void,
	) {
		this.name = name;
		this.rate = rate;
		this.stepEvent = stepEvent;
		this.stepFunction = stepFunction;
		this.connection = stepEvent.Connect((...args: TArgs) => {
			if (this.completed && this.alive && this.enabled && time() - this.lastStepTime >= 1 / this.rate) {
				this.lastStepTime = time();
				this.completed = false;
				this.stepFunction(...args);
				this.completed = true;
			}
		});
	}

	public static createThread<TCreateArgs extends Array<unknown>>(
		name: string,
		rate: number,
		stepEvent: RBXScriptSignal,
		stepFunction: (...args: TCreateArgs) => void,
	): Thread<TCreateArgs> {
		const thread = new Thread(name, rate, stepEvent, stepFunction);
		Thread.threads.push(thread as RBXThread<Array<unknown>>);
		return thread;
	}

	public step(...args: TArgs): void {
		this.lastStepTime = time();
		this.completed = false;
		this.stepFunction(...args);
		this.completed = true;
	}

	public setEnabled(state: boolean): void {
		this.enabled = state;
	}

	public destroy(): void {
		if (!this.alive) return;

		this.alive = false;
		this.connection.Disconnect();

		const index = Thread.threads.findIndex((t) => t.name === this.name);
		if (index >= 0) {
			Thread.threads.remove(index + 1);
		}
	}
}

export function findThread(name: string): RBXThread<Array<unknown>> | undefined {
	for (const thread of Thread.threads) {
		if (thread.name === name) {
			return thread;
		}
	}
	return undefined;
}
export function removeThread(name: string): void {
	for (let i = Thread.threads.size(); i >= 1; i -= 1) {
		const thread = Thread.threads[i - 1];
		if (thread && thread.name === name) {
			thread.destroy();
		}
	}
}

export function removeDeadThreads(): void {
	for (let i = Thread.threads.size(); i >= 1; i -= 1) {
		const thread = Thread.threads[i - 1];
		if (thread && !thread.alive) {
			thread.destroy();
		}
	}
}
