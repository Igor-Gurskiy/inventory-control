Ext.define("MyApp.store.Users", {
  extend: "Ext.data.Store",
  model: "MyApp.model.User",

  data: [{ username: "admin", password: "padmin" }],
});
