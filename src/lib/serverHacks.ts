export class tpsGetter {
	private lastAge = -1;
	private lastTime = -1;
	private tps = 0;

	public tickIngameTime(igt: number) {
		const time = Date.now();
		if (this.lastTime === -1 && this.lastAge === -1) {
			this.lastTime = time;
			this.lastAge = igt;
			return;
		}
		const diffTime = time - this.lastTime;
		const diffAge = igt - this.lastAge;
		this.lastTime = time;
		this.lastAge = igt;
		const _tps = diffAge / (diffTime / 1000);
		this.tps = Math.round(_tps * 100) / 100;
	}

	public getTps() {
		return this.tps;
	}
}
