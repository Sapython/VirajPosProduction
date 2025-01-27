const { ipcRenderer } = require("electron");
const { contextBridge } = require("electron");

function printData(data, printer) {
  ipcRenderer.send("printData", { data, printer });
  // console.log("Sent data");
  var promiseResolve, promiseReject;
  var promise = new Promise(function (resolve, reject) {
    promiseResolve = resolve;
    promiseReject = reject;
  });
  ipcRenderer.on("printDataComplete", (event, data) => {
    // console.log("Done Printing", data);
    promiseResolve(data);
  });
  return promise;
}
contextBridge.exposeInMainWorld("printing", {
  printData,
});