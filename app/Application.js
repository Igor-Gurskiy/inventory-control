/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define("MyApp.Application", {
  extend: "Ext.app.Application",

  name: "MyApp",

  stores: ["Users"],

  launch: function () {
    this.showLoginWindow();
  },

  showLoginWindow: function () {
    this.loginWindow = Ext.create("MyApp.view.login.Login");
  },

  onLoginSuccess: function (user) {
    localStorage.setItem("MyAppLoggedIn", true);
    if (this.loginWindow) {
      this.loginWindow.close();
    }
    this.showMainView();
  },

  showMainView: function () {
    Ext.create({
      xtype: "app-main",
      renderTo: Ext.getBody(),
    });
  },
});
