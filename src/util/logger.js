class Logger {
  static log(message) {
    let d = new Date();
    console.log(`\nTimestamp: ${d.toUTCString()}\n${message}`);
  }
}

module.exports = Logger;