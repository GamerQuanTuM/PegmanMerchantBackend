import cron from 'node-cron';

type CronJob = {
  name: string;
  schedule: string;
  task: () => void;
  isRunning: boolean;
};

class Scheduler {
  private jobs: Map<string, CronJob>;
  private tasks: Map<string, ReturnType<typeof cron.schedule>>;

  constructor() {
    this.jobs = new Map();
    this.tasks = new Map();
  }

  /**
   * Schedule a new cron job
   * @param name - Unique identifier for the job
   * @param schedule - Cron schedule expression (e.g., '* * * * *' for every minute)
   * @param task - Function to execute on schedule
   * @returns boolean indicating if job was scheduled successfully
   */
  scheduleJob(name: string, schedule: string, task: () => void): boolean {
    // Validate if the cron expression is valid
    if (!cron.validate(schedule)) {
      console.error(`Invalid cron schedule expression: ${schedule}`);
      return false;
    }

    // Check if job with same name already exists
    if (this.jobs.has(name)) {
      console.error(`Job with name '${name}' already exists`);
      return false;
    }

    try {
      // Create and schedule the task
      const scheduledTask = cron.schedule(schedule, task, {
        name: name,
        timezone: 'Asia/Kolkata'
      });

      // Store job details
      const job: CronJob = {
        name,
        schedule,
        task,
        isRunning: true
      };

      this.jobs.set(name, job);
      this.tasks.set(name, scheduledTask);

      console.log(`Job '${name}' scheduled successfully with schedule: ${schedule}`);
      return true;
    } catch (error) {
      console.error(`Failed to schedule job '${name}':`, error);
      return false;
    }
  }

  /**
   * Stop a scheduled job
   * @param name - Name of the job to stop
   * @returns boolean indicating if job was stopped successfully
   */
  stopJob(name: string): boolean {
    if (!this.jobs.has(name) || !this.tasks.has(name)) {
      console.error(`Job '${name}' not found`);
      return false;
    }

    try {
      const task = this.tasks.get(name);
      task?.stop();

      // Update job status
      const job = this.jobs.get(name);
      if (job) {
        job.isRunning = false;
        this.jobs.set(name, job);
      }

      console.log(`Job '${name}' stopped successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to stop job '${name}':`, error);
      return false;
    }
  }

  /**
   * Restart a stopped job
   * @param name - Name of the job to restart
   * @returns boolean indicating if job was restarted successfully
   */
  restartJob(name: string): boolean {
    if (!this.jobs.has(name)) {
      console.error(`Job '${name}' not found`);
      return false;
    }

    const job = this.jobs.get(name);
    if (!job) return false;

    // If job is already running, stop it first
    if (job.isRunning && this.tasks.has(name)) {
      this.stopJob(name);
    }

    try {
      // Reschedule the job
      const scheduledTask = cron.schedule(job.schedule, job.task, {
        name: name,
        timezone: 'Asia/Kolkata'
      });

      // Update job status
      job.isRunning = true;
      this.jobs.set(name, job);
      this.tasks.set(name, scheduledTask);

      console.log(`Job '${name}' restarted successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to restart job '${name}':`, error);
      return false;
    }
  }

  /**
   * Remove a job from the scheduler
   * @param name - Name of the job to remove
   * @returns boolean indicating if job was removed successfully
   */
  removeJob(name: string): boolean {
    if (!this.jobs.has(name)) {
      console.error(`Job '${name}' not found`);
      return false;
    }

    try {
      // Stop the job if it's running
      if (this.tasks.has(name)) {
        const task = this.tasks.get(name);
        task?.stop();
        this.tasks.delete(name);
      }

      // Remove job from jobs map
      this.jobs.delete(name);

      console.log(`Job '${name}' removed successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to remove job '${name}':`, error);
      return false;
    }
  }

  /**
   * Update an existing job's schedule
   * @param name - Name of the job to update
   * @param schedule - New cron schedule expression
   * @returns boolean indicating if job was updated successfully
   */
  updateJobSchedule(name: string, schedule: string): boolean {
    if (!this.jobs.has(name)) {
      console.error(`Job '${name}' not found`);
      return false;
    }

    // Validate if the cron expression is valid
    if (!cron.validate(schedule)) {
      console.error(`Invalid cron schedule expression: ${schedule}`);
      return false;
    }

    const job = this.jobs.get(name);
    if (!job) return false;

    try {
      // Stop the current job
      if (this.tasks.has(name)) {
        const task = this.tasks.get(name);
        task?.stop();
      }

      // Create a new scheduled task with updated schedule
      const scheduledTask = cron.schedule(schedule, job.task, {
        name: name,
        timezone: 'Asia/Kolkata'
      });

      // Update job details
      job.schedule = schedule;
      job.isRunning = true;
      this.jobs.set(name, job);
      this.tasks.set(name, scheduledTask);

      console.log(`Job '${name}' schedule updated to: ${schedule}`);
      return true;
    } catch (error) {
      console.error(`Failed to update job '${name}' schedule:`, error);
      return false;
    }
  }

  /**
   * List all scheduled jobs
   * @returns Array of job details
   */
  listJobs(): Array<{ name: string; schedule: string; isRunning: boolean }> {
    const jobList: Array<{ name: string; schedule: string; isRunning: boolean }> = [];

    this.jobs.forEach((job) => {
      jobList.push({
        name: job.name,
        schedule: job.schedule,
        isRunning: job.isRunning
      });
    });

    return jobList;
  }

  /**
   * Get details of a specific job
   * @param name - Name of the job
   * @returns Job details or null if not found
   */
  getJob(name: string): { name: string; schedule: string; isRunning: boolean } | null {
    const job = this.jobs.get(name);
    if (!job) return null;

    return {
      name: job.name,
      schedule: job.schedule,
      isRunning: job.isRunning
    };
  }

  /**
   * Stop all running jobs
   */
  stopAllJobs(): void {
    this.tasks.forEach((task, name) => {
      task.stop();
      const job = this.jobs.get(name);
      if (job) {
        job.isRunning = false;
        this.jobs.set(name, job);
      }
    });
    console.log('All jobs stopped');
  }
}

// Create and export a singleton instance
const scheduler = new Scheduler();
export default scheduler;