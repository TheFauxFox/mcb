import net from 'net';
import dns from 'dns';

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

export const pinger = async (addr: string, timeout: number = 30_000, count = 10) => {
  let host = '';
  let port = 25565;

  if (addr.match(/\d+\.\d+\.\d+\.\d+/)) {
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
    const res = await _ping();
    if (res) return true;
  }

  return false;
};

pinger('play.theoasismc.com').then(console.log);
