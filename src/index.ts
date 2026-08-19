import registerWorker from './worker'
import registerSharedWorker from './shared'
import registerServiceWorker from './service'
import { getContainer as getServiceWorkerContainer } from './service'

export {
  registerWorker,
  registerSharedWorker,
  registerServiceWorker,
  getServiceWorkerContainer,
}