const { ipcRenderer } = require("electron");
const { contextBridge } = require("electron");

// test
console.log("Value", ipcRenderer.sendSync("getPrinters"));
ipcRenderer.send("printData", {
  data: "Hello World",
  printer: "EPSON TM-T82 Receipt5",
});
ipcRenderer.on("printDataComplete", (event, data) => {
  console.log("Done Printing", data);
  // printData(event,data,printer)
});
// end test

function printData(data, printer) {
  ipcRenderer.send("printData", { data, printer });
  console.log("Sent data");
  var promiseResolve, promiseReject;
  var promise = new Promise(function (resolve, reject) {
    promiseResolve = resolve;
    promiseReject = reject;
  });
  ipcRenderer.on("printDataComplete", (event, data) => {
    console.log("Done Printing", data);
    promiseResolve(data);
  });
  return promise;
}
contextBridge.exposeInMainWorld("printing", {
  printData,
});
