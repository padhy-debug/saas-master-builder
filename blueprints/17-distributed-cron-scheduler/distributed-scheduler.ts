/**
 * Distributed Cron & Recurring Task Scheduler
 * Uses PostgreSQL Advisory Transaction Locks to guarantee exactly-once execution across horizontal pods.
 */

import { Pool } from 'pg';

export interface ScheduledTask {
  name: string;
  lockId: number; // 32-bit unique integer for postgres advisory lock
  intervalMs: number;
  handler: () => Promise<void>;
}

export class DistributedCronScheduler {
  private db: Pool;
  private tasks: ScheduledTask[] = [];
  private intervals: NodeJS.Timeout[] = [];
  private isRunning: boolean = false;

  constructor(pool: Pool) {
    this.db = pool;
  }

  registerTask(task: ScheduledTask) {
    this.tasks.push(task);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log(`⏱️ [Distributed Scheduler] Started with ${this.tasks.length} registered task(s).`);

    for (const task of this.tasks) {
      const interval = setInterval(async () => {
        await this.executeWithAdvisoryLock(task);
      }, task.intervalMs);

      this.intervals.push(interval);
    }
  }

  stop() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.isRunning = false;
    console.log('⏱️ [Distributed Scheduler] Stopped.');
  }

  private async executeWithAdvisoryLock(task: ScheduledTask) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // pg_try_advisory_xact_lock: Attempts to acquire lock for duration of this transaction.
      // Returns true if lock acquired; false if another server instance already holds it.
      const lockRes = await client.query('SELECT pg_try_advisory_xact_lock($1) as acquired;', [task.lockId]);
      const acquired = lockRes.rows[0].acquired;

      if (!acquired) {
        // Another instance is already running this task. Release and exit cleanly.
        await client.query('ROLLBACK');
        return;
      }

      console.log(`▶️ [Task Executing]: '${task.name}' (Lock ${task.lockId} acquired)`);
      const startTime = Date.now();

      await task.handler();

      const durationMs = Date.now() - startTime;
      console.log(`✅ [Task Completed]: '${task.name}' in ${durationMs}ms`);

      // Commit releases the advisory lock automatically
      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error(`❌ [Task Failed]: '${task.name}':`, err.message);
    } finally {
      client.release();
    }
  }
}
