import type { ComputedRef, InjectionKey } from 'vue'

export const gridColsKey: InjectionKey<ComputedRef<number>> = Symbol('grid-cols')
export const consumeClickKey: InjectionKey<() => boolean> = Symbol('consume-click')
