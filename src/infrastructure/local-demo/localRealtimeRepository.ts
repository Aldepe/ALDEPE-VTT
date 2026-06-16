import type { RealtimeRepository } from '@domain/repositories/realtimeRepository'

export class LocalRealtimeRepository implements RealtimeRepository {
  subscribeToCampaign(): () => void {
    return () => undefined
  }
}
