// import { injectable } from "tsyringe"
// import OAuthAdapter from "./oauth"

// @injectable()
// export default class OAuthAdapterRegistry {

//   private adapters = new Map<string, OAuthAdapter>()

//   register(provider: string, adapter: OAuthAdapter) {
//     this.adapters.set(provider, adapter)
//   }

//   get(provider: string): OAuthAdapter {

//     const adapter = this.adapters.get(provider)

//     if (!adapter) {
//       throw new Error(`OAuth adapter not found: ${provider}`)
//     }

//     return adapter
//   }
// }