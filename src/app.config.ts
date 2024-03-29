export default defineAppConfig({
  pages: [],
  // subpackages: [
  //   {
  //     name: 'sub',
  //     root: 'sub',
  //     pages: []
  //   }
  // ],
  window: {
    navigationBarTextStyle: "black"
  },
  networkTimeout: {
    request: 10000,
    connectSocket: 15000,
    uploadFile: 20000,
    downloadFile: 30000
  },
  resizable: true,
  requiredBackgroundModes: ["audio", "location"]
});