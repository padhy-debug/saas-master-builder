/**
 * Dual-Slot (Slot A / Slot B) Update Manager with 30s Healthcheck Rollback
 * Ensures that if a new version crashes on startup, it automatically reverts to the previous working slot.
 */

import fs from 'fs';
import path from 'path';

export interface SlotState {
  activeSlot: 'A' | 'B';
  pendingCommit: boolean;
  versionA: string;
  versionB: string;
  lastBootTimestamp: number;
}

export class DualSlotManager {
  private stateFilePath: string;
  private state: SlotState;

  constructor(dataDir: string) {
    this.stateFilePath = path.join(dataDir, 'slot-state.json');
    this.state = this.loadState();
  }

  private loadState(): SlotState {
    if (fs.existsSync(this.stateFilePath)) {
      try {
        return JSON.parse(fs.readFileSync(this.stateFilePath, 'utf-8'));
      } catch {
        // Fallback default
      }
    }
    return {
      activeSlot: 'A',
      pendingCommit: false,
      versionA: '1.0.0',
      versionB: '',
      lastBootTimestamp: Date.now(),
    };
  }

  private saveState() {
    fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  onStartup(): { activeSlot: 'A' | 'B'; rolledBack: boolean } {
    if (this.state.pendingCommit) {
      // Previous boot did not complete healthcheck! Roll back!
      console.warn('[Auto-Update Guard] Previous boot failed healthcheck. Rolling back to fallback slot.');
      this.state.activeSlot = this.state.activeSlot === 'A' ? 'B' : 'A';
      this.state.pendingCommit = false;
      this.saveState();
      return { activeSlot: this.state.activeSlot, rolledBack: true };
    }

    // Mark current boot as pending commit until healthcheck passes
    this.state.pendingCommit = true;
    this.state.lastBootTimestamp = Date.now();
    this.saveState();
    return { activeSlot: this.state.activeSlot, rolledBack: false };
  }

  commitSuccess() {
    console.log('[Auto-Update Guard] Healthcheck passed. Update committed successfully.');
    this.state.pendingCommit = false;
    this.saveState();
  }
}
