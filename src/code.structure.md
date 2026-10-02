# Code structure for (type) workers

## common <workertype> code ordering

- Background (worker process side)
  - classic creator `create<worker_type>`
  - modular class decorator `<worker_type>`
  - modular class method decorator `on`
  - modular base class declaration `BaseScope`
- Foreground (browser side)
  - worker registration `register`

## File Structure

- worker codes
  - `<workertype>.ts` core to be exported
  - `<workertype>.types.d.ts` exporting type declarations
  - `<workertype>.feat.ts` utility functions that won't be exported

- base codes
  - `base.ts` foundation common features 
  - `types.d.ts` foundation common types
  - `index.ts` all workers integrated