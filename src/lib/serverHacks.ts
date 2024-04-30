import net from 'net';
import dns from 'dns';
import { sleep } from './time';

export class tpsGetter {
  private lastAge = -1;
  private lastTime = -1;
  private tps = 0;
  private tickPool: number[] = [];

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
    this.tickPool.push(Math.round(_tps * 100) / 100);
    if (this.tickPool.length > 20) {
      this.tickPool.shift();
    }
  }

  private _avgTps() {
    return this.tickPool.length == 0
      ? 0
      : this.tickPool.reduce((a, b) => a + b, 0) / this.tickPool.length;
  }

  public getTps() {
    return this._avgTps().toFixed(2);
  }
}

export const pinger = async (
  addr: string,
  timeout: number = 10_000,
  count = 30,
  onReject: (pingCount: number) => void = () => {}
) => {
  let host = '';
  let port = 25565;

  if (addr.match(/\d+\.\d+\.\d+\.\d+/) || addr.match(/localhost/i)) {
    host = addr.includes(':') ? addr.split(':')[0] : addr;
    port = addr.includes(':') ? parseInt(addr.split(':')[1]) : 25565;
  } else {
    const realIP = await dns.promises.resolveSrv(`_minecraft._tcp.${addr}`);
    if (realIP.length === 0) {
      return false;
    }
    host = realIP[0].name;
    port = realIP[0].port;
  }

  const _ping = (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const sock = net.createConnection({ timeout, host: host, port: port });
      sock.on('timeout', () => {
        resolve(false);
        sock.end();
      });
      sock.on('error', () => {
        resolve(false);
        sock.end();
      });
      sock.on('connect', () => {
        resolve(true);
        sock.end();
      });
    });
  };

  for (let i = 0; i < count; i++) {
    const start = Date.now();
    const res = await _ping();
    if (res) return true;
    else onReject(i);
    const diff = Date.now() - start;
    if (diff < timeout) {
      await sleep(timeout - diff);
    }
  }

  return false;
};
