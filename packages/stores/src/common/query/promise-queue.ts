interface TaskInfo {
  isExecuted: boolean;
  resolve: (result: any) => void;
  reject: (e: any) => void;
  task: () => Promise<any>;
}

export class PromiseQueue {
  protected readonly taskInfos: TaskInfo[] = [];
  public readonly concurrency: number;

  constructor(opts: { concurrency: number }) {
    this.concurrency = opts.concurrency;
  }

  run<R>(task: () => Promise<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      this.taskInfos.push({
        isExecuted: false,
        resolve,
        reject,
        task,
      });

      this.evaluateTaskInfos();
    });
  }

  get size(): number {
    return this.taskInfos.length;
  }

  protected evaluateTaskInfos() {
    if (this.concurrency <= 0) {
      for (const taskInfo of this.taskInfos) {
        if (!taskInfo.isExecuted) {
          this.executeTaskInfo(taskInfo);
        }
      }
    } else {
      let i = 0;
      for (const taskInfo of this.taskInfos) {
        if (taskInfo.isExecuted) {
          i++;
        } else if (i < this.concurrency) {
          i++;
          this.executeTaskInfo(taskInfo);
        } else {
          break;
        }
      }
    }
  }

  protected executeTaskInfo(taskInfo: TaskInfo) {
    if (taskInfo.isExecuted) {
      return;
    }

    taskInfo.isExecuted = true;
    taskInfo
      .task()
      .then((r) => {
        const i = this.taskInfos.findIndex((t) => t === taskInfo);
        if (i >= 0) {
          this.taskInfos.splice(i, 1);
        }
        taskInfo.resolve(r);
        this.evaluateTaskInfos();
      })
      .catch((e) => {
        const i = this.taskInfos.findIndex((t) => t === taskInfo);
        if (i >= 0) {
          this.taskInfos.splice(i, 1);
        }
        taskInfo.reject(e);
        this.evaluateTaskInfos();
      });
  }
}
