const fs = require("fs");
module.exports = function FileWriter() {
  this.queue = [];
  this.error = false;
  this.completed = [];

  this.add = (path, filename, data = null) => {
    this.queue.push({ path, filename, data });
  };
  this.remove = (path) => {
    this.queue = this.queue.filter((file) => file.path !== path);
  };
  this.createDir = (path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true, force: true });
    }
  };
  this.process = (dry = false) => {
    // Check for dir and create if not exists.
    if (fs.existsSync(`.tmp`)) {
      fs.rmSync(`.tmp`, { recursive: true, force: true });
    }
    // Create temporary files.
    this.queue.forEach((file) => {
      if (this.error) {
        return;
      }
      try {
        this.createDir(`.tmp/${file.path}`, {
          recursive: true,
          force: true,
        });
        // Create file.
        file.data &&
          fs.writeFileSync(`.tmp/${file.path}/${file.filename}`, file.data, {
            recursive: true,
            force: true,
          });
      } catch (err) {
        this.error = err;
        return;
      }
    });

    // Delete the temporary files if an error occurred.
    if (this.error) {
      fs.rmSync(".tmp", { recursive: true, force: true });
      return this.error;
    }

    // Stop here if dry run.
    if (dry) return this.error;

    // Move the temporary files to the correct location once they have been verified for accuracy.
    this.queue.forEach((file, i) => {
      if (this.error) {
        this.completed.forEach((file) => {
          fs.rmSync(`${file.path}/${file.filename}`, {
            recursive: true,
            force: true,
          });
        });
        return this.error;
      }
      try {
        // Check for dir and create if not exists.
        if (!fs.existsSync(file.path)) {
          this.createDir(file.path, {
            recursive: true,
            force: true,
          });
        }
        fs.renameSync(
          `.tmp/${file.path}/${file.filename}`,
          `./${file.path}/${file.filename}`
        );
        delete this.queue[i];
        this.completed.push(file);
      } catch (err) {
        this.error = err;
        return;
      }
    });

    // Delete the temp dir.
    fs.rmSync(".tmp", { recursive: true, force: true });

    return this.error;
  };

  return this;
};
