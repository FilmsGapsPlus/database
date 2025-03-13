const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { AsyncLock } = require('async-mutex');

class DataManager {
  constructor(dataPath = 'database') {
    this.dataPath = dataPath;
    this.data = {};
    this.lock = new AsyncLock();
    this.loadData();
  }

  loadData() {
    try {
      this.data = JSON.parse(fs.readFileSync(path.join(this.dataPath, 'data.json')));
    } catch (error) {
      this.data = {};
    }
  }

  async saveData() {
    fs.writeFileSync(path.join(this.dataPath, 'data.json'), JSON.stringify(this.data));
  }

  async atomicUpdate(updateFn) {
    return this.lock.runExclusive(async () => {
      const result = await updateFn(this.data);
      this.saveData();
      return result;
    });
  }

  getDocument(pathSegments, id) {
    const parent = this.resolvePath(pathSegments);
    return parent ? parent[id] : null;
  }

  resolvePath(pathSegments, createIfMissing = false) {
    let current = this.data;
    for (const segment of pathSegments) {
      if (!current[segment] && createIfMissing) {
        current[segment] = {};
      }
      current = current[segment];
      if (!current) return null;
    }
    return current;
  }
}
