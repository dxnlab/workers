// @ts-nocheck
import { serviceWorker, on, BaseScope } from '@dxnlab/workers/service'
/**
 * test worker definition
 */
@serviceWorker
export class FetchWorker extends BaseScope {
  @on('fetch')
  messageOnFetch({request, respondWith}:any) {
    console.log('fetched', request);
    // const path = new URL(request.url).pathname;
    // if(/testping/i.test(path)) {
    //   const resp = new Response('pong'); 
    //   respondWith(resp);
    //   this.postMessage({
    //     path,
    //     message: 'pong',
    //   });
    // }
  }

  @on('activate')
  onActivate() {
    this.broadcast('fetcher activated');
  }

  @on('install')
  onInstalled() {
    this.broadcast('fetched installed');
  }

  @on('message')
  postBack(event:any) {
    this.postBack(event, event?.data);
  }
}