import { ipcRenderer,contextBridge } from "electron";
function printData(data, printer) {
  ipcRenderer.send("printData", { data, printer });
  let promiseResolve;
  const promise = new Promise(function (resolve, reject) {
    promiseResolve = resolve;
  });
  ipcRenderer.on("printDataComplete", (event, data) => {
    promiseResolve(data);
  });
  return promise;
}
contextBridge.exposeInMainWorld("printing", {
  printData,
});
